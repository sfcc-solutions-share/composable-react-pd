import React from 'react'
import PropTypes from 'prop-types'
import {ProductTileDynamic} from '../../product-tile-dynamic'

/**
 * @param {PDComponent} component
 * @return {JSX.Element}
 * @constructor
 */
function PDProductTile({component}) {
    const {product} = component.data
    return <ProductTileDynamic pid={product} />
}

PDProductTile.propTypes = {
    component: PropTypes.object
}
export default PDProductTile
