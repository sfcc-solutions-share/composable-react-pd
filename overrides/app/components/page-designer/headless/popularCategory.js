import React from 'react'
import PropTypes from 'prop-types'
import {Link, Image, Box, useMultiStyleConfig} from '@chakra-ui/react'
import {Link as RouteLink} from 'react-router-dom'

// Styles hardcoded for demonstrative purposes
function PopularCategory({component}) {
    const {catDisplayName, category} = component.data
    const {image} = component.custom
    const styles = useMultiStyleConfig('PopularCategory')

    return (
        <Box __css={styles.wrapper}>
            <Box as="h2" __css={styles.heading}>
                <Link as={RouteLink} to={`/category/${category}`}>
                    {catDisplayName}
                </Link>
            </Box>
            <Link as={RouteLink} to={`/category/${category}`} __css={styles.image}>
                <Image __css={styles.image} src={image.disBaseLink} />
            </Link>
        </Box>
    )
}

PopularCategory.propTypes = {
    component: PropTypes.object
}
export default PopularCategory
