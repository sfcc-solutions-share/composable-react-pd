import React, {useState, useEffect} from 'react'
import {createRoot} from 'react-dom/client'
import CodeMirror from '@uiw/react-codemirror'
import {javascript} from '@codemirror/lang-javascript'
import {useLivePreviewPublisher} from './hooks'
import SLDSConfig from './components/slds'

/**
 * Editor for editing code; by default JSX style javascript
 *
 * Publishes live preview events
 *
 * @class CodeEditor
 * @classdesc JSXEditor
 * @constructor
 */
function CodeEditor({config, value}) {
    const [readOnly, setReadOnly] = useState(false)
    const [language, setLanguage] = useState(config?.language || 'javascript-jsx') // eslint-disable-line @typescript-eslint/no-unused-vars
    const livePreviewPublish = useLivePreviewPublisher(config.workerScript)
    const [editorContent, setEditorContent] = useState(value?.result || '')
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [validateJavascript, setValidateJavascript] = useState(
        config?.validateJavascript || false
    )
    const [error, setError] = useState(null)

    useEffect(() => {
        emit({
            type: 'sfcc:value',
            payload: {
                result: editorContent
            }
        })
        livePreviewPublish({
            result: editorContent
        })
    }, [editorContent])

    const contentValidate = (value) => {
        if (validateJavascript && value) {
            try {
                const func = new Function(value)
                func()
                setError(null)
            } catch (e) {
                setError(e.message)
            }
        }
    }

    useEffect(() => {
        subscribe('sfcc:disabled', (disabled) => {
            setReadOnly(disabled)
        })

        subscribe('sfcc:value', (value) => {
            if (value) {
                setEditorContent(value.code || value.result || '')
            }
        })
    }, [])

    const extensions = []
    switch (language) {
        case 'javascript-jsx':
            extensions.push(javascript({jsx: true}))
            break
        case 'javascript':
            extensions.push(javascript())
            break
    }

    return (
        <SLDSConfig>
            <div style={{backgroundColor: 'white', border: error ? '1px solid red' : 0}}>
                <CodeMirror
                    value={editorContent}
                    readOnly={readOnly}
                    extensions={extensions}
                    onChange={(value) => {
                        setEditorContent(value)
                        contentValidate(value)
                    }}
                />
                {error && (
                    <div style={{color: 'red'}}>
                        Javascript Error:
                        <br />
                        {error}
                    </div>
                )}
            </div>
        </SLDSConfig>
    )
}

subscribe('sfcc:ready', async ({config, value}) => {
    const container = document.createElement('div')
    container.style.backgroundColor = 'white'
    document.body.appendChild(container)
    const root = createRoot(container)
    root.render(<CodeEditor config={config} value={value} />)
})
