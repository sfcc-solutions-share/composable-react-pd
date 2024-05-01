import React from 'react'
import {Heading, Button, Circle, Link} from '@chakra-ui/react'
import {Link as RouteLink} from 'react-router-dom'

// Styles hardcoded for demonstrative purposes
export default function CTAWImg({component}) {
    const {custom} = component
    const {ctaDisplayTitle, ctaDescription, image, ctaType, ctaSubHeader, buttonText} = component.data
    const {imageUrl, buttonLink} = custom

    const styles= {
        "default": {
            'main': {
                'padding': '24px',
                'display':'flex',
                'flexFlow': 'column nowrap',
                'justifyContent': 'center',
                'alignItems': 'center'
            },
            'subDiv': {
                'display':'flex',
                'flexFlow': 'column nowrap',
                'justifyContent': 'center',
                'alignItems': 'center'
            },
            'header': {
                'paddingBottom': '5px',
                'fontSize': '28px',
                'lineHeight': '40px'
            }
            
        },
        'altListLayout': {
            'main': {
                'padding': '48px 0',
                'display':'flex',
                'flexFlow': 'row nowrap',
                'justifyContent': 'flex-start',
                'alignItems': 'center'
            },
            'subDiv': {
                'display':'flex',
                'flexFlow': 'column nowrap',
                'justifyContent': 'center',
                'alignItems': 'flex-start',
                'padding': '0 48px',
                'maxWidth': '50%'
            },
            'subHeader': {

            },
            'header': {
                'paddingBottom': '5px',
                'fontSize': '38px',
                'lineHeight': '52px'
            }
        },
        'altListLayout2': {
            'main': {
                'padding': '48px 0',
                'display':'flex',
                'flexFlow': 'row-reverse nowrap',
                'justifyContent': 'flex-start',
                'alignItems': 'center'
            },
            'subDiv': {
                'display':'flex',
                'flexFlow': 'column nowrap',
                'justifyContent': 'center',
                'alignItems': 'flex-start',
                'padding': '0 48px',
                'maxWidth': '50%'
            },
            'subHeader': {

            },
            'header': {
                'paddingBottom': '5px',
                'fontSize': '38px',
                'lineHeight': '52px'
            }
        }
    }


    const mainStyles = (styles[ctaType] && styles[ctaType]['main'] )? styles[ctaType]['main']:{}
    const subStyles = (styles[ctaType] && styles[ctaType]['subDiv'] )? styles[ctaType]['subDiv']:{}
    const headStyles = (styles[ctaType] && styles[ctaType]['header'] )? styles[ctaType]['header']:{}
    const subHeadStyles = (styles[ctaType] && styles[ctaType]['subHeader'] )? styles[ctaType]['subHeader']:{}

    const ctaSubHeaderMk = (ctaSubHeader)?<Heading as="h3" fontSize="sm" style={subHeadStyles}>{ctaSubHeader}</Heading>:<></>
    return (
        <>
            <div style={mainStyles}>
                <img src={custom ? custom.imageUrl : image.path} style={{maxWidth: '50%'}} />
                <div style={subStyles}>
                    {ctaSubHeaderMk}
                    <Heading as="h3" fontSize="md" style={headStyles}>
                        {ctaDisplayTitle}
                    </Heading>
                    <p>{ctaDescription}</p>
                    <Button>{buttonText}</Button>
                </div>
            </div>
        </>
    )
}
