import * as Constants from '../service/constants';
import pkg from '../../../package';
import dayjs from 'dayjs';

const mime = require('mime-types');

/**
 * Created by zhangweiwei on 2017/4/13.
 */

/**
 * 是否为空对象
 * @param e
 * @returns {boolean}
 */
export function isEmptyObject(e) {
    let t;
    for (t in e)
        return !1;
    return !0;
}

export function deepCopy(source) {
    let result = {};
    for (let key in source) {
        result[key] = typeof source[key] === 'object' ? deepCopy(source[key]) : source[key];
    }
    return result;
}


export function getClipboardText(type, url, file) {
    switch (type) {
        case Constants.CopyType.URL:
            return url;
        case Constants.CopyType.MARKDOWN:
            if (isSupportImage(file.mimeType)) {
                return `![${getPostfix(file.key)}](${url})`;
            } else {
                return `[${getPostfix(file.key)}](${url})`;
            }
        default:
            return url;
    }
}

/**
 * {dir,path} dir 导入时源目录,path 文件路径
 * 通过比较dir,path 保留目录结构
 * 上传 目录a  , 文件  a/b/c/d.txt 得到的结果是b/c/d.txt
 * @param item 文件
 * @returns {string}
 */
export function getFileNameWithFolder(item) {
    let key = '';
    if (item.dir) {
        let temp = item.dir.substring(0, item.dir.lastIndexOf('/') + 1);
        key = item.path.replace(temp, '');
    } else {
        key = getPostfix(item.path);
    }
    return key;
}

/**
 * a/b/c/d/a.png => a/
 * @param key
 * @returns {string}
 */
export function getPrefix(key) {
    if (key.indexOf('/') !== -1) {
        return key.substring(0, key.indexOf('/') + 1);
    } else {
        return '';
    }
}

/**
 * a/b/c/d/a.png => a//b/c/d/
 * @param key
 * @returns {string}
 */
export function getFakeFolder(key) {
    if (key.lastIndexOf('/') !== -1) {
        return key.substring(0, key.lastIndexOf('/') + 1);
    } else {
        return '';
    }
}

/**
 * 获取文件路径和链接的后缀 ≈获取文件名
 * @param path
 * @returns {*}
 */
export function getPostfix(path) {
    if (path.lastIndexOf('/') !== -1) {
        return path.substring(path.lastIndexOf('/') + 1, path.length);
    }
    return path;
}

export function quickSort(arr, key) {
    function getValue(item, key) {
        return key ? item[key] : item;
    }

    if (arr.length <= 1) {
        return arr;
    }
    let pivotIndex = Math.floor(arr.length / 2);
    let pivotItem = arr.splice(pivotIndex, 1)[0];
    let pivot = getValue(pivotItem, key);
    let left = [];
    let right = [];
    for (let i = 0; i < arr.length; i++) {
        let temp = getValue(arr[i], key);
        if (temp < pivot) {
            left.push(arr[i]);
        } else {
            right.push(arr[i]);
        }
    }
    return quickSort(left, key).concat(pivotItem, quickSort(right, key));
}

export function formatFileSize(size) {
    if (size >= Math.pow(1024, 4)) {
        return (size / Math.pow(1024, 4)).toFixed(2) + ' TB';
    } else if (size >= Math.pow(1024, 3)) {
        return (size / Math.pow(1024, 3)).toFixed(2) + ' GB';
    } else if (size >= 1024 * 1024) {
        return (size / 1024 / 1024).toFixed(2) + ' MB';
    } else if (size >= 1024 && size < 1024 * 1024) {
        return (size / 1024).toFixed(2) + ' KB';
    } else {
        return (size) + ' B';
    }
}

export function formatDate(time) {
    if (!time)
        return '';

    return dayjs(time).format('YYYY-MM-DD HH:mm:ss');
}

/**
 * 根据mimeType,判断是否是浏览器支持的图片格式
 * @param mimeType
 * @returns {boolean}
 */
export function isSupportImage(mimeType) {
    return /image\/(png|img|jpe?g|svg|gif)/.test(mimeType.toLowerCase());
}

/**
 * 文件排序 文件夹>文件
 * @param file1
 * @param file2
 * @returns {*}
 */
export function sequence(file1, file2) {
    if (file1._directory && file2._directory) {
        return file1._name.localeCompare(file2._name);
    } else if (file1._directory && !file2._directory) {
        return -1;
    } else if (!file1._directory && file2._directory) {
        return 1;
    } else if (!file1._directory && !file2._directory) {
        return file1.key.localeCompare(file2.key);
    } else {
        return 0;
    }
}

/**
 * 转换个平台Object数据信息至统一格式
 * @param item
 * @param platformType 0:qiniu 1:tencent 2:qing 3:ali
 * @returns {{key: *, fsize: number, putTime: number, mimeType: string},ETag:String}
 */
export function convertMeta(item, platformType = 0) {
    switch (platformType) {
        case 0:
            item.putTime = item.putTime / 10000;
            item.ETag = item.hash;
            break;
        case 1:
            item.key = item.Key;
            item.fsize = parseInt(item.Size);
            item.putTime = new Date(item.LastModified).getTime();
            item.mimeType = mime.lookup(item.key) || '';
            break;
        case 2:
            item.fsize = parseInt(item.size);
            item.putTime = new Date(item.modified * 1000).getTime();
            item.mimeType = mime.lookup(item.key) || '';
            item.ETag = item.etag;
            break;
        case 3:
            item.key = item.name;
            item.fsize = parseInt(item.size);
            item.putTime = new Date(item.lastModified).getTime();
            item.mimeType = mime.lookup(item.name) || '';
            item.ETag = item.etag;
            break;
        case 4:
            item.key = (item.remotePath && item.remotePath !== '/') ? item.remotePath + '/' + item.name : item.name;
            item.fsize = parseInt(item.size);
            item.putTime = new Date(item.time).getTime();
            item.mimeType = mime.lookup(item.name) || '';
            item.ETag = item.etag;
            break;
    }

    return item;
}

/**
 * 开发模式请直接修改params.scss
 * @param name
 */
export function loadTheme(name) {
    if (process.env.NODE_ENV === 'production') {
        let head = document.getElementsByTagName("head")[0];

        const style = document.createElement('link');
        style.setAttribute("rel", "stylesheet");
        style.setAttribute("type", "text/css");

        if (name === 'dark') {
            style.setAttribute("href", pkg.cdnPath + 'static/styles-dark.css');
        } else {
            style.setAttribute("href", pkg.cdnPath + 'static/styles.css');
        }
        head.appendChild(style);
    }
}

/**
 * notification api
 * @param option
 */
export function notification(option = {}) {
    new Notification(option.title || pkg.cnname, Object.assign({
        silent: true
    }, option));
}

export function creatId(pre = "") {
    function S4() {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    }

    function guid() {
        return `${S4() + S4()}-${S4()}-${S4()}-${S4()}-${S4()}${S4()}${S4()}`;
    }

    return pre + guid();
}

export async function readBlob(file) {
    return new Promise(resolve => {
        const reader = new FileReader();
        //reader读取完成后，xhr上传
        reader.onload = function (event) {
            const base64 = event.target.result;
            //ajax上传图片
            //返回一个base64数据
            const img = {type: file.type, kind: file.kind};

            resolve({base64, img});
        }; // data url!
        reader.readAsDataURL(file); //reader
    });
}