const fs = require('fs');
import {util} from '../service/index';
import baseBucket from './baseBucket';

class Bucket extends baseBucket {

    /**
     * 获取bucket访问权限
     * 获取资源
     * @param vm => page
     */
    bindPage(vm) {
        this.vm = vm;

        this.getDomains();
        this.getResources();
    }

    getDomains() {
        let customeDomains = this.vm.customeDomains;
        if (customeDomains && customeDomains[this.name]) {
            this.domains = [customeDomains[this.name]];
            this.domain = customeDomains[this.name];
            this.https = false;
        }
    }

    createFile(_param, type, callback) {
        this.cos.putFile(_param.key, fs.createReadStream(_param.path)).then((result) => {
            console.log(result);
            callback(null, {key: _param.key});
        });
    }

    async removeFile(item, callback) {
        let keys = [];
        for (let file of item) {
            keys.push(file.key);
        }
        const result = await this.cos.deleteMulti(keys);
        console.log(result);
        callback && callback();
    }

    async renameFile(items, callback) {
        for (let file of items) {
            let data = await this.cos.copy(file._key, file.key);
            let result = await this.cos.delete(file.key);
            console.log(data, result);
        }
        callback && callback();
    }

    getResources(keyword, path = '/') {
        //delimiter
        let params = {
            'limit': this.limit,
        };

        if (keyword) {
            params.prefix = keyword;
        }

        if (this.marker) {
            params.iter = this.marker;
        }

        this.cos.listDir(path, params).then((data) => {
            if (!this.marker) {
                this.files = [];
            }
            let files = [];
            data.files.forEach((item) => {
                if (parseInt(item.Size) !== 0) {
                    files.push(util.convertMeta(item, 4));
                }
            });

            data.items = files;
            data.marker = (files.length > 0) ? data.next : '';
            this.appendResources(data, keyword);
        }).catch((error) => {
            console.dir(error);
        });
    }

    /**
     * 返回资源真实链接
     * @param index
     * @param key
     * @param deadline  私有模式,文件有效期
     * @returns {*}
     */
    generateUrl(key, deadline) {
        if (this.domain) {
            let domain = this.domain;

            if (!/^https?:\/\//.test(domain)) {
                domain = 'http://' + domain;
            }

            if (domain.lastIndexOf('/') === domain.length - 1) {
                return super.generateUrl(domain + key);
            } else {
                return super.generateUrl(domain + "/" + key);
            }
        } else {
            return '';
        }
    }
}


export default Bucket;