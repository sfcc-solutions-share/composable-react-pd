import React, {useEffect, useState} from 'react'
import * as Icons from '@salesforce/retail-react-app/app/components/icons'

import {Global} from '@emotion/react'
import JsxParser from 'react-jsx-parser' // eslint-disable-line @typescript-eslint/no-unused-vars

import {
    ChakraProvider,
    extendTheme,
    Box,
    Button,
    ButtonGroup,
    Heading,
    Text,
    Container,
    Center,
    Square,
    Circle,
    Flex,
    Spacer,
    List,
    ListItem,
    ListIcon,
    OrderedList,
    UnorderedList,
    AspectRatio,
    Stack,
    HStack,
    VStack,
    Image,
    Grid,
    GridItem,
    SimpleGrid,
    Wrap,
    WrapItem,
    Badge,
    Divider,
    Stat,
    StatLabel,
    StatNumber,
    StatHelpText,
    StatArrow,
    StatGroup,
    Alert,
    AlertIcon,
    AlertTitle,
    AlertDescription,
    Accordion,
    AccordionItem,
    AccordionButton,
    AccordionPanel,
    AccordionIcon,
    Tabs,
    TabList,
    TabPanels,
    Tab,
    TabPanel,
    Link,
    LinkBox,
    LinkOverlay,
    Avatar,
    AvatarBadge,
    AvatarGroup,
    useTheme,
    TableContainer,
    Table,
    Thead,
    Tbody,
    Th,
    Td,
    Tr,
    TableCaption
} from '@chakra-ui/react'
import {Link as RouteLink} from 'react-router-dom'
import useMultiSite from '@salesforce/retail-react-app/app/hooks/use-multi-site'
import PropTypes from 'prop-types'
import htm from 'htm'
import Banner from '../../banner'

/**
 * Translate b2c link structure to our internal urls
 * @param {LinkStructure} linkStruct
 * @return {string}
 */
export function useUrlFromLink(linkStruct) {
    const {buildUrl} = useMultiSite()

    switch (linkStruct?.type) {
        case 'CATEGORY':
            return buildUrl(`/category/${linkStruct.target}`)
        case 'SEARCH':
            return buildUrl(`/search?q=${linkStruct.target}`)
        case 'PRODUCT':
            return buildUrl(`/product/${linkStruct.target}`)
        case 'PAGE':
            return buildUrl(`/page/${linkStruct.target}`)
        case 'EXTERNAL':
            return linkStruct.target
    }
    return null
}

/**
 *
 * @param children
 * @param {LinkStructure} linkStruct
 */
export function B2CLink({children, linkStruct}) {
    const linkTarget = useUrlFromLink(linkStruct)
    if (!linkTarget) {
        return null
    }

    return (
        <Link as={RouteLink} to={linkTarget} borderRadius="48">
            {children}
        </Link>
    )
}

B2CLink.propTypes = {
    children: PropTypes.node,
    linkStruct: PropTypes.object
}

/**
 * Extracts chakra theme extensions from the given page designer
 * components data and merge with current theme.
 *
 * This allows overriding of the chakra theme for an individual component
 * instance
 *
 * @param {react.Component} Component
 * @return {react.Component}
 */
export const withThemeOverrides = (Component) => {
    const ThemedComponent = ({component, ...props}) => {
        const _theme = useTheme()
        const {themeOverrides} = component.data

        if (themeOverrides) {
            try {
                let themeCode = themeOverrides.result
                let themefunc = new Function('theme', `return ${themeCode}`)
                let _themeOverride = themefunc(theme)
                var theme = extendTheme(_themeOverride, _theme)
                return (
                    <ChakraProvider theme={theme}>
                        <Component component={component} {...props} />
                    </ChakraProvider>
                )
            } catch (e) {
                console.error('Unable to parse JSON theme: ' + e)
            }
        }
        return <Component component={component} {...props} />
    }
    ThemedComponent.propTypes = {
        component: PropTypes.object
    }
    return ThemedComponent
}

/**
 * @param {react.Component} Component
 * @return {react.Component}
 */
export const withContainerStyles = (Component) => {
    const ContainedComponent = ({component, ...props}) => {
        const __containerStyles = component?.data?.__containerStyles ?? {}
        const {padding, margin} = __containerStyles

        return (
            <Box
                pt={padding?.top || 0}
                pr={padding?.right || 0}
                pb={padding?.bottom || 0}
                pl={padding?.left || 0}
                mt={margin?.top || 0}
                mr={margin?.right || 0}
                mb={margin?.bottom || 0}
                ml={margin?.left || 0}
                backgroundColor={__containerStyles.backgroundColor}
                textColor={__containerStyles.textColor}
            >
                <Component component={component} {...props} />
            </Box>
        )
    }
    ContainedComponent.propTypes = {
        component: PropTypes.object
    }
    return ContainedComponent
}

/**
 * Attaches to a shared worker to receive prop updates
 * from related page designer component editor. This only occurs in page designer mode
 *
 * @param Component - page designer component react component
 */
export function withLivePreview(Component) {
    /**
     * @param {PDComponent} component
     * @param {object} props
     * @return {Element}
     */
    const LiveUpdatingComponent = ({component, ...props}) => {
        const [componentDataOverrides, setComponentDataOverrides] = React.useState({})
        // not entirely sure why this is in state (to keep a reference? maybe useRef instead?)
        const [componentWorker, setComponentWorker] = useState(null) // eslint-disable-line @typescript-eslint/no-unused-vars
        // initially the component is considered to be in the unsaved state
        // when set to false we'll show an alert banner
        const [saved, setSaved] = useState(true) // eslint-disable-line @typescript-eslint/no-unused-vars

        // if the component worker is available (i.e. we're in page designer)
        // listen for updates and update the code, do nothing if the global is not set
        useEffect(() => {
            if (typeof window !== 'undefined' && window?._componentSharedWorkerUrl) {
                const worker = new SharedWorker(window._componentSharedWorkerUrl, {
                    name: 'componentWorker',
                    credentials: 'same-origin'
                })
                setComponentWorker(worker)

                const onMessage = function (e) {
                    const {componentId, attributeId, data, __reset} = e.data

                    // check if this message is for us
                    if (componentId === component.id) {
                        // for reset events remove any changes
                        if (__reset === true) {
                            // TODO: probably should reset only the incoming attribute ID
                            setComponentDataOverrides({})
                        } else {
                            // lazy compare
                            const isDataEqualToOriginal =
                                JSON.stringify(data) ===
                                JSON.stringify(component.data[attributeId] ?? null)
                            setSaved(isDataEqualToOriginal)

                            setComponentDataOverrides((overrides) => {
                                return {
                                    ...overrides,
                                    [attributeId]: data
                                }
                            })
                        }
                    }
                }

                worker.port.addEventListener('message', onMessage)
                worker.port.start()

                return () => {
                    worker.port.removeEventListener('message', onMessage)
                    worker.port.close()
                    setComponentWorker(null)
                }
            }
        }, [typeof window !== 'undefined' ? window?._componentSharedWorkerUrl : null].filter(Boolean))

        return (
            <Component
                component={{
                    ...component,
                    data: {
                        ...component.data,
                        ...componentDataOverrides
                    }
                }}
                {...props}
            />
        )
    }
    LiveUpdatingComponent.propTypes = {
        component: PropTypes.object
    }
    return LiveUpdatingComponent
}

// eslint-disable-next-line react/prop-types
export function Entity({children}) {
    const s = '<b>' + children + '</b>'
    let e = document.createElement('decodeIt')
    e.innerHTML = s
    return <>{e.innerText}</>
}

export const E = Entity

export function Space() {
    let e = document.createElement('space')
    e.innerHTML = ' '
    return <>{e.innerText}</>
}

export const S = Space

export function Comment() {
    return null
}

export const ALLOWED_COMPONENTS = {
    // special components above
    Entity,
    E,
    Space,
    S,
    Comment,

    ...Icons,
    // Chakra UI Elements that work well for plain markup
    Box,
    Button,
    ButtonGroup,
    Heading,
    Text,

    Container,
    Center,
    Square,
    Circle,
    Flex,
    Spacer,
    List,
    ListItem,
    ListIcon,
    OrderedList,
    UnorderedList,

    AspectRatio,
    Stack,
    HStack,
    VStack,
    Image,
    Grid,
    GridItem,
    SimpleGrid,
    Wrap,
    WrapItem,

    Badge,
    Divider,
    Stat,
    StatLabel,
    StatNumber,
    StatHelpText,
    StatArrow,
    StatGroup,

    Alert,
    AlertIcon,
    AlertTitle,
    AlertDescription,

    Accordion,
    AccordionItem,
    AccordionButton,
    AccordionPanel,
    AccordionIcon,

    Tabs,
    TabList,
    TabPanels,
    Tab,
    TabPanel,

    TableContainer,
    TableCaption,
    Table,
    Thead,
    Tbody,
    Th,
    Td,
    Tr,
    RouteLink,
    Link: (props) => {
        // eslint-disable-next-line react/prop-types
        if (props.href) {
            // eslint-disable-next-line react/prop-types
            return <Link as={RouteLink} to={props.href} {...props} />
        }
        return <Link as={RouteLink} {...props} />
    },
    LinkBox,
    LinkOverlay,
    Avatar,
    AvatarBadge,
    AvatarGroup,

    Global,
    Banner
}

// Note this section is to support htm usage, which is not the default JSX parser
/**
 * htm binding callback that maps elements to react components if they are allowed
 * otherwise returning a string.
 *
 * The tree built is a tree of React.createElement calls such that it can be rendered
 * via a parent react component or to a react root
 */
export function h(type, props, ...children) {
    if (type === '') {
        // react fragment
        type = React.Fragment
    }
    if (ALLOWED_COMPONENTS[type]) {
        type = ALLOWED_COMPONENTS[type]
    }
    return React.createElement(type, props, ...children)
}

export const html = htm.bind(h)

// make these undefined in the context of the tagged template calling function below
const DENYLIST_CONTEXT = [
    ...Object.keys(typeof window !== 'undefined' ? window : {}),
    'window',
    'eval',
    'Function'
]

/**
 * This helper functions transforms a raw "jsx string" into a react component tree
 * using the above htm binded to the h function.
 *
 * The htm library will use this bound callback to transform elements to react components
 * via createElement replacing elements that match allowed components with their corresponding
 * component values from the ALLOWED_COMPONENTS object.
 *
 * htm uses tagged template literals. in fact the html function above is a tagged template function.
 * we utilize this allow for basic expression use in the jsx string for attributes and children
 * by constructing a function that executes the tagged template function `html` with a simple context
 * that (currently) consists only of the allowed components
 *
 * This allows us to use basic expressions i.e. <Box width={[100, 200, 300]}></Box> and components-as-props
 * conventions used in chakra ui i.e. <Link as={RouteLink} to="/"></Link> while shielding the template from any other
 * available calling context.
 *
 * Since the JSX syntax we are supporting is slightly different than the tagged template syntax expected here. namely
 * the expression syntax must begin with a $ symbol: i.e. <Box width=${[100, 200, 300]}></Box> we must first transform
 * the string to replace all instances the jsx expression syntax with the tagged template
 * @param {string} jsxString
 * @param {object} options
 * @param {object} options.props optional props to pass to the component template
 * @return {React.Component}
 */
export function jsxToReact(jsxString, {props}) {
    // This block is an alternative implementation that is much smaller and faster than
    // JSXParser but does not support 100% of JSX syntax. It may be useful to reduce bundle size
    // as long as the JSX used is compatible (i.e. main issue is JSX comments).

    // remove jsx comments
    var taggedTemplate = jsxString.replace(/\{\s*\/\*(.*?)\}/g, '')
    taggedTemplate = taggedTemplate.replace(/\{(.*?)\}/g, '$${$1}')

    const funcArgs = [
        ...DENYLIST_CONTEXT,
        'html',
        ...Object.keys(ALLOWED_COMPONENTS),
        ...Object.keys(props ?? {}),
        'return html`' + taggedTemplate + '`'
    ]
    const func = Function.apply(Function, funcArgs)
    return func.apply({}, [
        ...DENYLIST_CONTEXT.map(() => undefined),
        html,
        ...Object.values(ALLOWED_COMPONENTS),
        ...Object.values(props ?? {})
    ])

    // return (
    //     <JsxParser
    //         bindings={{
    //             ...props
    //         }}
    //         onError={(e) => {
    //             throw e
    //         }}
    //         components={ALLOWED_COMPONENTS}
    //         jsx={jsxString}
    //     />
    // )
}
