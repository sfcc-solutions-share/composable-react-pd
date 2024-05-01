import React from 'react'
import {Heading, Button, Circle, Link} from '@chakra-ui/react'
import {Link as RouteLink} from 'react-router-dom'

// Styles hardcoded for demonstrative purposes
export default function CTA({component}) {
    const {custom} = component
    const {ctaDisplayTitle, ctaType, ctaDescription, buttonText} = component.data

    const styles = {
        bannerLayout: {
            main: {
                padding: '27px 20px 34px 59px',
                backgroundColor: 'hsla(0,0%,100%,.85)',
                color: '#0b2335',
                maxWidth: '50%'
            },
            header: {
                paddingBottom: '5px',
                fontSize: '38px',
                lineHeight: '52px'
            }
        }
    }

    const mainStyles = styles[ctaType] && styles[ctaType]['main'] ? styles[ctaType]['main'] : {}
    const headStyles = styles[ctaType] && styles[ctaType]['header'] ? styles[ctaType]['header'] : {}
    
    const buttonMk = (buttonText)?<Button>{buttonText}</Button>:<></>


    return (
        <div style={mainStyles} className={ctaType}>
            <Heading as="h3" style={headStyles}>
                {ctaDisplayTitle}
            </Heading>
            <p>{ctaDescription}</p>

            {buttonMk}
        </div>
    )
}
