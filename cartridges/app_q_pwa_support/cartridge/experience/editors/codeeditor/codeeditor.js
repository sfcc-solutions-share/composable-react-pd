/**
 * @param {dw.experience.CustomEditor} editor The custom editor object
 */
module.exports.init = function(editor){
    editor.configuration.put(
        'workerScript',
        dw.web.URLUtils.httpsStatic('js/sharedworker.js').toString()
    )
}
