'use strict';

process.env.BABEL_ENV = 'renderer';

const path = require('path');
const fs = require('fs');
const utils = require('../.electron-vue/utils');
const webpack = require('webpack');

const ExtractTextPlugin = require('extract-text-webpack-plugin');

const appExtract = new ExtractTextPlugin('../../static/styles-dark.css');

/**
 * List of node_modules to include in webpack bundle
 *
 * Required for specific packages like Vue UI libraries
 * that provide pure *.vue files that need compiling
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/webpack-configurations.html#white-listing-externals
 */
let rendererConfig = {
    devtool: '#cheap-module-eval-source-map',
    entry: {
        renderer: path.join(__dirname, '../src/renderer/main.js')
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: 'css-loader',
            },
            {
                test: /\.js$/,
                use: 'babel-loader',
                exclude: /node_modules/
            },
            {
                test: /\.vue$/,
                use: {
                    loader: 'vue-loader',
                    options: {
                        loaders: utils.cssLoaders({
                            extract: process.env.NODE_ENV === 'production',
                            appExtract,
                            theme: 'dark'
                        })
                    }
                }
            },
            {
                test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
                use: {
                    loader: 'url-loader',
                    query: {
                        limit: 10000,
                        name: 'imgs/[name].[ext]'
                    }
                }
            },
            {
                test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
                loader: 'url-loader',
                options: {
                    limit: 10000,
                    name: 'media/[name].[ext]'
                }
            },
            {
                test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
                use: {
                    loader: 'url-loader',
                    query: {
                        publicPath: '../',
                        limit: 10000,
                        name: 'fonts/[name].[ext]'
                    }
                }
            }
        ]
    },
    node: {
        __dirname: process.env.NODE_ENV !== 'production',
        __filename: process.env.NODE_ENV !== 'production'
    },
    plugins: [
        appExtract,
    ],
    output: {
        filename: '[name].js',
        libraryTarget: 'commonjs2',
        path: path.join(__dirname, '../dist/electron')
    },
    resolve: {
        alias: {
            '@': path.join(__dirname, '../src/renderer'),
            'vue$': 'vue/dist/vue.esm.js',
        },
        extensions: ['.js', '.vue', '.json', '.css', '.node']
    },
    target: 'electron-renderer'
};

let jsonPath = path.join(__dirname, '..', 'static/dll/libs-mainfest.json');
let json2Path = path.join(__dirname, '..', 'static/dll/cos-mainfest.json');
if (process.env.ENV_DLL === 'true' && fs.existsSync(jsonPath) && fs.existsSync(json2Path)) {
    console.log('build with DllReferencePlugin');
    rendererConfig.plugins.push(new webpack.DllReferencePlugin({
        context: __dirname,
        manifest: require('../static/dll/libs-mainfest.json')
    }));

    rendererConfig.plugins.push(new webpack.DllReferencePlugin({
        context: __dirname,
        manifest: require('../static/dll/cos-mainfest.json')
    }));
} else {
    console.log('build without DllReferencePlugin');
}

/**
 * Adjust rendererConfig for development settings
 */
if (process.env.NODE_ENV !== 'production') {
    rendererConfig.plugins.push(
        new webpack.DefinePlugin({
            '__static': `"${path.join(__dirname, '../static').replace(/\\/g, '\\\\')}"`
        })
    );
}

/**
 * Adjust rendererConfig for production settings
 */
if (process.env.NODE_ENV === 'production') {
    rendererConfig.devtool = '';

    rendererConfig.plugins.push(
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': '"production"'
        }),
        new webpack.LoaderOptionsPlugin({
            minimize: true
        })
    );
}

module.exports = rendererConfig;
