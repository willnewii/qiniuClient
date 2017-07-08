'use strict'

const path = require('path')

let config = {
    // Name of electron app
    // Will be used in production builds
    name: 'qiniu-Client',

    // webpack-dev-server port
    port: 9080,

    // electron-packager options
    // Docs: https://simulatedgreg.gitbooks.io/electron-vue/content/docs/building_your_app.html
    building: {
        arch: 'x64',
        asar: false,
        dir: path.join(__dirname, 'app'),
        icon: path.join(__dirname, 'app/icons/icon'),
        ignore: /(^\/(src|test|\.[a-z]+|README|yarn|static|dist\/web))|\.gitkeep/,
        out: path.join(__dirname, 'builds'),
        overwrite: true,
        platform: process.env.PLATFORM_TARGET || 'all'
    }
}

config.building.name = config.name

module.exports = config
