'use strict'

var Template = require('dw/util/Template')
var HashMap = require('dw/util/HashMap')

/**
 * @param {dw.experience.ComponentScriptContext} context The Component script context object.
 * @returns {string} The template to be displayed
 */
module.exports.render = function(context) {
    var model = new HashMap()

    model._typeID = context.component.typeID

    return new Template('experience/components/headlessComponent').render(model).text
}

module.exports.serialize = function(context) { // eslint-disable-line no-unused-vars
    return {
    }
}
