import React, {useMemo, useState} from 'react'
import PropTypes from 'prop-types'
import {
    jsxToReact,
} from './helpers'
import {Box, Skeleton as ChakraSkeleton, Alert, AlertIcon, Text} from '@chakra-ui/react'

function RawContainer({children}) {
    return <>{children}</>
}

RawContainer.propTypes = {
    children: PropTypes.node
}

class JSXErrorBoundary extends React.Component {
    constructor(props) {
        super(props)
        this.state = {hasError: false, error: null, errorCount: 0, content: props.content}
    }

    static getDerivedStateFromError(error) {
        return {hasError: true, error: error}
    }

    componentDidCatch(error, errorInfo) {
        console.error(error, errorInfo)
    }

    render() {
        if (this.props.content !== this.state.content) {
            this.setState({content: this.props.content, hasError: false})
        }
        if (this.state.hasError) {
            return (
                <Box color="white" fontSize="large" backgroundColor="red" style={{padding: '50px'}}>
                    JSX code could not be rendered. Check the code output for invalid syntax.
                    <br />
                    <pre style={{maxWidth: '400px'}}>
                        {this.state.error ? this.state.error.message : 'Unknown error'}
                    </pre>
                </Box>
            )
        }

        return this.props.children
    }

    static propTypes = {
        content: PropTypes.string,
        children: PropTypes.node
    }
}

/**
 * Wraps the children so that this component can be caught in an error boundary
 * @param children
 * @return {Element}
 * @constructor
 */
function JSXContainer({children}) {
    return <>{children}</>
}

JSXContainer.propTypes = {
    children: PropTypes.node
}

/**
 * Renders the components data.code attribute as JSX
 *
 * @param {PDComponent} component
 * @return {RawJSX.Element}
 * @constructor
 */
function RawJSX({component}) {
    const {code} = component.data
    const [error, setError] = useState(null)

    const content = useMemo(() => {
        try {
            setError(null)
            return jsxToReact(code.result, {
                props: code?.customFields?.reduce((acc, field) => {
                    acc[field.id] = field.value
                    return acc
                }, {})
            })
        } catch (e) {
            setError(e.message)
            return null
        }
    }, [code?.result, code?.customFields])

    if (!code) {
        return (
            <Box>
                <ChakraSkeleton width="100%" height="20px" />
            </Box>
        )
    }

    // There are two types of errors: one we can't process the "jsx" and another
    // where we can but it still throws when rendered by react. the latter
    // is caught by the error boundary and the former is caught here
    if (error) {
        return (
            <Alert status="error">
                <AlertIcon />
                <Text>There was an error rendering your component. Check the code output:</Text>
                <br />
                <code>{error}</code>
            </Alert>
        )
    }

    return (
        <div style={{position: 'relative', width: '100%'}}>
            <JSXErrorBoundary content={code?.result}>
                <JSXContainer>{content}</JSXContainer>
            </JSXErrorBoundary>
        </div>
    )
}

RawJSX.propTypes = {
    component: PropTypes.object
}

export default RawJSX
