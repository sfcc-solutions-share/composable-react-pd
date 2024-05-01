import React from 'react'
import {useProducts} from '@salesforce/commerce-sdk-react'
import ProductTile, {Skeleton} from '@salesforce/retail-react-app/app/components/product-tile'
import PropTypes from 'prop-types'
import {Box} from '@chakra-ui/react'

export function ProductTileDynamic({pid}) {
    const {data: _products, isLoading} = useProducts(
        {
            parameters: {
                ids: [pid],
                allImages: true
            }
        },
        {
            enabled: Boolean([pid]),
            // product tile wants a "hit"
            select: (result) =>
                result?.data?.map((product) => {
                    return {
                        ...product,
                        productId: product.id,
                        image: product?.imageGroups?.[0]?.images?.[0],
                        hitType: 'product'
                    }
                })
        }
    )

    if (isLoading || !_products || _products.length === 0) {
        return (
            <Box maxW="500px">
                <Skeleton />
            </Box>
        )
    }

    return <ProductTile product={_products[0]} />
}

ProductTileDynamic.propTypes = {
    pid: PropTypes.string
}
