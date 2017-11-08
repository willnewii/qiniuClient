'use strict'

process.env.BABEL_ENV = 'main'

const path = require('path')
const pkg = require('./app/package.json')
const settings = require('./config.js')
const webpack = require('webpack')
const CopyWebpackPlugin = require('copy-webpack-plugin')

let mainConfig = {
    entry: {
        main: path.join(__dirname, 'app/src/main/index.js')
    },
    //externals: Object.keys(pkg.dependencies || {}),
    module: {
        rules: [
            {
                test: /\.js$/,
                loader: 'babel-loader',
                include: [path.join(__dirname, 'node_modules/electron-dl'), path.join(__dirname, 'node_modules/ext-name'), path.join(__dirname, 'node_modules/pupa'),path.join(__dirname, 'node_modules/unused-filename')],
            },
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
        new CopyWebpackPlugin([
            {from: 'app/src/main/assets', to: 'assets'},
        ]),
        new webpack.NoEmitOnErrorsPlugin(),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': '"production"'
        }),
/*        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            }
        })*/
    ],
    resolve: {
        extensions: ['.js', '.json', '.node'],
        modules: [
            path.join(__dirname, 'node_modules')
        ]
    },
    target: 'electron-main'
}

module.exports = mainConfig
