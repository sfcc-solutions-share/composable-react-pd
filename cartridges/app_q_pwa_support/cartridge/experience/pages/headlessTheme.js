var Template = require('dw/util/Template');
var HashMap = require('dw/util/HashMap');
var PageRenderHelper = require('*/cartridge/experience/utilities/PageRenderHelper.js');
var HeadlessContextHelper = require('*/cartridge/experience/utilities/headlessContextHelper.js')

/**
 * Render logic for the storepage.
 *
 * @param {dw.experience.PageScriptContext} context The page script context object.
 * @param {dw.util.Map} [modelIn] Additional model values created by another cartridge. This will not be passed in by Commcerce Cloud Plattform.
 *
 * @returns {string} The markup to be displayed
 */
module.exports.render = function (context, modelIn) {
    var model = modelIn || new HashMap();

    var page = context.page;
    model.page = page;
    model.content = context.content;

    // automatically register configured regions
    model.regions = PageRenderHelper.getRegionModelRegistry(page);
    model.isEditMode = PageRenderHelper.isInEditMode();
    model.isPreviewMode = request.httpQueryString.indexOf('PREVIEW') > 0;

    if (PageRenderHelper.isInEditMode()) {
        var HookManager = require('dw/system/HookMgr');
        HookManager.callHook('app.experience.editmode', 'editmode');
        model.resetEditPDMode = true;
    }

    model.headlessContext = HeadlessContextHelper.getHeadlessContext(
        PageRenderHelper.isInEditMode(),
        request.httpQueryString.indexOf('PREVIEW') > 0
    )

    return new Template('experience/pages/headlessPage').render(model).text;
};

module.exports.serialize = function(context) {
    return {
        // site title is the title of this theme page
        siteTitle: context.page.pageTitle ? context.page.pageTitle : ''
    }
}
