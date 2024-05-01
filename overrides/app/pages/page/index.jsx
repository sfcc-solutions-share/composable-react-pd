import React, {useEffect} from 'react'
import PropTypes from 'prop-types'

// Components
import {Box} from '@chakra-ui/react'

// Project Components
import Seo from '@salesforce/retail-react-app/app/components/seo'
import PageDesignerPage from '../../components/page-designer'

//Hooks
import useEinstein from '@salesforce/retail-react-app/app/hooks/use-einstein'
import {useLocation, useParams} from 'react-router-dom'
import {usePage} from '@salesforce/commerce-sdk-react'
import {HTTPError, HTTPNotFound} from '@salesforce/pwa-kit-react-sdk/ssr/universal/errors'

const Page = () => {
    const einstein = useEinstein()
    const {pathname} = useLocation()

    const {pageId} = useParams()
    const {data: page, error, isLoading} = usePage({parameters: {pageId}})

    if (error) {
        let ErrorClass = error.response?.status === 404 ? HTTPNotFound : HTTPError
        throw new ErrorClass(error.response?.statusText)
    }

    /**************** Einstein ****************/
    useEffect(() => {
        einstein.sendViewPage(pathname)
    }, [])

    return (
        <Box layerStyle="page">
            <Seo title={page?.custom?.pageTitle || 'Page'} description="" keywords="" />

            {!isLoading && page && <PageDesignerPage page={page} />}
        </Box>
    )
}

Page.getTemplateName = () => 'page'

Page.shouldGetProps = ({previousLocation, location}) =>
    !previousLocation || previousLocation.pathname !== location.pathname

Page.getProps = async ({res, api, params}) => {
    const {pageId} = params
    if (res) {
        // res.set('Cache-Control', 'max-age=31536000')
    }

    const page = await api.shopperExperience.getPage({
        parameters: {
            pageId: pageId
        }
    })

    return {
        page
    }
}

Page.propTypes = {
    /**
     * The search result object showing all the product hits, that belong
     * in the supplied category.
     */
    productSearchResult: PropTypes.object,
    page: PropTypes.object,
    /**
     * The current state of `getProps` when running this value is `true`, otherwise it's
     * `false`. (Provided internally)
     */
    isLoading: PropTypes.bool
}

export default Page
