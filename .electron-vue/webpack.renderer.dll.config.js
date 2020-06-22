"use strict"

process.env.BABEL_ENV = "renderer"

const path = require("path")
const rendererConfig = require("./webpack.renderer.base.config")
const config = require("../.electron-vue/config")
const webpack = require("webpack")

rendererConfig.entry = {}
rendererConfig.mode = "production"
rendererConfig.entry[process.env.DLL_NAME] = config.dll[process.env.DLL_NAME]

rendererConfig.plugins = rendererConfig.plugins.concat([
  new webpack.DllPlugin({
    path: path.join(__dirname, "../static/dll/", "[name]-mainfest.json"), // 描述依赖对应关系的json文件
    name: "[name]_library",
    context: __dirname // 执行的上下文环境，对之后DllReferencePlugin有用
  })
])

rendererConfig.output = {
  filename: "[name].js",
  path: path.join(__dirname, "../static/dll/"),
  library: "[name]_library"
}

if (process.env.NODE_ENV === "production") {
}

module.exports = rendererConfig
