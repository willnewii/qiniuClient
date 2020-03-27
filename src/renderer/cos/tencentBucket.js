const fs = require('fs');

import {util} from '../service/index';
import brand from '@/cos/brand';
import baseBucket from './baseBucket';
import * as tencent from './tencent';

class Bucket extends baseBucket {

    constructor(name, cos) {
        super(name, cos);
        this.key = brand.tencent.key;
    }

    /**
     * 根据privateBuckets判断是否是私有空间
     * 获取域名
     * 获取目录
     * 获取默认资源列表
     * @param vm => page
     */
    bindPage(vm) {
        this.vm = vm;

        this.vm.buckets_info.forEach((item) => {
            if (item.Name === this.name) {
                this.location = item.Location;
            }
        });

        if (this.location) {
            this.getACL();
            this.getDomains();
        }
    }

    /**
     * 获取Bucket访问权限状态
     */
    getACL() {
        let param = {
            Bucket: this.name,
            Region: this.location,
        };

        this.cos.getBucketAcl(param, (err, data) => {
            this.setPermission(data.ACL === 'private' ? 1 : 0);
            this.getResources();
        });
    }

    getDomains() {
        let customeDomains = this.vm.customeDomains;
        if (customeDomains && customeDomains[this.name]) {
            this.domain = customeDomains[this.name];
            this.https = false ;
        }
    }

    createFile(_param, type, callback) {
        let param = {
            Bucket: this.name,
            Region: this.location,
            Key: _param.key,
            // Body: fs.readFileSync(_param.path),//onProgress 无响应
            Body: fs.createReadStream(_param.path),
            ContentLength: fs.statSync(_param.path).size,
            onProgress: function (progressData) {
                _param.progressCallback(progressData.percent * 100);
            }
        };

        this.cos.putObject(param, (err, data) => {
            callback(err, {key: _param.key});
        });
    }

    removeFile(item, callback) {
        let params = {
            Bucket: this.name,
            Region: this.location,
        };

        tencent.remove(params, item, callback);
    }

    renameFile(items, callback) {
        let params = {
            Bucket: this.name,
            Region: this.location,
        };

        tencent.rename(params, items, callback);
    }

    getResources(option = {}) {
        super.getResources();
        let params = {
            Bucket: this.name,
            Region: this.location,
            MaxKeys: this.limit,
        };

        if (option.keyword) {
            params.Prefix = option.keyword;
        }

        if (this.marker) {
            params.Marker = this.marker;
        }

        this.cos.getBucket(params, (err, data) => {
            if (err) {
                console.log(err);
            } else {
                if (!this.marker) {
                    this.files = [];
                }
                let files = [];
                data.Contents.forEach((item) => {
                    if (parseInt(item.Size) !== 0) {
                        files.push(util.convertMeta(item, brand.tencent.key));
                    }
                });

                data.items = files;
                this.appendResources(data, option);
            }
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
        let params = {
            Bucket: this.name,
            Region: this.location,
            Key: key,
            Expires: deadline,
            Sign: this.permission === 1 //是否需要签名
        };

        let url = this.cos.getObjectUrl(params);

        if (this.domain) {
            let obj = new URL(url);
            url = url.replace(obj.origin, this.domain);
        }

        return super.generateUrl(url);
    }
}


export default Bucket;
