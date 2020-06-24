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

        this.param = {
            Bucket: this.name,
            Region: this.location,
        }

        if (this.location) {
            this.getACL();
            // this.getDomains();
        }
    }

    /**
     * 获取Bucket访问权限状态
     */
    getACL() {
        this.cos.getBucketAcl(this.param, (err, data) => {
            this.setPermission(data.ACL === 'private' ? 1 : 0);
            this.getDomains();
        });
    }

    getDomains() {
        this.cos.getBucketDomain(this.param, (err, data) => {
            if (!err){
                let domains = data.DomainRule.filter((domain)=>{
                    return domain.Status === 'ENABLED'
                })
                this.domains = domains.map((domain)=>{
                    return domain.Name;
                })

                //匹配最近使用过的域名
                super.setRecentDomain();
                this.getResources();
            }else{
                console.error(err);
                this.getResources();
            }
        });

    }

    createFile(_param, type, callback) {
        let param = {
            ...this.param,
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
        tencent.remove(this.param, item, callback);
    }

    renameFile(items, callback) {
        tencent.rename(this.param, items, callback);
    }

    getResources(option = {}) {
        super.getResources();
        let params = {
            ...this.param,
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
                console.error(err);
            } else {
                if (!this.marker) {
                    this.files = [];
                }
                let files = [];
                data.marker = data.NextMarker ;
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
            ...this.param,
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
