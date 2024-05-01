import React from 'react'

import {PageDesignerRegion} from '../tree'
import {Heading, Center} from '@chakra-ui/react'

import styles from './CTAContainer.css'

if (typeof window !== 'undefined') {
    document.head.insertAdjacentHTML('beforeend', `<style>${styles.toString()}</style>`)
}

export default function CTAContainer({component}) {
    const {textHeadline, ctaType} = component.data
    const CTARegions = component.regions[0]

    const styles = {
        default: {
            main: {display: 'flex', flexFlow: 'row nowrap'}
        },
        altListLayout: {
            main: {
                display: 'flex',
                flexFlow: 'column nowrap'
            }
        }
    }
    const mainStyles = styles[ctaType] && styles[ctaType]['main'] ? styles[ctaType]['main'] : {}
    const subStyles = styles[ctaType] && styles[ctaType]['subDiv'] ? styles[ctaType]['subDiv'] : {}

    return (
        <div className={`ctaContainer ${ctaType}`}>
            testing this
            <PageDesignerRegion region={CTARegions} wrapper={'div'} style={mainStyles} />
        </div>
    )
}
 