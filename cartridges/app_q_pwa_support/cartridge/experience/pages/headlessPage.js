var Template = require('dw/util/Template')
var HashMap = require('dw/util/HashMap')
var PageRenderHelper = require('*/cartridge/experience/utilities/PageRenderHelper.js')
var HeadlessContextHelper = require('*/cartridge/experience/utilities/headlessContextHelper.js')
var SLASAuth = require('*/cartridge/scripts/slas/auth')

/**
 * Render logic for the storepage.
 *
 * @param {dw.experience.PageScriptContext} context The page script context object.
 * @param {dw.util.Map} [modelIn] Additional model values created by another cartridge. This will not be passed in by Commcerce Cloud Plattform.
 *
 * @returns {string} The markup to be displayed
 */
module.exports.render = function (context, modelIn) {
    var model = modelIn || new HashMap()

    var page = context.page
    model.page = page
    model.content = context.content

    // automatically register configured regions
    model.regions = PageRenderHelper.getRegionModelRegistry(page)
    model.isEditMode = PageRenderHelper.isInEditMode()
    model.isPreviewMode = request.httpQueryString.indexOf('PREVIEW') > 0

    if (PageRenderHelper.isInEditMode()) {
        var HookManager = require('dw/system/HookMgr')
        HookManager.callHook('app.experience.editmode', 'editmode')
        model.resetEditPDMode = true
    }

    model.headlessContext = HeadlessContextHelper.getHeadlessContext(
        PageRenderHelper.isInEditMode(),
        request.httpQueryString.indexOf('PREVIEW') > 0
    )

    // ensure we don't render slas token outside of page designer (i.e. in a storefront context)
    if (PageRenderHelper.isInEditMode()) {
        var attempts = 0
        while (attempts < 5) {
            try {
                const channelId = dw.system.Site.current.ID
                model.slasToken = SLASAuth.getSLASAuthToken(channelId)
                break
            } catch (e) {
                attempts++
                dw.system.Logger.error(e)
                if (attempts === 4) {
                    model.slasToken = null
                }
            }
        }
    }


    return new Template('experience/pages/headlessPage').render(model).text
}

module.exports.serialize = function (context) {
    return {
        pageTitle: context.page.pageTitle ? context.page.pageTitle : ''
    }
}
