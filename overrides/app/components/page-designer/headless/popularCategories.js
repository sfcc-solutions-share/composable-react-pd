import React from 'react'
import PropTypes from 'prop-types'
import {PageDesignerRegion} from '../tree'
import {Box, SimpleGrid, useMultiStyleConfig} from '@chakra-ui/react'

function PopularCategories({component}) {
    const {textHeadline, mobileColumns = 2, tabletColumns = 3, desktopColumns = 6} = component.data
    const categoriesRegion = component.regions[0]
    const styles = useMultiStyleConfig('PopularCategories')
    return (
        <Box mb="8" __css={styles.wrapper}>
            <Box as="h2" __css={styles.heading}>
                {textHeadline}
            </Box>

            <div style={{width: '100%'}}>
                <PageDesignerRegion
                    region={categoriesRegion}
                    wrapper={SimpleGrid}
                    columns={{
                        base: mobileColumns,
                        sm: mobileColumns,
                        lg: tabletColumns,
                        xl: desktopColumns
                    }}
                    spacing="8"
                />
            </div>
        </Box>
    )
}

PopularCategories.propTypes = {
    component: PropTypes.object
}
export default PopularCategories
