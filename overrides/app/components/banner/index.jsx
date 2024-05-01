import React from 'react'
import PropTypes from 'prop-types'

import {Box, useMultiStyleConfig} from '@chakra-ui/react'

/**
 * @param {string} background
 * @param children
 * @constructor
 */
export default function Banner({
    background,
    height,
    children,
    size,
    variant,
    backgroundX = 0.5,
    backgroundY = 0.5
}) {
    const styles = useMultiStyleConfig('Banner', {size, variant})
    const backgroundPosition = `${backgroundX * 100}% ${backgroundY * 100}%`

    return (
        <Box width="100%">
            <Box __css={styles.banner}>
                <Box
                    __css={styles.background}
                    style={{
                        backgroundImage: `url(${background})`,
                        height: height ? height + 'px' : '500px',
                        backgroundPosition
                    }}
                ></Box>
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
                        <Box>{children}</Box>
                    </Box>
                </Box>
            </Box>
        </Box>
    )
}

Banner.propTypes = {
    background: PropTypes.string,
    size: PropTypes.string,
    height: PropTypes.number,
    variant: PropTypes.string,
    children: PropTypes.node,
    backgroundX: PropTypes.number,
    backgroundY: PropTypes.number
}
