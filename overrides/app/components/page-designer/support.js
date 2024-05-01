import React from 'react'
import PropTypes from 'prop-types'
import ImageWithTitle from './headless/imageWithTitle'
import PopularCategories from './headless/popularCategories'
import PopularCategory from './headless/popularCategory'
import ThreeColumn from './headless/layout/3column'
import PDBanner from './headless/banner'
import {Box} from '@chakra-ui/react'
import SectionHeader from './headless/sectionHeader'
import EinsteinProducts from './headless/einsteinProducts'
import ContentCard from './headless/contentCard'
import PDProductScroller from './headless/productScroller'
import RawJSX from './headless/rawJSX'
import PDGrid from './headless/grid'
import PDImage from './headless/image'
import PDProductTile from './headless/productTile'
import PDVideoBanner from './headless/videoBanner'
import VideoContentCard from './headless/videoContentCard'

// component registry
// these are the react implemented types of the PD components
// they should know how to render themselves and their children (i.e. regions)
export const COMPONENTS = {
    'headless.imageWithTitle': ImageWithTitle,
    'headless.banner': PDBanner,
    'headless.popularCategories': PopularCategories,
    'headless.popularCategory': PopularCategory,
    'headless.3column': ThreeColumn,
    'headless.sectionHeader': SectionHeader,
    'headless.einsteinProducts': EinsteinProducts,
    'headless.productScroller': PDProductScroller,
    'headless.contentCard': ContentCard,
    'headless.rawJSX': RawJSX,
    'headless.grid': PDGrid,
    'headless.image': PDImage,
    'headless.productTile': PDProductTile,
    'headless.videoBanner': PDVideoBanner,
    'headless.videoContentCard': VideoContentCard
}

/**
 * Page Designer Context provides runtime information about the state of the PD page
 * in page designer or headless context
 */
export const PageDesignerContext = React.createContext({
    // debug component tree
    debug: false,
    // is PD preview? (can we know this?)
    preview: false,
    // is in PD edit mode?
    editMode: false
})

/**
 * Component context provides runtime information about the nearst component parent
 * @type {React.Context<{component: null}>}
 */
export const ComponentContext = React.createContext({
    component: null
})

export class PDErrorBoundary extends React.Component {
    constructor(props) {
        super(props)
        this.state = {hasError: false}
        this.type = props.type
    }

    static getDerivedStateFromError(error) {
        return {hasError: true, error: error}
    }

    componentDidCatch(error, errorInfo) {
        console.error(error, errorInfo)
    }

    render() {
        if (this.state.hasError) {
            // You can render any custom fallback UI
            return (
                <Box color="white" fontSize="large" backgroundColor="red" style={{padding: '50px'}}>
                    {this.type} could not be initialized. Be sure to set required fields.
                    <br />
                    <pre>{this.state.error ? this.state.error.message : 'Unknown error'}</pre>
                </Box>
            )
        }

        return this.props.children
    }

    static propTypes = {
        type: PropTypes.string,
        children: PropTypes.node
    }
}
