import React from 'react'
import PropTypes from 'prop-types'
import {Box, Image, useMultiStyleConfig} from '@chakra-ui/react'

/**
 * @param {PDComponent} component
 * @return {JSX.Element}
 * @constructor
 */
function ContentCard({component}) {
    const {custom} = component
    const {text, heading, position} = component.data
    const {image} = custom
    const styles = useMultiStyleConfig('ContentCard', {variant: position})

    return (
        <Box __css={styles.container}>
            <Box __css={styles.imageContainer}>
                <Image src={image.disBaseLink} __css={styles.image} />
            </Box>
            <Box __css={styles.content}>
                <Box __css={styles.heading}>{heading}</Box>
                <Box __css={styles.text}>{text}</Box>
            </Box>
        </Box>
    )
}

ContentCard.propTypes = {
    component: PropTypes.object
}
export default ContentCard
