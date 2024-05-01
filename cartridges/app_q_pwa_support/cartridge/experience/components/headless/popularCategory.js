'use strict'

var Template = require('dw/util/Template')
var HashMap = require('dw/util/HashMap')

var headlessComponentHelper = require('*/cartridge/experience/utilities/headlessComponentHelper')

/**
 * Render logic for headless.imageWithTitle component.
 * @param {dw.experience.ComponentScriptContext} context The Component script context object.
 * @returns {string} The template to be displayed
 */
module.exports.render = function(context) {
    var model = new HashMap()
    var content = context.content

    model.image = content.image.file.url
    model.text = content.text
    model._typeID = context.component.typeID

    return new Template('experience/components/headlessComponent').render(model).text
}

module.exports.serialize = headlessComponentHelper.serializeHelper()
