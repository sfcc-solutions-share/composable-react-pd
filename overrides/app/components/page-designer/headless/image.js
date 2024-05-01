import React from 'react'
import PropTypes from 'prop-types'
import {Img, useStyleConfig} from '@chakra-ui/react'

/**
 * @param {PDComponent} component
 * @return {JSX.Element}
 * @constructor
 */
function PDImage({component}) {
    const {image} = component.data
    Object.assign(image, component.custom.image)
    const styles = useStyleConfig('Image')
    return <Img src={image?.disBaseLink} sx={styles}></Img>
}

PDImage.propTypes = {
    component: PropTypes.object
}

export default PDImage
