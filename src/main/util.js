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
 * 是否是目录类型
 * @param path
 * @returns {Stats | boolean}
 */
export const isDirectory = function (path) {
    let stat = fs.statSync(path);
    return stat && stat.isDirectory();
};


/**
 * 遍历目录
 * @param dir
 */
export const readDir = async function (dir) {
    let children = [];

    let root = await _readdir(dir);
    for (const filename of root) {
        if (!/\.(DS_Store)$/.test(filename)) {
            let path = dir + "/" + filename;
            let stat = fs.statSync(path);
            if (stat && stat.isDirectory()) {
                let temp = await readDir(path);
                children = children.concat(temp);
            } else {
                children.push(path);
            }
        }
    }
    return children;
};

function _readdir(dir) {
    return new Promise((resolve, reject) => {
        fs.readdir(dir, 'utf-8', (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
}