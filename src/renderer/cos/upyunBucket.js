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

        this.getResources();
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

    getResources(keyword) {
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

        this.cos.listDir('/', params).then((data) => {
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
        return "";
    }
}


export default Bucket;