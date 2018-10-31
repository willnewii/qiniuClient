'use strict';

process.env.BABEL_ENV = 'renderer';

const path = require('path');
const utils = require('../.electron-vue/utils');
const webpack = require('webpack');

const MinifyPlugin = require("babel-minify-webpack-plugin");
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

const srcPath = path.join(__dirname, '../static/dll/');
const commonExtract = new ExtractTextPlugin('[name].css');

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
        core: [
            'vue',
            'vue-router',
            'vuex',
            'axios',
            'qs',
            'vue-lazyload',
            'vue-electron',
            'iview',
            'v-contextmenu/src/directive',
            'v-contextmenu/src/index',
            'electron-json-storage',
            'dayjs',
            'qiniu',
            'cos-nodejs-sdk-v5',
            'v-contextmenu/dist/index.css',
            'iview/dist/styles/iview.css'
        ]
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: commonExtract.extract({
                    fallback: 'style-loader',
                    use: 'css-loader'
                })
            },
            {
                test: /\.html$/,
                use: 'vue-html-loader'
            },
            {
                test: /\.js$/,
                use: 'babel-loader',
                exclude: /node_modules/
            },
            {
                test: /\.node$/,
                use: 'node-loader'
            },
            {
                test: /\.vue$/,
                use: {
                    loader: 'vue-loader',
                    options: {
                        loaders: utils.cssLoaders({extract: process.env.NODE_ENV === 'production', appExtract: commonExtract})
                    }
                }
            },
            {
                test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
                use: {
                    loader: 'url-loader',
                    query: {
                        limit: 10000,
                        name: 'imgs/[name]--[folder].[ext]'
                    }
                }
            },
            {
                test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
                loader: 'url-loader',
                options: {
                    limit: 10000,
                    name: 'media/[name]--[folder].[ext]'
                }
            },
            {
                test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
                use: {
                    loader: 'url-loader',
                    query: {
                        //publicPath: '../',
                        limit: 10000,
                        name: 'fonts/[name]--[folder].[ext]'
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
        commonExtract,
        new webpack.DllPlugin({
            path: path.join(srcPath, '[name]-mainfest.json'), // 描述依赖对应关系的json文件
            name: '[name]_library',
            context: __dirname // 执行的上下文环境，对之后DllReferencePlugin有用
        }),
        new CleanWebpackPlugin([path.join(__dirname, '../static/dll/*.*')], {root: path.join(__dirname, '../')}),
    ],
    output: {
        filename: '[name].js',
        path: path.join(__dirname, '../static/dll/'),
        library: '[name]_library'
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
        new MinifyPlugin(),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': '"production"'
        }),
        new webpack.LoaderOptionsPlugin({
            minimize: true
        })
    );

    if (process.env.ANALYZER === 'true') {
        rendererConfig.plugins.push(
            new BundleAnalyzerPlugin(),
        );
    }
}

module.exports = rendererConfig;
