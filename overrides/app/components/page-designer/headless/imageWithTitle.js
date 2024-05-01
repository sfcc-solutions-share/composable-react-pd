import React from 'react'
import PropTypes from 'prop-types'
import {Button, Link} from '@chakra-ui/react'
import Banner from '../../banner'
import {useUrlFromLink} from './helpers'

/**
 * DO NOT USE THIS COMPONENT; IT'S ONLY HERE AS IT WAS THE ORIGINAL TEST COMPONENT
 * USE BANNER INSTEAD
 *
 * @param {PDComponent} component
 * @return {JSX.Element}
 * @constructor
 */
export default function ImageWithTitle({component}) {
    const {custom} = component
    const {text, buttonText} = component.data
    const {imageUrl, buttonLink} = custom
    const href = useUrlFromLink(buttonLink)

    return (
        <Banner background={imageUrl}>
            <div dangerouslySetInnerHTML={{__html: text}} />
            {buttonLink && (
                <Button as={Link} href={href}>
                    {buttonText}
                </Button>
            )}
        </Banner>
    )
}
ImageWithTitle.propTypes = {
    component: PropTypes.object
}
