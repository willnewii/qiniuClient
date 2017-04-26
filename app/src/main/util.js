/**
 * Created by zhangweiwei on 2017/4/14.
 */
const path = require('path')

export const winURL = process.env.NODE_ENV === 'development'
    ? `http://localhost:${require('../../../config').port}/`
    : `file://${__dirname}/index.html`

const iconPath = path.join(__dirname, 'assets/');

export const getIconPath = function (filename) {
    return path.join(iconPath, (process.platform === 'win32' ? filename : filename))
}

export const isMac = function () {
    if (process.platform === 'darwin') {
        return true;
    }
    return false;
}

export const isWin = function () {
    if (process.platform === 'win32') {
        return true;
    }
    return false;
}