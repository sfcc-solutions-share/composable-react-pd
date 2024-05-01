const SCAPI = require('*/cartridge/scripts/services/scapi')

/**
 * Get the SLAS auth token in the current session or fetch/refresh a new one
 *
 * @param {string} channelId the site ID; can be an empty string (but probably shouldn't)
 */
function getSLASAuthToken(channelId) {
    var tokenStore = session.privacy.slasTokens;
    if (!tokenStore) {
        tokenStore = {};
    } else {
        tokenStore = JSON.parse(tokenStore);
    }

    if (tokenStore[channelId]) {
        return tokenStore[channelId];
    }

    // TODO: refresh or timeout

    const svc = SCAPI.getSLASService()
    const result = svc.call({
        grant_type: "client_credentials",
        channel_id: channelId
    });

    if (!result.ok) {
        throw new Error("Error calling SLAS service: " + JSON.stringify(result.errorMessage))
    }

    tokenStore[channelId] = result.object
    //session.privacy.slasTokens = JSON.stringify(tokenStore);
    return result.object;
}
exports.getSLASAuthToken = getSLASAuthToken;
