import * as qiniu from '../cos/qiniu';

const storage = require('electron-json-storage');

const NAMES = {
    qiniu: 'qiniu'
};

class CloudObjectStorage {
    constructor(name) {
    }

    setname(name) {
        this.name = name;

        switch (name) {
            case NAMES.qiniu:
                this.cos = qiniu;
        }
    }

    init(param) {
        this.cos.init({access_key: param.access_key, secret_key: param.secret_key});
    }

    saveKey(param, callback) {
        storage.set(this.name + '_key', {
            access_key: param.access_key,
            secret_key: param.secret_key
        }, (error) => {
            console.log(error);
            if (!error) {
                callback && callback();
            }
        });
    }

    getKey(callback) {
        storage.get(this.name + '_key', (error, data) => {
            if (!error) {
                if (data.access_key && data.secret_key) {
                    callback && callback(data);
                } else {
                    callback && callback();
                }
            }
        });
    }

    logout(callback) {
        storage.clear(this.name + '_key', (error, data) => {
            if (!error) {
                callback && callback();
            }
        });
    }

    /**
     * 根据url,生成鉴权信息
     * @param url
     * @returns {*}
     */
    getHttpAuthorization(url) {
        return this.cos.httpAuthorization(url);
    }
}

export {CloudObjectStorage, NAMES};