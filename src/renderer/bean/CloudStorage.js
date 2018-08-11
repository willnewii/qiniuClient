import * as qiniu from '../service/cloudStorage';
import QiniuBucket from './QiniuBucket';

const storage = require('electron-json-storage');

export const Qiniu = 'qiniu';

export const Storage = {
    name: Qiniu
};

export function initStorage(param) {
    if (Storage.name === Qiniu) {
        qiniu.init({access_key: param.access_key, secret_key: param.secret_key});
    }
}

export function saveKey(param) {
    if (Storage.name === Qiniu) {
        storage.set('qiniu_key', {
            access_key: param.access_key,
            secret_key: param.secret_key
        }, (error) => {
            if (!error) {
                this.$router.push({path: '/'});
            }
        });
    }
}

export function getKey(callback) {
    if (Storage.name === Qiniu) {
        storage.get('qiniu_key', (error, data) => {
            if (!error) {
                if (data.access_key && data.secret_key) {
                    callback && callback(data);
                } else {
                    callback && callback();
                }
            }
        });
    }
}

export function getHttpAuthorization(url) {
    if (Storage.name === Qiniu) {
        return qiniu.httpAuthorization(url);
    }
}

export function generateBucket(name) {
    if (Storage.name === Qiniu) {
        return new QiniuBucket(name);
    }
}

export function test(){
}