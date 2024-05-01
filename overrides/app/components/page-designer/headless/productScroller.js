import React from 'react'
import PropTypes from 'prop-types'
import {Box} from '@chakra-ui/react'
import ProductScroller from '@salesforce/retail-react-app/app/components/product-scroller'
import {useProducts} from '@salesforce/commerce-sdk-react'

/**
 * @param {PDComponent} component
 * @return {JSX.Element}
 * @constructor
 */
function PDProductScroller({component}) {
    const {products, heading} = component.data

    const {data: _products, isLoading} = useProducts(
        {parameters: {ids: products}},
        {
            select: (data) => {
                // The downstream components ProductScroller and ProductTile are expecting einstein
                // and "product hit" shaped objects; so we need to transform
                return data?.data?.map((product) => ({
                    ...product,
                    productId: product.id,
                    image: product?.imageGroups?.[0]?.images?.[0],
                    hitType: 'product'
                }))
            }
        }
    )

    return (
        <Box mb={8}>
            <ProductScroller
                title={heading ? heading : ''}
                products={_products}
                isLoading={isLoading}
                productTileProps={() => ({
                    enableFavourite: false
                })}
            />
        </Box>
    )
}

PDProductScroller.propTypes = {
    component: PropTypes.object
}
export default PDProductScroller
