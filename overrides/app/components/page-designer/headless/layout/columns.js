import React from 'react'
import PropTypes from 'prop-types'
import {Box, SimpleGrid} from '@chakra-ui/react'
import {PageDesignerComponent} from '../../tree'

/**
 *
 * @param {PDComponent} component
 * @return {JSX.Element}
 * @constructor
 */
export default function Columns({component}) {
    const {numColumns} = component.data
    const mainRegion = component.regions[0]

    return (
        <Box mb="8">
            <SimpleGrid columns={numColumns} spacing={10}>
                {mainRegion.components &&
                    mainRegion.components.map((c) => (
                        <Box key={c.id}>
                            <PageDesignerComponent component={c} />
                        </Box>
                    ))}
            </SimpleGrid>
        </Box>
    )
}
Columns.propTypes = {
    component: PropTypes.object
}
