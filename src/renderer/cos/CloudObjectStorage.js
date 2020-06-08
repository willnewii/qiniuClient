import * as storagePromise from '../service/storagePromise';

const uuid = require('uuid/v1');

import * as qiniu from '../cos/qiniu';
import * as tencent from '../cos/tencent';
import * as qing from '../cos/qing';
import * as ali from '../cos/ali';
import * as upyun from '../cos/upyun';
import * as aws from '../cos/aws';
import * as jd from '../cos/jd';

import brand from '../cos/brand';

const KEY_COS = 'cos_keys';

export default class CloudObjectStorage {
    constructor() {
        //存储选择的cos信息
        this.info = {};

        Object.defineProperty(this, "name", {
            get: function () {
                return this.info.name;
            },
        });

        Object.defineProperty(this, "key", {
            get: function () {
                return this.info.key;
            },
        });
    }

    setBrand(key) {
        switch (key) {
            case brand.qiniu.key:
                this.cos = qiniu;
                break;
            case brand.tencent.key:
                this.cos = tencent;
                break;
            case brand.qingstor.key:
                this.cos = qing;
                break;
            case brand.aliyun.key:
                this.cos = ali;
                break;
            case brand.upyun.key:
                this.cos = upyun;
                break;
            case brand.aws.key:
                this.cos = aws;
                break;
            case brand.jd.key:
                this.cos = jd;
                break;
            case brand.minio.key:
                this.cos = aws;
                break;
        }
    }

    /**
     * 初始化当前cos ,只做了非空验证
     * @param data
     * @param callback
     */
    initCOS(data, callback) {
        if (data && data.access_key && data.secret_key) {
            this.info = data;
            this.setBrand(data.key);
            this.cos.init(data);
            callback && callback(true);
        } else {
            callback && callback(false);
        }
    }

    /**
     * 用于校验COS授权是否成功
     * @param callback
     */
    getBuckets(callback) {
        if (this.cos) {
            this.cos.getBuckets((error, result) => {
                console.log("获取存储桶===>", result);
                callback && callback(error, result);
            });
        } else {
            callback && callback(new Error("cos 未初始化"));
        }
    }

    /**
     * 获取已授权的cos列表
     * @param callback
     * @returns {Promise<void>}
     */
    async getBindCoses(callback) {
        let cos_keys = await storagePromise.get(KEY_COS);
        // 兼容之前的配置写法
        if (Object.keys(cos_keys).length === 0) {
            cos_keys = [];
            for (let item of Object.keys(brand)) {
                let data = await storagePromise.get(brand[item].key + '_key');
                if (data && data.access_key && data.secret_key) {
                    data.uuid = uuid();
                    cos_keys.push(Object.assign(data, brand[item]));
                }
            }
            await storagePromise.set(KEY_COS, cos_keys);
        }
        callback({coses: cos_keys});
    }

    /**
     * 保存当前cos key信息
     * @param item
     * @param callback
     */
    async saveCosKey(item, callback) {
        item.uuid = uuid();
        let cos_keys = await storagePromise.get(KEY_COS);
        if (Object.keys(cos_keys).length === 0) {
            cos_keys = [];
            cos_keys.push(item);
        } else {
            cos_keys.push(item);
        }
        await storagePromise.set(KEY_COS, cos_keys);
        callback && callback();
    }

    async updateCosKey(item, casllback) {
        let cos_keys = await storagePromise.get(KEY_COS);

        cos_keys.forEach((_item, index) => {
            if (_item.uuid === item.uuid) {
                cos_keys[index] = item;
            }
        });
        await storagePromise.set(KEY_COS, cos_keys);
        callback && callback();
    }

    /**
     * 删除当前cos key信息
     * @param item
     * @param callback
     */
    async cleanCosKey(item, callback) {
        let cos_keys = await storagePromise.get(KEY_COS);

        cos_keys.forEach((_item, index) => {
            if (_item.uuid === item.uuid) {
                cos_keys.splice(index);
            }
        });
        await storagePromise.set(KEY_COS, cos_keys);
        callback && callback();
    }
}
