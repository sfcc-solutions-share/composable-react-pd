const SCAPI = require('*/cartridge/scripts/services/scapi')
const SLASAuth = require('*/cartridge/scripts/slas/auth')

/**
 * This acts as a proxy to SCAPI services by translating requests into
 * properly formed SCAPI calls. Due to URL path handling in SFCC
 * we must have a pairing fetch facade on the frontend to form the URL into a header
 */
function Call() {
    // should only be accessible in BM context
    if (!session.userAuthenticated) {
        response.setStatus(403)
        return
    }

    response.setContentType('application/json')

    // proxy will be called post only
    const method = request.httpHeaders.get('x-original-method')
    const endpoint = request.httpHeaders.get('x-scapi-target')
    const svc = SCAPI.getSCAPIService()
    const query = request.httpQueryString

    var token = request.httpHeaders.get('authorization')

    if (!empty(request.httpParameterMap.requestBodyAsString)) {
        const body = JSON.parse(request.httpParameterMap.requestBodyAsString)

        var result = svc.call({
            method: method,
            endpoint: endpoint,
            query: query,
            body: body,
            token: token
        })
    } else {
        result = svc.call({
            method: method,
            endpoint: endpoint,
            query: query,
            token: token
        })
    }

    if (!result.ok) {
        response.setStatus(result.error)
        var errorMessage = result.errorMessage
        try {
            errorMessage = JSON.parse(result.errorMessage).error.message
        } catch (e) {
            // do nothing
        }
        response.getWriter().println(
            JSON.stringify(
                {
                    error: errorMessage
                },
                null,
                4
            )
        )
        return
    }
    if (result.object) {
        response.getWriter().println(JSON.stringify(result.object, null, 4))
    }
}

Call.public = true
exports.Call = Call

/**
 * Call SLAS private auth service and return an unusable access token.
 * This controller acts as a proxy to ensure the private client credentials
 * are retained in the service and the token is not usable in a storefront context
 */
function Auth() {
    // should only be accessible in BM context
    if (!session.userAuthenticated) {
        response.setStatus(403)
        return
    }

    var attempts = 0
    var token
    while (attempts < 5) {
        try {
            const channelId = request.httpParameterMap.get('channel_id').stringValue
            token = SLASAuth.getSLASAuthToken(channelId)
            break
        } catch(e) {
            attempts++
            dw.system.Logger.error(e)
            if (attempts === 4) {
                response.getWriter().println(JSON.stringify(null, null, 4))
            }
        }
    }
    // TODO send down signature-less token, store sig in session and recreate on call
    // (main issue is that the token is too big to store *entirely* in session)
    // token = token.access_token
    // // remove the signature from the jwt
    // var parts = token.split('.')
    // token = parts[0] + '.' + parts[1] + '.'
    // token += new dw.util.StringUtils(Array(parts[2].length + 1).join('0')).encodeBase64()
    response.getWriter().println(JSON.stringify(token, null, 4))
}

Auth.public = true
exports.Auth = Auth
