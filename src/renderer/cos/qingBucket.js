import * as Constants from "@/service/constants";
import brand from '@/cos/brand';

const fs = require('fs');
import {util} from '../service/index';
import baseBucket from './baseBucket';
import * as qing from './qing';

const mime = require('mime-types');

class Bucket extends baseBucket {

    constructor(name, cos) {
        super(name, cos);
        this.key = brand.qingstor.key;
    }

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
        this.bucket.getACL().then((data) => {
            let flag = true;
            if (data && data.acl.length > 0) {
                for (let item of data.acl) {
                    if (item.grantee.name === 'QS_ALL_USERS') {
                        flag = false;
                    }
                }
            }
            this.setPermission(flag ? 1 : 0);
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
        this.bucket.putObject(_param.key, params).then((data) => {
            callback(null, {key: _param.key});
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

    getResources(option = {}) {
        super.getResources();
        let params = {
            limit: this.limit,
        };

        if (option.keyword) {
            params.prefix = option.keyword;
        }

        if (this.marker) {
            params.marker = this.marker;
        }

        this.cos.Bucket(this.name, this.location).listObjects(params).then((data) => {
            if (!this.marker) {
                this.files = [];
            }

            data.items = data.keys.map((item) => {
                return util.convertMeta(item, brand.qingstor.key);
            });
            data.marker = data.has_more ? data.next_marker : '';
            this.appendResources(data, option);
        });
    }

    /**
     * 返回资源真实链接
     * @param index
     * @param key
     * @param deadline  私有模式,文件有效期
     * @returns {*}
     */
    generateUrl(key, deadline = 3600) {
        let url;
        if (this.permission === 1) {
            url = qing.generateUrl(null, key, deadline, this.cos.Bucket(this.name, this.location).getObjectRequest(key));
        } else {
            url = qing.generateUrl(`${this.name}.${this.location}.qingstor.com`, key, null);
        }
        return super.generateUrl(url);
    }
}


export default Bucket;
