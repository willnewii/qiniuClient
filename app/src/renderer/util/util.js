/**
 * Created by zhangweiwei on 2017/4/13.
 */

export function getName(path) {
    if (path.lastIndexOf('/') !== -1) {
        path = path.substring(path.lastIndexOf('/') + 1, path.length);
    }
    return path;
}

export function getPrefix(key) {
    if (key.indexOf('/') !== -1) {
        return key.substring(0, key.indexOf('/') + 1);
    } else {
        return '';
    }
}