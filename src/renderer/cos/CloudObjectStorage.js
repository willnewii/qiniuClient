import * as storagePromise from '../service/storagePromise';
import * as qiniu from '../cos/qiniu';
import * as tencent from '../cos/tencent';
import brand from '../cos/brand';

const storage = require('electron-json-storage');

export default class CloudObjectStorage {
    constructor() {
    }

    setName(name) {
        this.name = name;
        switch (name) {
            case brand.qiniu.key:
                this.cos = qiniu;
                break;
            case brand.tencent.key:
                this.cos = tencent;
                break;
        }
    }

    getBuckets(callback) {
        this.cos.getBuckets(callback);
    }

    async getCOS(callback) {
        let cos = [brand.qiniu, brand.tencent];
        let _cos = [];

        for (let i = 0; i < cos.length; i++) {
            let data = await storagePromise.get(cos[i].key + '_key');
            if (data && data.access_key && data.secret_key) {
                _cos.push(cos[i]);
            }
        }

        callback(_cos);
    }

    /**
     * 初始化当前cos ,只做了非空验证
     * @param callback
     */
    async initCOS(callback) {
        let data = await storagePromise.get(this.name + '_key');
        if (data && data.access_key && data.secret_key) {
            this.cos.init({access_key: data.access_key, secret_key: data.secret_key});
            callback && callback(true);
        } else {
            callback && callback(false);
        }
    }

    /**
     * 保存当前cos key信息
     * @param param
     * @param callback
     */
    async saveCosKey(param, callback) {
        let params = {
            access_key: param.access_key,
            secret_key: param.secret_key
        };
        await storagePromise.set(this.name + '_key', params);
        callback && callback();
    }

    /**
     * 删除当前cos key信息
     * @param callback
     */
    cleanCosKey(callback) {
        storage.remove(this.name + '_key', (error, data) => {
            if (!error) {
                callback && callback();
            }
        });
    }
}