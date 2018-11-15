import * as Constants from "@/service/constants";

const fs = require('fs');
import {util} from '../service/index';
import baseBucket from './baseBucket';
import * as qing from './qing';

const mime = require('mime-types');
import * as types from '../vuex/mutation-types';
import * as qiniu from "@/cos/qiniu";

class Bucket extends baseBucket {

    /**
     * 获取bucket访问权限
     * 获取资源
     * @param vm => page
     */
    bindPage(vm) {
        this.vm = vm;

        this.vm.buckets_info.forEach((item) => {
            if (item.name === this.name) {
                this.location = item.location;
                this.bucket = this.cos.Bucket(this.name, this.location);
            }
        });

        this.getACL();
        // this.getDomains();
    }

    /**
     * 获取Bucket访问权限状态
     */
    getACL() {
        this.bucket.getACL((err, data) => {
            let flag = true;
            if (data && data.acl.length > 0) {
                for (let item of data.acl) {
                    if (item.grantee.name === 'QS_ALL_USERS') {
                        flag = false;
                    }
                }
            }
            this.isprivate = flag;
            let array = this.vm.buckets_info.concat();
            // TODO: VUEX 值更新问题
            array.forEach((item, index) => {
                if (item.name === this.name) {
                    array[index].isprivate = flag;
                }
            });
            this.vm[types.app.a_buckets_info](array);
            this.getResources();
        });
    }

    createFile(_param, type, callback) {
        let params = {};

        if (type === Constants.UploadType.FETCH) {
            params = {
                'X-QS-Fetch-Source': _param.path,
            };
        } else if (type === Constants.UploadType.UPLOAD) {
            params = {
                'body': fs.readFileSync(_param.path),
                'Content-Length': fs.statSync(_param.path).size,
                'Content-Type': mime.lookup(_param.key)
            };
        }
        this.bucket.putObject(_param.key, params, function (err, data) {
            console.log(err, data);
            callback(err, {key: _param.key});
        });
    }

    async removeFile(item, callback) {
        for (let file of item) {
            let data = await this.bucket.deleteObject(file.key);
            console.log(data);
        }
        callback && callback();
    }

    async renameFile(items, callback) {
        for (let file of items) {
            console.log(this.name, file.key, file._key);
            let data = await this.bucket.putObject(file._key, {
                'X-QS-Move-Source': '/' + this.name + '/' + file.key,
            });
            console.log(data);
        }
        callback && callback();
    }

    getResources(keyword) {
        let params = {
            limit: this.limit,
        };

        if (keyword) {
            params.prefix = keyword;
        }

        if (this.marker) {
            params.marker = this.marker;
        }

        this.cos.Bucket(this.name, this.location).listObjects(params, (err, data) => {
            if (!this.marker) {
                this.files = [];
            }
            let files = [];
            data.keys.forEach((item) => {
                if (parseInt(item.Size) !== 0) {
                    files.push(util.convertMeta(item, 2));
                }
            });

            data.items = files;
            data.marker = data.next_marker;
            this.appendResources(data, keyword);
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
        if (this.isprivate) {
            return this.cos.Bucket(this.name, this.location).getObjectRequest(key).signQuery(parseInt(Date.now() / 1000) + deadline).operation.uri;
        } else {
            return qing.generateUrl(`${this.name}.${this.location}.qingstor.com`, key, (this.isprivate ? deadline : null));
        }
    }
}


export default Bucket;