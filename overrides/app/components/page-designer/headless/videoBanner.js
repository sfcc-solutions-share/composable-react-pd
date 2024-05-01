import React from 'react'
import PropTypes from 'prop-types'
import {Box, Button, useMultiStyleConfig} from '@chakra-ui/react'
import {Link as RouteLink} from 'react-router-dom'
import {useUrlFromLink} from './helpers'

/**
 * @param {PDComponent} component
 * @return {JSX.Element}
 * @constructor
 */
function PDVideoBanner({component}) {
    const {text, buttonText, position, video} = component.data
    const {buttonLink} = component.custom
    const href = useUrlFromLink(buttonLink)
    const styles = useMultiStyleConfig('Banner', {variant: position})
    console.log(video)
    return (
        <Box width="100%">
            <Box __css={styles.banner} style={{position: 'relative'}}>
                <Box __css={styles.background}>
                    <video width={'100%'} autoPlay muted loop>
                        <source src={video} type="video/mp4" />
                    </video>
                </Box>
                <Box
                    __css={styles.contentContainer}
                    style={{
                        position: 'absolute',
                        top: '0',
                        left: '0',
                        width: '100%',
                        height: '100%'
                    }}
                >
                    <Box __css={styles.content}>
                        <Box __css={styles.contentText}>{text}</Box>
                        {buttonLink && (
                            <Button as={RouteLink} to={href}>
                                <span dangerouslySetInnerHTML={{__html: buttonText}}></span>
                            </Button>
                        )}
                    </Box>
                </Box>
            </Box>
        </Box>
    )
}

PDVideoBanner.propTypes = {
    component: PropTypes.object
}

export default PDVideoBanner
