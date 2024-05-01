/**
 * Provide post-processing support for headless component serialization
 *
 */

/**
 * Example of raw values (i.e. uses content asset link functions)
 * $url('Product-Show', 'pid', '25493602M')$
 * $url('Search-Show', 'cgid', 'mens')$
 * $url('Page-Show', 'cid', 'headlesspage2')$
 * $url('Page-Show', 'cid', 'about-us')$
 * $url('Search-Show', 'q', 'testing')$
 * https://www.google.com
 */

/**
 * @typedef {object} LinkStructure
 * @property {('PRODUCT'|'CATEGORY'|'PAGE'|'SEARCH'|'EXTERNAL')} type
 * @property {string[]} target
 */

// note this suffers from some trivial issues with certain target values
const LINK_RE = /\$url\('([\w-]+)'\s*,\s*'([\w]+)'\s*,\s*'([^']+)'\)\$/

/**
 * Process a raw string value into a link structure
 *
 * Uses a REGEX for simplicity
 *
 * @param {string} rawValue
 * @return {LinkStructure}
 */
function processLinkValue(rawValue) {
    if (!rawValue) {
        return
    }

    var match = rawValue.match(LINK_RE)
    if (match) {
        var controller = match[1]
        var param = match[2]
        var value = match[3]

        switch (controller) {
            case 'Search-Show':
                if (param === 'q') {
                    return {
                        type: 'SEARCH',
                        target: value
                    }
                } else {
                    return {
                        type: 'CATEGORY',
                        target: value
                    }
                }
            case 'Product-Show':
                return {
                    type: 'PRODUCT',
                    target: value
                }
            case 'Page-Show':
                return {
                    type: 'PAGE',
                    target: value
                }
        }
    }
    return {
        type: 'EXTERNAL',
        target: rawValue
    }
}

/**
 * Process image URLs to dis and unprocessed url values
 *
 * @param {function} callback custom serialize function whose result will be merged
 * @return {function(dw.experience.ComponentScriptContext): Object}
 */
function serializeHelper(callback) {
    callback = callback
        ? callback
        : function() {
              return {}
          }
    /**
     *  @param {dw.experience.ComponentScriptContext} context
     */
    var serializedHelperExec = function(context) {
        var result = {}
        context.content
            .entrySet()
            .toArray()
            .forEach(function(entry) {
                if (!entry.value) {
                    return;
                }
                if (entry.value.class === dw.experience.image.Image) {
                    var file = entry.value.file
                    if (
                        file.absURL
                            .toString()
                            .toLowerCase()
                            .endsWith('.svg')
                    ) {
                        // DIS cannot take SVGs but they are commonly places in an image attribute
                        // (this is bad for other reasons as a file type should be used instead)
                        result[entry.key] = {disBaseLink: file.absURL.toString()}
                    } else {
                        result[entry.key] = {
                            disBaseLink: entry.value.file
                                ? entry.value.file
                                      .getHttpsImageURL({quality: 80})
                                      .toString()
                                      .split('?')[0]
                                : null
                        }
                    }
                }
            })
        var metaDefinition = require('*/cartridge/experience/components/' +
            context.component.typeID.replace(/\./g, '/') +
            '.json')
        if (metaDefinition && metaDefinition.attribute_definition_groups) {
            for (var i = 0; i < metaDefinition.attribute_definition_groups.length; i++) {
                var group = metaDefinition.attribute_definition_groups[i]
                for (var ii = 0; ii < group.attribute_definitions.length; ii++) {
                    var attr = group.attribute_definitions[ii]
                    if (attr.type === 'url') {
                        result[attr.id] = processLinkValue(context.component.getAttribute(attr.id))
                    }
                }
            }
        }
        return Object.assign({}, result, callback(context))
    }
    return serializedHelperExec
}

module.exports = {
    processLinkValue: processLinkValue,
    serializeHelper: serializeHelper
}
