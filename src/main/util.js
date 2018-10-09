/**
 * Created by zhangweiwei on 2017/4/14.
 */
const path = require('path');
const fs = require('fs');

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

/**
 * 遍历目录
 * @param dir
 */
export const readDir = function (dir) {
    let children = [];

    let _stat = fs.statSync(dir);
    if (_stat && !_stat.isDirectory()) {
        children.push(dir);
    } else {
        fs.readdirSync(dir).forEach(function (filename) {
            let path = dir + "/" + filename;
            let stat = fs.statSync(path);
            if (stat && stat.isDirectory()) {
                children = children.concat(readDir(path));
            } else {
                children.push(path);
            }
        });
    }

    return children;
};