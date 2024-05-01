var LocalServiceRegistry = require('dw/svc/LocalServiceRegistry')

/**
 * Return a service to make SLAS private token calls
 * @return {dw.svc.HTTPService}
 */
function getSLASService() {
    return LocalServiceRegistry.createService('scapi.slas.private', {
        /**
         * @param {dw.svc.HTTPService} svc
         * @param {dw.net.HTTPClient} client
         * @return {object}
         */
        parseResponse: function (svc, client) {
            return JSON.parse(client.text)
        },
        filterLogMessage(msg) {
            return msg
        },
        mockCall: function () {}
    })
}

/**
 * Return a service to make SCAPI calls on behalf of a client
 * @return {dw.svc.HTTPFormService}
 */
function getSCAPIService() {
    return LocalServiceRegistry.createService('scapi.shopper', {
        /**
         * @param {dw.svc.HTTPService} svc
         * @param {object} params
         */
        createRequest(svc, params) {
            svc.setAuthentication('NONE')
            svc.setURL(svc.URL + params.endpoint + '?' + params.query)
            // TODO contains Bearer right now
            svc.addHeader('Authorization', params.token)
            svc.setRequestMethod(params.method)

            if (params.body) {
                // TODO: do we ever need a non-JSON request in SCAPI shopper?
                return JSON.stringify(params.body)
            }
        },
        /**
         * @param {dw.svc.HTTPService} svc
         * @param {dw.net.HTTPClient} client
         * @return {object}
         */
        parseResponse: function (svc, client) {
            return JSON.parse(client.text)
        },
        filterLogMessage(msg) {
            return msg
        },
        mockCall: function () {}
    })
}

module.exports = {
    getSLASService: getSLASService,
    getSCAPIService: getSCAPIService
}
