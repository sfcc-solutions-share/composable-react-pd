/**
 * Init for the recommender selector custom editor
 *
 * Initialises the custom attribute editor with server side information such as URLs
 * or in this case the  client ID the Business Manager uses, so the client can request all recommenders
 *
 * @param {dw.experience.CustomEditor} editor The custom editor object
 */

const Site = require('dw/system/Site');

module.exports.init = function (editor) {
    editor.configuration.put('clientid', request.httpHeaders.get('x-dw-client-id'));
    editor.configuration.put('siteid', Site.getCurrent().ID);
};
