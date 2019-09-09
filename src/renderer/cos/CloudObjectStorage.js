import * as storagePromise from '../service/storagePromise';
const uuid = require('uuid/v1');

import * as qiniu from '../cos/qiniu';
import * as tencent from '../cos/tencent';
import * as qing from '../cos/qing';
import * as ali from '../cos/ali';
import * as upyun from '../cos/upyun';

import brand from '../cos/brand';

const KEY_COS = 'cos_keys';

export default class CloudObjectStorage {
    constructor() {
        //存储选择的cos信息
        this.info = null ;
    }

    setBrand(brandName) {
        switch (brandName) {
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
        }
        this.brandName = brandName;
    }

    /**
     * 初始化当前cos ,只做了非空验证
     * @param callback
     */
    async initCOS(data, callback) {
        if (data && data.access_key && data.secret_key) {
            this.info = data;
            this.cos.init(data);
            callback && callback(true);
        } else {
            callback && callback(false);
        }
    }

    getBuckets(callback) {
        this.cos.getBuckets((error, result) => {
            console.log("获取存储桶===>", result);
            callback && callback(error, result);
        });
    }

    /**
     * 获取已有key的cos列表
     * @param callback
     * @returns {Promise<void>}
     */
    async getCOS(callback) {
        let cos_keys = await storagePromise.get(KEY_COS);
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
        callback({cos: cos_keys});
    }

    /**
     * 保存当前cos key信息
     * @param param
     * @param callback
     */
    async saveCosKey(param, callback) {
        param.uuid = uuid();
        let cos_keys = await storagePromise.get(KEY_COS);
        if (Object.keys(cos_keys).length === 0) {
            cos_keys = [];
            cos_keys.push(param);
        } else {
            cos_keys.push(param);
        }
        await storagePromise.set(KEY_COS, cos_keys);
        callback && callback();
    }

    /**
     * 删除当前cos key信息
     * @param callback
     */
    async cleanCosKey(callback) {
        let cos_keys = await storagePromise.get(KEY_COS);

        cos_keys.forEach((item, index) => {
            if (item.access_key === this.info.access_key) {
                cos_keys.splice(index);
            }
        });
        await storagePromise.set(KEY_COS, cos_keys);
        callback && callback();
    }
}
