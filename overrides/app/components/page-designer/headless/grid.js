import React, {useContext} from 'react'
import PropTypes from 'prop-types'
import {Box, SimpleGrid, Skeleton, useStyleConfig} from '@chakra-ui/react'
import {PageDesignerComponent, useRegionEditorData} from '../tree'
import {PageDesignerContext} from '../support'

/**
 * @param {PDComponent} component
 * @return {JSX.Element}
 * @constructor
 */
function PDGrid({component}) {
    const {mobileColumns, tabletColumns, desktopColumns, spacing} = component.data
    const {editMode} = useContext(PageDesignerContext)
    var attributes = {}
    const styles = useStyleConfig('Grid')
    const mainRegion = component.regions[0]
    if (editMode) {
        // ok to disable this as this is only true or false per page
        // eslint-disable-next-line react-hooks/rules-of-hooks
        attributes = useRegionEditorData(mainRegion.id, editMode)
    }

    return (
        <div {...attributes}>
            {!mainRegion || !mainRegion.components ? (
                <Skeleton height="200" />
            ) : (
                <SimpleGrid
                    spacing={spacing}
                    columns={{base: mobileColumns, md: tabletColumns, lg: desktopColumns}}
                    sx={styles}
                >
                    {mainRegion.components.map((_component) => (
                        <Box key={_component.id}>
                            <PageDesignerComponent component={_component} />
                        </Box>
                    ))}
                </SimpleGrid>
            )}
        </div>
    )
}

PDGrid.propTypes = {
    component: PropTypes.object
}

export default PDGrid
