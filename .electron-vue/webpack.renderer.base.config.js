"use strict"

process.env.BABEL_ENV = "renderer"

const path = require("path")
const pkg = require("../package.json")

const webpack = require("webpack")
const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin
const MinifyPlugin = require("babel-minify-webpack-plugin")
const { VueLoaderPlugin } = require("vue-loader")

const styleLoaders = [
  process.env.NODE_ENV !== "production" ? "vue-style-loader" : MiniCssExtractPlugin.loader,
  "css-loader",
  {
    loader: "sass-loader",
    options: {
      // 如果 sass-loader 版本 < 8，这里使用 `data` 字段  prependData
      data: `$platform: '${process.platform}';$theme:'light';`
    }
  }
]

let rendererConfig = {
  devtool: "cheap-module-eval-source-map",
  entry: {
    renderer: path.join(__dirname, "../src/renderer/main.js")
  },
  externals: ["worker_threads"],
  module: {
    rules: [
      {
        test: /\.vue$/,
        use: {
          loader: "vue-loader",
          options: {
            loaders: {
              // sass: 'vue-style-loader!css-loader!sass-loader?indentedSyntax=1',
              scss: styleLoaders
            }
          }
        }
      },
      {
        test: /\.scss$/,
        use: styleLoaders
      },
      {
        test: /\.css$/,
        use: [process.env.NODE_ENV !== "production" ? "vue-style-loader" : MiniCssExtractPlugin.loader, "css-loader"]
      },
      {
        test: /\.html$/,
        use: "vue-html-loader"
      },
      {
        test: /\.js$/,
        use: "babel-loader",
        exclude: /node_modules/
      },
      {
        test: /\.node$/,
        use: "node-loader"
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        use: {
          loader: "url-loader",
          query: {
            limit: 10000,
            name: "imgs/[name].[ext]"
          }
        }
      },
      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
        loader: "url-loader",
        options: {
          limit: 10000,
          name: "media/[name].[ext]"
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        use: {
          loader: "url-loader",
          query: {
            limit: 10000,
            name: "fonts/[name].[ext]"
          }
        }
      }
    ]
  },
  plugins: [new VueLoaderPlugin(), new MiniCssExtractPlugin({ filename: "[name].css" })],
  node: {
    __dirname: process.env.NODE_ENV !== "production",
    __filename: process.env.NODE_ENV !== "production"
  },
  output: {
    filename: "[name].js",
    publicPath: pkg.cdnPath,
    libraryTarget: "commonjs2",
    path: path.join(__dirname, "../dist/electron")
  },
  resolve: {
    alias: {
      "@": path.join(__dirname, "../src/renderer"),
      vue$: "vue/dist/vue.esm.js"
    },
    extensions: [".js", ".vue", ".json", ".css", ".node"]
  },
  target: "electron-renderer"
}

if (process.env.NODE_ENV === "production") {
  rendererConfig.devtool = ""

  rendererConfig.plugins.push(
    new MinifyPlugin({
      removeConsole: true
    }),
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": '"production"'
    })
  )

  if (process.env.ANALYZER === "true") {
    rendererConfig.plugins.push(new BundleAnalyzerPlugin())
  }
} else {
  rendererConfig.plugins.push(
    new webpack.DefinePlugin({
      __static: `"${path.join(__dirname, "../static").replace(/\\/g, "\\\\")}"`
    })
  )
}

module.exports = rendererConfig
