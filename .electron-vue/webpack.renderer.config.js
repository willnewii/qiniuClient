"use strict"

process.env.BABEL_ENV = "renderer"

const path = require("path")
const fs = require("fs")
const rendererConfig = require("./webpack.renderer.base.config")
const webpack = require("webpack")

const CopyWebpackPlugin = require("copy-webpack-plugin")
const HtmlWebpackPlugin = require("html-webpack-plugin")

rendererConfig.plugins = rendererConfig.plugins.concat([
  new HtmlWebpackPlugin({
    filename: "index.html",
    template: path.resolve(__dirname, "../index.ejs"),
    minify: {
      collapseWhitespace: true,
      removeAttributeQuotes: true,
      removeComments: true
    },
    nodeModules: process.env.NODE_ENV !== "production" ? path.resolve(__dirname, "../node_modules") : false
  }),
  new webpack.HotModuleReplacementPlugin(),
  new webpack.NoEmitOnErrorsPlugin()
])

if (process.env.NODE_ENV === "production") {
  rendererConfig.plugins.push(
          new CopyWebpackPlugin([
            {
              from: path.join(__dirname, "../static"),
              to: path.join(__dirname, "../dist/electron/static"),
              ignore: [".*"]
            }
          ])
  )
}

/* DLL模块处理 */
const libMainfest = path.join(__dirname, "..", "static/dll/libs-mainfest.json")
const cosMainfest = path.join(__dirname, "..", "static/dll/cos-mainfest.json")
if (process.env.ENV_DLL === "true" && fs.existsSync(libMainfest) && fs.existsSync(cosMainfest)) {
  console.log("build with DllReferencePlugin")
  rendererConfig.plugins.push(
    new webpack.DllReferencePlugin({
      context: __dirname,
      manifest: require("../static/dll/libs-mainfest.json")
    })
  )

  rendererConfig.plugins.push(
    new webpack.DllReferencePlugin({
      context: __dirname,
      manifest: require("../static/dll/cos-mainfest.json")
    })
  )
} else {
  console.log("build without DllReferencePlugin")
}

module.exports = rendererConfig
