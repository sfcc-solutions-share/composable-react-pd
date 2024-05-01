import React, {useContext} from 'react'
import PropTypes from 'prop-types'
import {Heading, Text} from '@chakra-ui/react'
import {Textarea} from '@chakra-ui/react'
import {
    PDErrorBoundary
} from './support'
import {
    PageDesignerRegions
} from './tree'
import {Helmet} from 'react-helmet'
import {getConfig} from '@salesforce/pwa-kit-runtime/utils/ssr-config'

/**
 * @typedef PDPage
 * @property {string} id
 * @property {object} data
 * @property {object} custom
 * @property {PDRegion[]} regions
 */

function getConfigText(config) {
    return `module.exports = ${JSON.stringify(config, null, 2)}`
}

/**
 * Implements a PageDesigner page in react
 *
 * Will delegate the regions/components of the page to other components by identifier
 * composing similar to platform page designer
 * @param {PDPage} page - PageDesigner structure
 *
 * @constructor
 */
export default function PageDesignerPage({page}) {
    return (
        <>
            {page.custom && page.custom.pageTitle && (
                <Helmet>
                    <title>{page.custom.pageTitle}</title>
                </Helmet>
            )}
            <PDErrorBoundary type="page">
                <PageDesignerRegions regions={page.regions} />
            </PDErrorBoundary>
        </>
    )
}
PageDesignerPage.propTypes = {
    page: PropTypes.object,
    debug: PropTypes.bool,
    preview: PropTypes.bool,
    editMode: PropTypes.bool
}
