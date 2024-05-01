import {createRoot} from 'react-dom/client'
import React, {Suspense} from 'react'
import {jwtDecode} from 'jwt-decode'

// observe attribute additions until we see a particular slector
function waitForElm(selector, timeout) {
    return new Promise((resolve) => {
        if (document.querySelector(selector)) {
            return resolve(document.querySelector(selector))
        }

        var timer = setTimeout(() => {
            observer.disconnect()
            resolve()
        }, timeout)
        const observer = new MutationObserver(() => {
            if (document.querySelector(selector)) {
                resolve(document.querySelector(selector))
                observer.disconnect()
                clearTimeout(timer)
            }
        })

        observer.observe(document.body, {
            subtree: true,
            attributes: true
        })
    })
}

// this harness is NOT isomorphic
const {fetch: originalFetch} = window

/**
 * Using BM as a proxy can result in the web tier rejecting requests (500 Transmission Problem)
 * This class throttles via concurrency and a token bucket to ensure only a maximum amount of requests
 * are issued per second.
 */
class FetchThrottler {
    constructor(maxConcurrentRequests = 2, maxRequestsPerSecond = 4) {
        this.maxConcurrentRequests = maxConcurrentRequests
        this.maxRequestsPerSecond = maxRequestsPerSecond

        this.activeRequests = 0
        this.pendingRequests = []
        this.tokens = this.maxRequestsPerSecond

        // Sets up a replenishment of tokens every second
        setInterval(() => {
            this.tokens = maxRequestsPerSecond
            this.processQueue()
        }, 1000)
    }

    /**
     *
     * @param {URL|string} url
     * @param {RequestInit} options
     * @return {Promise<Response>}
     */
    fetch(url, options) {
        return new Promise((resolve, reject) => {
            const fetchMethod = async () => {
                if (this.tokens > 0) {
                    this.tokens--
                    this.activeRequests++

                    try {
                        const resp = await originalFetch(url, options)
                        resolve(resp)
                    } catch (e) {
                        reject(e)
                    } finally {
                        this.activeRequests--
                        this.processQueue()
                    }
                } else {
                    this.pendingRequests.push(fetchMethod)
                }
            }

            if (this.activeRequests < this.maxConcurrentRequests) {
                fetchMethod()
            } else {
                this.pendingRequests.push(fetchMethod)
            }
        })
    }

    processQueue() {
        while (
            this.activeRequests < this.maxConcurrentRequests &&
            this.pendingRequests.length &&
            this.tokens > 0
        ) {
            const nextFetch = this.pendingRequests.shift()
            nextFetch()
        }
    }
}

const fetchThrottler = new FetchThrottler(3, 5)
// monkey patch fetch for our commerce API proxy
window.fetch = async (url, options = {}) => {
    if (url.includes('__scapi_proxy__')) {
        let proxyUrl = window._headlessContext.scapiProxyEndpoint
        let originalUrl = new URL(url)
        let targetPath = originalUrl.pathname.substring(
            originalUrl.pathname.indexOf('__scapi_proxy__') + 15
        )
        let proxiedUrl = new URL(proxyUrl)
        proxiedUrl.search = originalUrl.searchParams.toString()
        let headers = {
            'x-scapi-target': targetPath,
            'x-original-method': options?.method ?? 'GET',
            ...options?.headers
        }

        const response = await fetchThrottler.fetch(proxiedUrl, {
            ...options,
            headers,
            method: 'POST',
            credentials: 'same-origin'
        })
        return response
    } else {
        return await originalFetch(url, options)
    }
}

/**
 * @param {string} jwt
 * @return {{isGuest: boolean, customerId: *, usid: *}}
 */
function parseSlasJWT(jwt) {
    const payload = jwtDecode(jwt)
    const {sub, isb} = payload

    if (!sub || !isb) {
        throw new Error('Unable to parse access token payload: missing sub and isb.')
    }

    // ISB format
    // 'uido:ecom::upn:Guest||xxxEmailxxx::uidn:FirstName LastName::gcid:xxxGuestCustomerIdxxx::rcid:xxxRegisteredCustomerIdxxx::chid:xxxSiteIdxxx',
    const isbParts = isb.split('::')
    const isGuest = isbParts[1] === 'upn:Guest'
    const customerId = isGuest ? isbParts[3].replace('gcid:', '') : isbParts[4].replace('rcid:', '')
    // SUB format
    // cc-slas::zzrf_001::scid:c9c45bfd-0ed3-4aa2-xxxx-40f88962b836::usid:b4865233-de92-4039-xxxx-aa2dfc8c1ea5
    const usid = sub.split('::')[3].replace('usid:', '')
    return {
        isGuest,
        customerId,
        usid
    }
}

// Lazy load both for code-splitting/performance and to ensure harness setup (i.e. fetch shim, etc) is
// done first; also to send a shopper-context call to ensure it lands before any other shopper calls
const PageDesignerPageContainer = React.lazy(async () => {
    // set context before loading the pwa-kit container
    const appConfig = window.__CONFIG__
    const organizationId = appConfig.app.commerceAPI.parameters.organizationId
    const accessToken = window._slasToken?.access_token
    const {usid} = parseSlasJWT(accessToken)

    await fetch(
        `https://example.com/__scapi_proxy__/shopper/shopper-context/v1/organizations/${organizationId}/shopper-context/${usid}?siteId=${window._headlessContext.siteID}`,
        {
            method: 'PUT',
            body: JSON.stringify(window._shopperContext),
            headers: {
                'content-type': 'application/json',
                authorization: `Bearer ${accessToken}`
            }
        }
    )

    var resp = await fetch(
        `https://example.com/__scapi_proxy__/shopper/shopper-context/v1/organizations/${organizationId}/shopper-context/${usid}?siteId=${window._headlessContext.siteID}`,
        {
            method: 'GET',
            headers: {
                'content-type': 'application/json',
                authorization: `Bearer ${accessToken}`
            }
        }
    )
    const body = await resp.json()
    console.log('Shopper Context Verification', body)
    return import(
        '../../../../../../overrides/app/components/page-designer/pageDesignerPageContainer'
    )
})
// preload
import('../../../../../../overrides/app/components/page-designer/pageDesignerPageContainer')

const context = window._headlessContext

// necessary for pwa-kit to work
window.Progressive = {
    buildOrigin: window._headlessContext.publicPath
}
window.__CONFIG__ = {
    app: {
        url: {},
        defaultSite: context.siteID,
        sites: [
            {
                id: context.siteID,
                l10n: {
                    supportedCurrencies: [context.currentCurrency],
                    defaultCurrency: context.currentCurrency,
                    defaultLocale: context.locale,
                    supportedLocales: [
                        {
                            id: context.locale,
                            preferredCurrency: context.currentCurrency
                        }
                    ]
                }
            }
        ],
        commerceAPI: {
            proxyPath: `__scapi_proxy__`,
            parameters: {
                clientId: context.clientId,
                organizationId: context.orgId,
                shortCode: context.shortCode,
                siteId: context.siteID
            }
        },
        einsteinAPI: {
            host: 'https://api.cquotient.com',
            proxyPath: `/mobify/proxy/einstein`,
            einsteinId: '1ea06c6e-c936-4324-bcf0-fada93f83bb1',
            siteId: 'aaij-MobileFirst',
            isProduction: false
        }
    }
}

window._shopperContext = {
    effectiveDateTime: context.currentDateTime,
    customerGroupIds: context.customerGroupIds
}

window.addEventListener('DOMContentLoaded', () => {
    // TODO send preflight shopper-context while PD is loading

    // wait for PD to insert the item metadata so we can annotate the react components for interactive use
    // wait max 3 seconds
    waitForElm('[data-item-id]').then(() => {
        // wait for PD rendering to clear
        setTimeout(() => {
            const element = document.getElementById('headless-page-render-target')
            const root = createRoot(element)
            const props = {
                page: window._serializedPage,
                editMode: window._isEditMode,
                preview: window._isPreviewMode,
                themePage: window._themePage,
                debug: false,
                fetchedToken: window._slasToken?.access_token,
                appConfig: window.__CONFIG__
            }
            root.render(
                <Suspense
                    fallback={
                        <h1>
                            <center>Loading...</center>
                        </h1>
                    }
                >
                    <PageDesignerPageContainer {...props} />
                </Suspense>
            )
        }, 100)
    }, 3000)
})
