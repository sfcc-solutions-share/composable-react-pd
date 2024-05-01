import React from 'react'
import PropTypes from 'prop-types'
import {Box, SimpleGrid} from '@chakra-ui/react'
import {PageDesignerComponent} from '../../tree'
import {withLivePreview, withThemeOverrides} from '../helpers'

/**
 *
 * @param {PDComponent} component
 * @return {JSX.Element}
 * @constructor
 */
function ThreeColumn({component}) {
    const mainRegion = component.regions[0]

    return (
        <Box mb="8">
            <SimpleGrid columns={{sm: 1, md: 1, lg: 3}} spacing={{sm: 0, md: 0, lg: 10}}>
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

ThreeColumn.propTypes = {
    component: PropTypes.object
}

export default withLivePreview(withThemeOverrides(ThreeColumn))
