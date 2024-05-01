import React from 'react'
import PropTypes from 'prop-types'
import {Box, useMultiStyleConfig} from '@chakra-ui/react'

/**
 * @param {PDComponent} component
 * @return {JSX.Element}
 * @constructor
 */
function SectionHeader({component, size}) {
    const {heading, subheading} = component.data
    const styles = useMultiStyleConfig('SectionHeader', {size})

    return (
        <Box __css={styles.container}>
            <Box as="h2" __css={styles.heading}>
                {heading}
            </Box>
            {subheading && (
                <Box as="p" __css={styles.subheading}>
                    {subheading}
                </Box>
            )}
        </Box>
    )
}

SectionHeader.propTypes = {
    component: PropTypes.object,
    size: PropTypes.string
}
export default SectionHeader
