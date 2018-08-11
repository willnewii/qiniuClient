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
};

export const isMac = function () {
    return process.platform === 'darwin';
};

export const isWin = function () {
    return process.platform === 'win32';
};