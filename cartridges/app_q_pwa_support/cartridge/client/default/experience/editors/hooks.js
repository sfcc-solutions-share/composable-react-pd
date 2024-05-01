import {useCallback, useEffect, useRef, useState} from 'react'

/**
 * Return the component ID and attribute ID of this custom editor (if it exists)
 *
 * @returns {{componentId: string, attributeId: string}} The component ID and current attribute ID
 */
export function useComponent() {
    // https://zzpq-018.dx.commercecloud.salesforce.com/on/demandware.store/Sites-Site/default/ViewLdsBusinessManagerScreen-PageDesigner/#/edit/page/landing/component/3713fda24f2212dcb984d3e195
    const href = window.top.location?.href

    // this is pretty hacky as PD doesn't provide a way to get the current editors attribute ID
    // TODO: why does parentIFrame work but window.frameElement not?
    var attributeId = null
    const frameEl = window.parentIFrame
    if (frameEl) {
        let frameId = frameEl.getId()
        attributeId = window.top.document
            .getElementById(frameId)
            ?.parentElement?.getAttribute('data-automation-attribute')
    }

    const componentId = href?.split('/').pop()
    // parse component ID from href url
    return {componentId, attributeId}
}

function debounce(func, timeout = 300) {
    let timer
    return (...args) => {
        clearTimeout(timer)
        timer = setTimeout(() => {
            func.apply(this, args)
        }, timeout)
    }
}

/**
 * returns a publish function to send live preview updates of the
 * current custom editors data to the component in the PD canvas (if it is listening)
 *
 * @param {string} workerScript The path to the worker script
 * @returns {(data: object) => void} The publish function
 */
export function useLivePreviewPublisher(workerScript) {
    const {componentId, attributeId} = useComponent()
    const [editorState, setEditorState] = useState(null)
    const componentWorker = useRef(new SharedWorker(workerScript, {name: 'componentWorker'}))

    if (!workerScript) {
        console.warn('workerScript is not defined; this is required for live preview')
    }

    const debouncedPostMessage = useCallback(
        debounce((data) => {
            componentWorker.current.port.postMessage({
                componentId,
                attributeId,
                data
            })
        }, 300),
        [componentWorker.current]
    )
    useEffect(() => {
        if (editorState) {
            debouncedPostMessage(editorState)
        }
    }, [editorState])

    useEffect(() => {
        window.onunload = () => {
            // reset in case user did not save
            componentWorker.current.port.postMessage({
                componentId,
                attributeId,
                __reset: true
            })
        }
    }, [])

    return (data) => {
        setEditorState(data)
    }
}
