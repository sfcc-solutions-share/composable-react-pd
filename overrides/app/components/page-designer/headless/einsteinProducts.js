import React from 'react'
import PropTypes from 'prop-types'
import RecommendedProducts from '@salesforce/retail-react-app/app/components/recommended-products'
import {Box} from '@chakra-ui/react'

/**
 * @param {PDComponent} component
 * @return {JSX.Element}
 * @constructor
 */
function EinsteinProducts({component}) {
    const {recommender, heading} = component.data
    if (!recommender?.recommender) {
        return null
    }

    return (
        <Box mb={8}>
            <RecommendedProducts
                title={heading ? heading : ''}
                recommender={recommender.recommender}
            />
        </Box>
    )
}

EinsteinProducts.propTypes = {
    component: PropTypes.object
}

export default EinsteinProducts
