/**
 * This separate config is required as webpack-dev-middleware in PWA does not seem to support emitting files
 */
const config = require('@salesforce/pwa-kit-dev/configs/webpack/config')
const path = require('path')
const webpack = require('webpack')

// Add your customizations here
const clientConfig = config.find((cnf) => cnf.name === 'client')

// leverage the same CSS loader as PWA webpack does
const css = {
    test: /\.css$/i,
    exclude: /node_modules/,
    use: [
        // The `injectType`  option can be avoided because it is default behaviour
        'css-loader'
    ]
}

clientConfig.module.rules.push(css)

// start with pwa kits config and adapt
const cartridgeConfig = Object.assign({}, clientConfig, {
    name: 'harness',
    entry: {
        harness: './cartridges/app_q_pwa_support/cartridge/client/default/js/harness.js'
    },
    devtool: 'source-map',
    stats: {
        ...clientConfig.stats,
        all: true
    },
    resolve: {
        ...clientConfig.resolve,
        alias: {
            ...clientConfig.resolve.alias,
            pwa: path.resolve(__dirname, 'app')
        }
    },
    output: {
        publicPath: 'auto',
        path: path.resolve(
            __dirname,
            './cartridges/app_q_pwa_support/cartridge/static/default/js/composable'
        ),
        filename: '[name].js',
        chunkLoadingGlobal: 'harnessChunkLoading'
    },
    optimization: {},
    performance: {},
    plugins: [
        new webpack.DefinePlugin({
            DEBUG: true,
            'process.env.NODE_ENV': JSON.stringify('development'),
            WEBPACK_TARGET: JSON.stringify('web')
        })
    ],
    devServer: {
        devMiddleware: {
            writeToDisk: true
        }
    }
})

const editorsConfig = {
    mode: 'development',
    devtool: 'source-map',
    entry: {
        einstein: path.resolve(
            './cartridges/app_q_pwa_support/cartridge/client/default/experience/editors/einstein.jsx'
        ),
        codeeditor: path.resolve(
            './cartridges/app_q_pwa_support/cartridge/client/default/experience/editors/codeeditor.js'
        ),
        styleEditor: path.resolve(
            './cartridges/app_q_pwa_support/cartridge/client/default/experience/editors/styleEditor.js'
        )
    },
    resolve: {
        extensions: ['.js', '.jsx', '.ts', '.tsx']
    },
    output: {
        path: path.resolve(
            './cartridges/app_q_pwa_support/cartridge/static/default/experience/editors'
        ),
        filename: '[name].js'
    },
    plugins: [],
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                use: {
                    loader: 'babel-loader',
                    options: {}
                }
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            },
            {
                test: /\.(svg|gif|jpe?g|png)$/,
                use: 'file-loader?limit=10000'
            },
            {
                test: /\.tsx?$/,
                loader: 'ts-loader'
            }
        ]
    }
}

module.exports = [cartridgeConfig, editorsConfig]