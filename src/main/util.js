/**
 * Created by zhangweiwei on 2017/4/14.
 */
const path = require('path');
const fs = require('fs');
const qetag = require('./util/qetag');

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

export async function wrapperFiles(_files) {
    let files = [];
    for (const item of _files) {
        if (isDirectory(item)) {
            let temp = await readDir(item);
            temp.forEach((path) => {
                //path.sep 将window 的路径分割符 \  转换成 /
                files.push({path: path.replace(/\\/g, '/'), dir: item.replace(/\\/g, '/')});
            });
        } else {
            files.push({path: item.replace(/\\/g, '/')});
        }
    }

    return files;
}

/**
 * 获取文件 Etag 值
 * @param filePath
 * @param type
 * @param callback
 */
export const getEtag = function (filePath, type, callback = null) {
    return new Promise(function (resolve, reject) {
        switch (type) {
            case 0:
                qetag(filePath, (hash) => {
                    resolve(hash);
                });
                break;
            case 1:
                getFileMd5(filePath, (error, hash) => {
                    resolve(hash);
                });
                break;
        }
    });
};

const getFileMd5 = function (filepath, callback) {
    const md5 = require('crypto').createHash('md5');
    let readStream = require('fs').createReadStream(filepath);

    readStream.on('data', function (chunk) {
        md5.update(chunk);
    });
    readStream.on('error', function (err) {
        callback(err);
    });
    readStream.on('end', function () {
        var hash = md5.digest('hex');
        callback(null, hash);
    });
};

/**
 * 是否是目录类型
 * @param path
 * @returns {Stats | boolean}
 */
const isDirectory = function (path) {
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

/**
 * 获取目录
 * @param dir
 * @returns {Promise<any>}
 * @private
 */
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