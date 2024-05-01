import React from 'react'
import PropTypes from 'prop-types'
import {Box, Button, useMultiStyleConfig} from '@chakra-ui/react'
import {Link as RouteLink} from 'react-router-dom'
import {useUrlFromLink} from './helpers'
import Banner from '../../banner'

/**
 * @param {PDComponent} component
 * @return {JSX.Element}
 * @constructor
 */
function PDBanner({component}) {
    const {text, buttonText, position, image} = component.data
    const {buttonLink} = component.custom
    Object.assign(image, component.custom.image)
    const href = useUrlFromLink(buttonLink)
    const styles = useMultiStyleConfig('Banner', {variant: position})
    // {x: 0.5, y: 0.5}
    const focalPoint = image.focalPoint
    return (
        <Banner
            background={image?.disBaseLink}
            variant={position}
            height={image?.metaData?.height}
            backgroundX={focalPoint.x}
            backgroundY={focalPoint.y}
        >
            <Box __css={styles.contentText}>{text}</Box>
            {buttonLink && (
                <Button as={RouteLink} to={href}>
                    <span dangerouslySetInnerHTML={{__html: buttonText}}></span>
                </Button>
            )}
        </Banner>
    )
}

PDBanner.propTypes = {
    component: PropTypes.object
}

export default PDBanner
