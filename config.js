'use strict'

const pkg = require('./package.json');


let config = {
    // Name of electron app
    // Will be used in production builds
    name: pkg.cnname,

    // webpack-dev-server port
    port: 9080,

    // electron-packager options
    // Docs: https://simulatedgreg.gitbooks.io/electron-vue/content/docs/building_your_app.html
};

module.exports = config;
