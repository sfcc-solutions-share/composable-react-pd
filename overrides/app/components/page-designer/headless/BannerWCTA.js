import React from 'react'
import {PageDesignerRegion} from '../tree'
import {Heading, Button, Circle, Link} from '@chakra-ui/react'
import {Link as RouteLink} from 'react-router-dom'

// Styles hardcoded for demonstrative purposes
export default function BannerWCTA({component}) {
    const {custom} = component
    const {image} = component.data
    const {imageUrl} = custom
    const bgImg = (custom) ? custom.imageUrl : image.path
    const CTARegions = component.regions[0]
    const styleCSS = {
        backgroundImage: `url(${bgImg})`,
        backgroundSize: 'cover',
        paddingLeft: '30px',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        minHeight: '454px'
    }
    return (
            <div style={styleCSS}>                
            <PageDesignerRegion
                    region={CTARegions}
                    wrapper={'div'}
                    style={{display: 'flex', alignItems: 'flex-start', justifyContent: 'space-around'}}
                />
            </div>
            
        
    )
}
