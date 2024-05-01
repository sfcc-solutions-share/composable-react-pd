import React from 'react'
import {Heading, Circle, Link} from '@chakra-ui/react'
import {Link as RouteLink} from 'react-router-dom'

// Styles hardcoded for demonstrative purposes
export default function oldCTA({component}) {
    const {custom} = component
    const {ctaDisplayTitle, ctaDescription, buttonText} = component.data

    return (
        <>
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                <Heading as="h3" fontSize="md">
                    {ctaDisplayTitle}
                </Heading>
                <p>{ctaDescription}</p>

                <Button>{buttonText}</Button>
            </div>
        </>
    )
}
