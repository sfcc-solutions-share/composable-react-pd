/* eslint-disable jsx-a11y/label-has-associated-control */
import React, {useState, useEffect} from 'react'
import {createRoot} from 'react-dom/client'
import {useLivePreviewPublisher} from './hooks'
import SLDSConfig from './components/slds'
import {ColorPicker} from '@salesforce/design-system-react'

function BoxEditor({top, right, bottom, left, onChange}) {
    return (
        <div className="slds-grid slds-gutters">
            <div className="slds-col">
                Top:{' '}
                <input
                    type="text"
                    width={10}
                    className="slds-input"
                    value={top || ''}
                    onChange={(e) => {
                        onChange({
                            top: e.target.value,
                            right,
                            bottom,
                            left
                        })
                    }}
                />
            </div>
            <div className="slds-col">
                Right:{' '}
                <input
                    type="text"
                    width={10}
                    className="slds-input"
                    value={right || ''}
                    onChange={(e) => {
                        onChange({
                            top,
                            right: e.target.value,
                            bottom,
                            left
                        })
                    }}
                />
            </div>
            <div className="slds-col">
                Bot:{' '}
                <input
                    type="text"
                    width={10}
                    className="slds-input"
                    value={bottom || ''}
                    onChange={(e) => {
                        onChange({
                            top,
                            right,
                            bottom: e.target.value,
                            left
                        })
                    }}
                />
            </div>
            <div className="slds-col">
                Left:{' '}
                <input
                    type="text"
                    width={10}
                    className="slds-input"
                    value={left || ''}
                    onChange={(e) => {
                        onChange({
                            top,
                            right,
                            bottom,
                            left: e.target.value
                        })
                    }}
                />
            </div>
        </div>
    )
}

/**
 * Edit various container and common styles
 *
 * Publishes live preview events
 *
 * @param {Object} config - configuration object
 * @param {Object} config.workerScript - path to shared worker script for live preview
 * @constructor
 */
function StyleEditor({config, value}) {
    const [readOnly, setReadOnly] = useState(false) // eslint-disable-line @typescript-eslint/no-unused-vars
    const livePreviewPublish = useLivePreviewPublisher(config.workerScript)
    const [attrs, setAttrs] = useState(value || {})
    const [breakPoint, setBreakpoint] = useState('base') // eslint-disable-line @typescript-eslint/no-unused-vars

    useEffect(() => {
        emit({
            type: 'sfcc:value',
            payload: attrs
        })
        livePreviewPublish(attrs)
    }, [attrs])

    subscribe('sfcc:disabled', (disabled) => {
        setReadOnly(disabled)
    })

    subscribe('sfcc:value', (value) => {
        if (value) {
            setAttrs(value)
        }
    })

    return (
        <SLDSConfig>
            <div>
                <div className="slds-form-element slds-p-vertical--x-small">
                    <label className="slds-form-element__label">Padding</label>
                    <div className="slds-form-element__control">
                        <BoxEditor
                            top={attrs.padding?.top || ''}
                            right={attrs.padding?.right || ''}
                            bottom={attrs.padding?.bottom || ''}
                            left={attrs.padding?.left || ''}
                            onChange={(padding) => {
                                setAttrs({
                                    ...attrs,
                                    padding
                                })
                            }}
                        />
                    </div>
                </div>
                <div className="slds-form-element slds-p-vertical--x-small">
                    <label className="slds-form-element__label">Margin</label>
                    <div className="slds-form-element__control">
                        <BoxEditor
                            top={attrs.margin?.top || ''}
                            right={attrs.margin?.right || ''}
                            bottom={attrs.margin?.bottom || ''}
                            left={attrs.margin?.left || ''}
                            onChange={(margin) => {
                                setAttrs({
                                    ...attrs,
                                    margin
                                })
                            }}
                        />
                    </div>
                </div>
                <div className="slds-form-element slds-p-vertical--x-small">
                    <ColorPicker
                        labels={{label: 'Background Color'}}
                        value={attrs.backgroundColor || ''}
                        events={{
                            onChange: (e, data) => {
                                setAttrs({
                                    ...attrs,
                                    backgroundColor: data.color
                                })
                            }
                        }}
                    />
                </div>
                <div className="slds-form-element slds-p-vertical--x-small">
                    <ColorPicker
                        labels={{label: 'Text Color (will not override component colors)'}}
                        value={attrs.textColor || ''}
                        events={{
                            onChange: (e, data) => {
                                setAttrs({
                                    ...attrs,
                                    textColor: data.color
                                })
                            }
                        }}
                    />
                </div>
            </div>
        </SLDSConfig>
    )
}

subscribe('sfcc:ready', async ({config, value}) => {
    const container = document.createElement('div')
    container.style.backgroundColor = 'white'
    document.body.appendChild(container)
    const root = createRoot(container)
    root.render(<StyleEditor config={config} value={value} />)
})
