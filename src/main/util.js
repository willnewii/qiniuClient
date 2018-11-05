/**
 * Created by zhangweiwei on 2017/4/14.
 */
const path = require('path');
const fs = require('fs');
const klaw = require('klaw-sync');
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

/**
 * 根据选取的文件和文件夹,返回文件列表
 * path：文件绝对路径
 * dir：选择的文件夹路径,用来保持上传至云后计算相对路径
 * @param _files
 * @returns {Array}
 */
export function wrapperFiles(_files) {
    let files = [];
    for (const path of _files) {
        if (isDirectory(path)) {
            let result = klaw(path, {
                nodir: true,
                filter: function (item) {
                    return !/\.(DS_Store)$/.test(item.path);
                }
            });
            let _path = convertPath(path);
            for (let file of result) {
                files.push({path: convertPath(file.path), dir: _path});
            }
        } else {
            files.push({path: convertPath(path)});
        }
    }

    return files;
}

/**
 * 统一win的分割符 \ => /
 * @param path
 * @returns {*}
 */
export function convertPath(path) {
    return path.replace(/\\/g, '/');
}

/**
 * 获取文件 Etag 值
 * @param filePath
 * @param platformType
 * @param callback
 */
export const getEtag = function (filePath, platformType, callback = null) {
    return new Promise(function (resolve, reject) {
        switch (platformType) {
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
        let hash = md5.digest('hex');
        callback(null, hash);
    });
};

/**
 * 是否是目录类型
 * @param path
 * @returns {Stats | boolean}
 */
const isDirectory = function (path) {
    return fs.statSync(path).isDirectory();
};