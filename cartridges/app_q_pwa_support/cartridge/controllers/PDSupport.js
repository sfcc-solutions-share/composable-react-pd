/**
 * This controller is necessary to support providing the BM static
 * asset path for the shared worker script as the headless page
 * in page designer renders in the Site context not BM context.
 *
 * While this file is nothing insecure we still restrict the controller
 * to BM users only like other controllers in this cartridge as it is
 * only useful with an active BM session
 */
function GetSharedWorkerUrl() {
    // should only be accessible in BM context
    if (!session.userAuthenticated) {
        response.setStatus(403)
        return
    }
    response.setContentType('text/plain')
    response.writer.print(dw.web.URLUtils.staticURL('js/sharedworker.js').toString())
}
GetSharedWorkerUrl.public = true;
exports.GetSharedWorkerUrl = GetSharedWorkerUrl;
