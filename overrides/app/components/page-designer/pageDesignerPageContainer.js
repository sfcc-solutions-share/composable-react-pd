import {keysToCamel} from '@salesforce/retail-react-app/app/utils/utils'
import PropTypes from 'prop-types'
import React, {useEffect, useMemo} from 'react'
import {
    ShopperBaskets,
    ShopperContexts,
    ShopperCustomers,
    ShopperExperience,
    ShopperGiftCertificates,
    ShopperLogin,
    ShopperOrders,
    ShopperProducts,
    ShopperPromotions,
    ShopperSearch
} from 'commerce-sdk-isomorphic'
import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import {
    AuthContext,
    CommerceApiContext,
    ConfigContext
} from '@salesforce/commerce-sdk-react/provider'
import {ServerContext} from '@salesforce/pwa-kit-react-sdk/ssr/universal/contexts'
import {MultiSiteProvider} from '@salesforce/retail-react-app/app/contexts'
import {MemoryRouter, Route, Switch} from 'react-router-dom'
import App from '@salesforce/retail-react-app/app/components/_app'
import Auth from '@salesforce/commerce-sdk-react/auth'
import routes from '../../routes'
import {
    PageDesignerContext
} from './support'
import theme from '@salesforce/retail-react-app/app/theme'
import {ChakraProvider} from '@salesforce/retail-react-app/app/components/shared/ui'

/**
 * Provides an Auth class that simply parses the fetched token for local use; all
 * other auth functions are provided via the server
 */
class PrivateClientAuth extends Auth {
    constructor(config) {
        super(config)
        this.config = config
        this.pendingToken = null
        this.fetchedToken = config.fetchedToken
    }

    async ready() {
        // We should always have the fetched token on page load
        if (this.fetchedToken && this.fetchedToken !== '') {
            const {isGuest, customerId, usid} = this.parseSlasJWT(this.fetchedToken)
            this.set('access_token', this.fetchedToken)
            this.set('customer_id', customerId)
            this.set('usid', usid)
            this.set('customer_type', isGuest ? 'guest' : 'registered')
            return this.data
        }
        return
    }
}

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: false,
            refetchOnWindowFocus: false,
            staleTime: 10 * 1000
        },
        mutations: {
            retry: false
        }
    }
})

/**
 * Wraps the shopper-experience SDK to load pages provided by PD script APIs
 *
 * This ensures the current (and potentially unpublished) state of the page
 * is loaded in the page designer interface.
 */
class PDShopperExperience extends ShopperExperience {
    constructor(config, currentPage) {
        super(config)
        this.config = config
        this.currentPage = currentPage
    }

    async getPage(options) {
        const pageId = options.parameters.pageId
        if (pageId === this.currentPage.id) {
            console.log(`Loading page designer page ${pageId}`)
            return this.currentPage
        }

        return super.getPage(options)
    }
}

/**
 * Provide a Site Container to Wrap a Page Designer Page
 * Used specifically for PD's interface, not PWA itself
 *
 * Dependencies of this module will be included in the page designer harness but not
 * necessarily in pwa-kit
 *
 * @param {PDPage} page the current page
 * @param {boolean} preview preview mode enabled
 * @param {Object} appConfig
 * @param {string} fetchedToken
 * @returns {JSX.Element}
 * @constructor
 */
export default function PageDesignerPageContainer({page, preview, appConfig, fetchedToken}) {
    // pwa API helpers use this on API response so we need to match that
    const convertedPage = keysToCamel(page)

    const pageId = page.id

    const buildUrl = (u) => u

    // there will always be 1 site with 1 locale
    const siteID = appConfig.app.defaultSite
    const defaultSite = appConfig.app.sites.find((s) => s.id === siteID)
    const currency = defaultSite.l10n.defaultCurrency
    const localeID = defaultSite.l10n.defaultLocale

    const shortCode = appConfig.app.commerceAPI.parameters.shortCode
    const organizationId = appConfig.app.commerceAPI.parameters.organizationId

    const config = {
        // A fixed string is used to mark the proxy requests as we must handle the
        // proxy requests uniquely in formatting for the controller
        proxy: 'https://' + window.location.host + '/__scapi_proxy__',
        parameters: {
            shortCode,
            organizationId,
            siteId: siteID,
            locale: localeID,
            currency
        },
        throwOnBadResponse: true
    }

    const apiClients = useMemo(() => {
        return {
            shopperBaskets: new ShopperBaskets(config),
            shopperContexts: new ShopperContexts(config),
            shopperCustomers: new ShopperCustomers(config),
            shopperExperience: new PDShopperExperience(config, convertedPage),
            shopperGiftCertificates: new ShopperGiftCertificates(config),
            shopperLogin: new ShopperLogin(config),
            shopperOrders: new ShopperOrders(config),
            shopperProducts: new ShopperProducts(config),
            shopperPromotions: new ShopperPromotions(config),
            shopperSearch: new ShopperSearch(config)
        }
    }, [localeID, currency])

    const auth = useMemo(() => {
        return new PrivateClientAuth({
            shortCode,
            organizationId,
            fetchedToken,
            siteId: siteID,
            clientId: appConfig.app.commerceAPI.parameters.clientId,
            proxy: 'https://' + window.location.host + '/__scapi_proxy__'
        })
    }, [])

    // Initialize the session
    useEffect(() => void auth.ready(), [auth])

    // initialize react router to load the current page being edited
    // load the homepage route if we match the implicit home page name
    const currentRoute = pageId === `pwa-homepage-${siteID}` ? '/' : `/page/${pageId}`

    return (
        <PageDesignerContext.Provider
            value={{
                preview: preview,
                // edit mode is true because we're in page designer: always when this module is used
                editMode: true
            }}
        >
            <QueryClientProvider client={queryClient}>
                <ConfigContext.Provider
                    value={{
                        siteId: siteID,
                        locale: localeID,
                        currency
                    }}
                >
                    <CommerceApiContext.Provider value={apiClients}>
                        <AuthContext.Provider value={auth}>
                            <ServerContext.Provider value={{}}>
                                <MultiSiteProvider
                                    site={defaultSite}
                                    locale={{id: localeID}}
                                    buildUrl={buildUrl}
                                >
                                    <ChakraProvider theme={theme}>
                                        <MemoryRouter
                                            initialEntries={[currentRoute]}
                                            getUserConfirmation={() => !!preview}
                                        >
                                            <App>
                                                <Switch>
                                                    {routes().map((route, i) => {
                                                        const {
                                                            component: Component,
                                                            ...routeProps
                                                        } = route
                                                        return (
                                                            <Route key={i} {...routeProps}>
                                                                <Component />
                                                            </Route>
                                                        )
                                                    })}
                                                </Switch>
                                            </App>
                                        </MemoryRouter>
                                    </ChakraProvider>
                                </MultiSiteProvider>
                            </ServerContext.Provider>
                        </AuthContext.Provider>
                    </CommerceApiContext.Provider>
                </ConfigContext.Provider>
            </QueryClientProvider>
        </PageDesignerContext.Provider>
    )
}

PageDesignerPageContainer.propTypes = {
    page: PropTypes.object,
    siteID: PropTypes.string,
    locale: PropTypes.string,
    preview: PropTypes.bool,
    appConfig: PropTypes.object,
    fetchedToken: PropTypes.string
}
