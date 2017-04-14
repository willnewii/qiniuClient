'use strict'

process.env.BABEL_ENV = 'main'

const path = require('path')
const pkg = require('./app/package.json')
const settings = require('./config.js')
const webpack = require('webpack')

let mainConfig = {
    entry: {
        main: path.join(__dirname, 'app/src/main/index.js'),
        load: path.join(__dirname, 'app/src/main/load.js'),
    },
    externals: Object.keys(pkg.dependencies || {}),
    module: {
        rules: [
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: /node_modules/
            },
            {
                test: /\.json$/,
                loader: 'json-loader'
            },
            {
                test: /\.node$/,
                loader: 'node-loader'
            },
            {
                test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
                use: {
                    loader: 'url-loader',
                    query: {
                        limit:0,
                        name: 'assets/[name].[ext]'
                    }
                }
            }
        ]
    },
    node: {
        __dirname: false,
        __filename: false
    },
    output: {
        filename: '[name].js',
        libraryTarget: 'commonjs2',
        path: path.join(__dirname, 'app/dist')
    },
    plugins: [
        new webpack.NoEmitOnErrorsPlugin(),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': '"production"'
        }),
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            }
        })
    ],
    resolve: {
        extensions: ['.js', '.json', '.node'],
        modules: [
            path.join(__dirname, 'app/node_modules')
        ]
    },
    target: 'electron-main'
}

module.exports = mainConfig
