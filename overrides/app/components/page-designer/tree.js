/* eslint-disable react/prop-types,jsx-a11y/anchor-is-valid */
import React, {useContext, useState} from 'react'
import {
    ComponentContext,
    COMPONENTS,
    PageDesignerContext,
    PDErrorBoundary
} from './support'
import {
    withLivePreview,
    withThemeOverrides,
    withContainerStyles
} from './headless/helpers'
import PropTypes from 'prop-types'

/**
 * @typedef PDComponent
 * @property {string} id
 * @property {object} data
 * @property {object} custom
 * @property {string} typeId
 * @property {PDRegion[]} regions
 */

/**
 * @typedef PDRegion
 * @property {string} id
 * @property {PDComponent[]} components
 */

export function Hider({data}) {
    const [show, setShow] = useState(false)

    return (
        <div>
            <a
                href={'#'}
                style={{color: 'blue', cursor: 'pointer'}}
                onClick={() => {
                    setShow(!show)
                    return false
                }}
            >
                Show/Hide Data
            </a>
            <br />
            {show && <pre>{JSON.stringify(data, null, 2)}</pre>}
        </div>
    )
}

Hider.propTypes = {
    data: PropTypes.object
}

/**
 *
 * @param {PDComponent} component
 * @param editMode
 * @return {{}}
 */
function useComponentEditorData(component, editMode) {
    if (editMode) {
        var hypenTypeId = component.typeId.replace('.', '-')
        return {
            className: `experience-component experience-${hypenTypeId}`,
            'data-sfcc-pd-component-info': JSON.stringify({
                id: component.id,
                render_state: 'SUCCESS',
                render_info: {
                    render_script_time: 1,
                    render_time: 1
                },
                exception: null,
                type: component.typeId,
                name: component.typeId,
                localized: true
            }),
            'data-allow-select': 'true',
            'data-allow-move': 'true',
            'data-allow-delete': 'true',
            'data-item-id': `component|${component.id}`
        }
    } else {
        return {}
    }
}

export function useRegionEditorData(region, editMode) {
    const {component} = useContext(ComponentContext)
    if (editMode) {
        return {
            className: `experience-region experience-${region.id}`,
            'data-sfcc-pd-region-info': JSON.stringify({
                id: region.id,
                render_state: 'SUCCESS',
                render_info: {
                    render_time: 1
                },
                exception: null
            }),
            'data-allow-drop': 'true',
            'data-item-id': component
                ? `region|${region.id}|${component.id}`
                : `region|${region.id}`,
            style: {
                minHeight: '50px',
                minWidth: '50px'
            }
        }
    } else {
        return {}
    }
}

/**
 *
 * @param {PDComponent} component
 * @return {*}
 * @constructor
 */
export function PageDesignerComponent({component}) {
    var ComponentClass = COMPONENTS[component.typeId]
    const {editMode} = useContext(PageDesignerContext)

    var attributes = {}
    if (editMode) {
        // ok to disable this as this is only true or false per page load
        // eslint-disable-next-line react-hooks/rules-of-hooks
        attributes = useComponentEditorData(component, editMode)
    }

    if (ComponentClass) {
        ComponentClass = withLivePreview(withContainerStyles(withThemeOverrides(ComponentClass)))
        return (
            <div {...attributes}>
                <ComponentContext.Provider
                    value={{
                        component: component
                    }}
                >
                    <PDErrorBoundary type="component">
                        <ComponentClass component={component} />
                    </PDErrorBoundary>
                </ComponentContext.Provider>
            </div>
        )
    } else {
        throw new Error(`COMPONENT ${component.typeId} not found`)
    }
}

/**
 *
 * @param {PDRegion} region
 * @constructor
 */
export function PageDesignerRegion({region, wrapper, ...rest}) {
    const {editMode} = useContext(PageDesignerContext)

    var attributes = {}
    if (editMode) {
        // ok to disable this as this is only true or false per page
        // eslint-disable-next-line react-hooks/rules-of-hooks
        attributes = useRegionEditorData(region, editMode)
    }

    var Wrapper = wrapper ? wrapper : 'div'

    return (
        <div {...attributes}>
            {region.components && (
                <Wrapper {...rest}>
                    {region.components.map((component) => (
                        <div key={component.id}>
                            <PageDesignerComponent component={component} />
                        </div>
                    ))}
                </Wrapper>
            )}
        </div>
    )
}

/**
 *
 * @param {PDRegion[]} regions
 * @constructor
 */
export function PageDesignerRegions({regions, wrapper, ...rest}) {
    if (!regions) {
        return null
    }

    var Wrapper = wrapper ? wrapper : 'div'

    return (
        <>
            {regions.map((region) => (
                <Wrapper key={region.id} {...rest}>
                    <PageDesignerRegion region={region} />
                </Wrapper>
            ))}
        </>
    )
}
