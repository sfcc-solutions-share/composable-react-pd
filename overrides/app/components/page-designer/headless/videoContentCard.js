import React from 'react'
import PropTypes from 'prop-types'
import {Box, useMultiStyleConfig} from '@chakra-ui/react'

/**
 * @param {PDComponent} component
 * @return {JSX.Element}
 * @constructor
 */
function VideoContentCard({component}) {
    const {text, heading, position, video} = component.data
    const styles = useMultiStyleConfig('ContentCard', {variant: position})

    return (
        <Box __css={styles.container}>
            <Box __css={styles.imageContainer}>
                <video width={'100%'} autoPlay muted loop>
                    <source src={video} type="video/mp4" />
                </video>
            </Box>
            <Box __css={styles.content}>
                <Box __css={styles.heading}>{heading}</Box>
                <Box __css={styles.text}>{text}</Box>
            </Box>
        </Box>
    )
}

VideoContentCard.propTypes = {
    component: PropTypes.object
}
export default VideoContentCard
