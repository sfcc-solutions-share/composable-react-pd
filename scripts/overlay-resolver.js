const path = require('path')
const fs = require('fs')

/**
 * Implements b2c cartridge-like overlays for webpack and pwa-kit.
 * This plugin works complementary to webpack aliases and pwa-kit v3.
 * It resolves requests for itself or the special import syntax '*' to find the parent of the current
 * file in the overlay chain (or an empty export if this is the terminal file).
 * It also resolves special cases like _app, ssr, routes, etc that are not handled
 * by aliasing to the overlays.
 *
 * @example
 * // import from the *next* in the overlay-chain (i.e. similar to module.superModule)
 * import Something from '@salesforce/retail-react-app/app/utils/something'
 * import Something from '*'
 *
 * @class OverlayResolverPlugin
 */
class OverlayResolverPlugin {
    /**
     *
     * @param options
     * @param {string} options.appBase path to application base
     * @param {string} options.prefix package prefix to support resolution of parents
     * @param {string[]} options.overlays paths to overlays
     */
    constructor(options) {
        this.base = options.base || '.'
        this.base = path.resolve(this.base)
        this.prefix = options.prefix || '@salesforce/retail-react-app'
        this.overlays = options.overlays || []
        this._allSearchDirs = this.overlays
            .map((o) => path.join(path.resolve(o)))
            .concat([this.base])
    }

    /**
     *
     * @param requestPath
     * @param target
     * @param {[]} extensions
     */
    findFile(requestPath, dirs, extensions) {
        // TODO search all overlay extensions of requested file
        var fileExt = path.extname(requestPath)
        for (var dir of dirs) {
            var base = path.join(dir, requestPath)
            if (fileExt) {
                if (fs.existsSync(base)) {
                    return base
                }
            } else {
                // TODO this is technically not how we should find index
                // see resolver plugin docs
                if (fs.existsSync(base) && fs.lstatSync(base).isDirectory()) {
                    base = path.join(base, 'index')
                }
                for (var ext of extensions) {
                    if (fs.existsSync(base + ext)) {
                        return base + ext
                    }
                }
            }
        }
    }

    /**
     *
     */
    toOverlayRelative(p) {
        var overlay = this.findOverlay(p)
        return p.substring(overlay.length + 1)
    }

    findOverlay(p) {
        return this._allSearchDirs.find((overlay) => {
            return p.indexOf(overlay) === 0
        })
    }

    isAppBaseRelative(p) {
        return p && p.indexOf(path.join(this.base, 'app')) === 0
    }

    /**
     * Check if the request is for the parent of the issuer; i.e. the same
     * module in a parent overlay or the base app
     * @param request
     * @param issuer
     * @return {boolean}
     */
    isRequestingSelf(request, issuer, validExtensions) {
        if (!issuer || !this.findOverlay(issuer)) {
            return false
        }
        const fullyQualified = path.join(this.prefix, this.toOverlayRelative(issuer))
        const validParents = [fullyQualified]
        // if fullyqualified filename is index then get the directory form
        // TODO right now we only support override files with the same extension; it might be
        // valid to support all extensions of the webpack configuration
        if (path.basename(fullyQualified, path.extname(fullyQualified)) === 'index') {
            validParents.push(path.dirname(fullyQualified))
        }
        // add extensionless filename to validparents
        if (path.extname(fullyQualified)) {
            validParents.push(fullyQualified.replace(path.extname(fullyQualified), ''))
        }
        if (request === '*' || validParents.includes(request)) {
            //console.log('requesting self', request, validParents)
            return true
        }

        return false
    }

    apply(resolver) {
        resolver.getHook('resolve').tapAsync(
            'FeatureResolverPlugin',
            function (requestContext, resolveContext, callback) {
                // exact match * means import the "parent" (superModule) of the requesting module
                if (
                    this.isRequestingSelf(
                        requestContext.request,
                        requestContext.context.issuer,
                        resolver.options.extensions
                    )
                ) {
                    console.log('requestingSelf')
                    const overlayRelative = this.toOverlayRelative(requestContext.context.issuer)
                    const overlay = this.findOverlay(requestContext.context.issuer)
                    const searchOverlays = this._allSearchDirs.slice(
                        this._allSearchDirs.indexOf(overlay) + 1
                    )
                    var targetFile = this.findFile(
                        overlayRelative,
                        searchOverlays,
                        resolver.options.extensions
                    )
                    if (!targetFile) {
                        targetFile = path.resolve(__dirname, 'null.js')
                    }
                    const target = resolver.ensureHook('resolved')
                    requestContext.path = targetFile
                    resolver.doResolve(
                        target,
                        requestContext,
                        `${this.constructor.name} found parent`,
                        resolveContext,
                        callback
                    )
                } else if (
                    requestContext.request &&
                    requestContext.path &&
                    requestContext.path.includes('node_modules') &&
                    this.isAppBaseRelative(requestContext.request)
                ) {
                    // SPECIAL CASE
                    // external dependency requiring app code (app-config, app, ssr, etc)
                    // these do not work with the normal @salesforce/ prefix and therefore do
                    // not search via alias; so we have to search the overlays explicitly
                    // since these currently only come from node_module dependencies we only
                    // enter here if it's a node_module
                    let overlayRelative = this.toOverlayRelative(requestContext.request)
                    let targetFile, target
                    try {
                        targetFile = this.findFile(
                            overlayRelative,
                            this._allSearchDirs,
                            resolver.options.extensions
                        )
                        if (targetFile) {
                            target = resolver.ensureHook('resolved')
                            requestContext.path = targetFile
                            resolver.doResolve(
                                target,
                                requestContext,
                                `${this.constructor.name} found base override file`,
                                resolveContext,
                                callback
                            )
                        } else {
                            return callback()
                        }
                    } catch (e) {
                        return callback()
                    }
                } else {
                    callback()
                }
            }.bind(this)
        )
    }
}

module.exports = OverlayResolverPlugin
