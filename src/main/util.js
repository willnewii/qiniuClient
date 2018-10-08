/**
 * Created by zhangweiwei on 2017/4/14.
 */
const path = require('path');

export const mainURL = process.env.NODE_ENV === 'development' ? 'http://localhost:9080/' : `file://${__dirname}/index.html`;

const iconPath = path.join(__dirname, 'assets/');

export const getIconPath = function (filename) {
    return path.join(iconPath, filename);
};

export const isMac = function () {
    return process.platform === 'darwin';
};

export const isWin = function () {
    return process.platform === 'win32';
};