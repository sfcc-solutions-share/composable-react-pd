const URLUtils = require('dw/web/URLUtils')

/**
 * Return the context for composable commerce in page designer
 *
 * This will be rendered to the ISML template and available for the
 * composable page designer harness and finally pwa-kit
 *
 * @param {boolean} isEditMode - Whether the page is in edit mode
 * @param {boolean} isPreviewMode - Whether the page is in preview mode
 * @returns {Object} The context object
 */
exports.getHeadlessContext = function (isEditMode, isPreviewMode) {
    var shortCode = 'kv7kzm78'
    var orgId = 'f_ecom_abcd_001'
    var slasServiceCredential
    try {
        slasServiceCredential = dw.svc.LocalServiceRegistry.createService(
            'scapi.slas.private',
            {}
        ).getConfiguration().credential
    } catch (e) {
        throw new Error(
            'No scapi.slas.private service found; this is required for pwa-kit in page designer'
        )
    }

    // parse SHORT_CODE and ORG_ID from this url value
    // https://SHORT_CODE.api.commercecloud.salesforce.com/shopper/auth/v1/organizations/ORG_ID/oauth2/token
    var slasPrivateClientID = slasServiceCredential.user
    var url = slasServiceCredential.URL

    // TODO kinda hacky but we know these values need to be on this URL anyway
    shortCode = url.split('.')[0].split('https://')[1]
    orgId = url.split('organizations/')[1].split('/oauth2')[0]
    if (!shortCode || !orgId) {
        throw new Error('Invalid SLAS URL in scapi.slas.private credential')
    }

    var headlessLocale = request.locale
    if (headlessLocale === 'default') {
        headlessLocale = 'en-US'
    }
    if (headlessLocale.indexOf('_') === -1) {
        headlessLocale = 'en-US'
    }
    headlessLocale = headlessLocale.replace('_', '-')

    // preview time
    var currentDateTime = dw.system.Site.current.calendar.getTime().toISOString()
    // fractional seconds not supported
    currentDateTime = currentDateTime.substring(0, currentDateTime.indexOf('.')) + 'Z'

    return {
        siteID: dw.system.Site.current.ID,
        locale: headlessLocale,
        publicPath: URLUtils.httpsStatic('js/composable/').toString(),
        currentCurrency: session.currency.currencyCode,
        scapiProxyEndpoint: URLUtils.abs(
            new dw.web.URLAction('SCAPIProxy-Call', 'Sites-Site')
        ).toString(),

        clientId: slasPrivateClientID,
        shortCode: shortCode,
        orgId: orgId,

        currentDateTime: currentDateTime,
        customerGroupIds: session.customer.customerGroups.toArray().map((g) => g.ID),

        isEditMode: isEditMode,
        isPreviewMode: isPreviewMode
    }
}
