import * as Constants from '../service/constants';
import dayjs from 'dayjs';

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

export function getClipboardText(type, url) {
    switch (type) {
        case Constants.CopyType.URL:
            return url;
        case Constants.CopyType.MARKDOWN:
            return `![${getPostfix(url)}](${url})`;
        default:
            return url;
    }
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
 * 获取文件路径和链接的后缀
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
    if (!size)
        return '';

    if (size >= 1024 * 1024) {
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
 * 文件排序
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


export function wrapperFile(item, type) {
    return {
        key: item.Key,
        fsize: parseInt(item.Size),
        putTime: new Date(item.LastModified).getTime(),
        mimeType: ''
    };
}

/**
 * 开发模式直接修改字段
 * @param name
 */
export function loadTheme(name) {
    if (process.env.NODE_ENV === 'production') {
        let head = document.getElementsByTagName("head")[0];

        const style = document.createElement('link');
        style.setAttribute("rel", "stylesheet");
        style.setAttribute("type", "text/css");

        if (name === 'dark') {
            style.setAttribute("href", './static/styles-dark.css');
        } else {
            style.setAttribute("href", './static/styles.css');
        }
        head.appendChild(style);
    }

}