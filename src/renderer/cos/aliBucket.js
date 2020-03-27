import {util} from '../service/index';
import baseBucket from './baseBucket';
import Client from 'ali-oss/lib/client';
import brand from '@/cos/brand';

class Bucket extends baseBucket {

    constructor(name, cos) {
        super(name, cos);
        this.key = brand.aliyun.key;
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
                this.cos.useBucket(this.name);
                //setRegion
            }
        });

        this.getACL();
        // this.getDomains();
    }

    /**
     * 获取Bucket访问权限状态
     */
    getACL() {
        this.cos.getBucketInfo(this.name).then((res) => {

            this.cos.options.region = res.bucket.Location;
            //未找到api获取状态
            this.cos.options.secure = false;
            delete this.cos.options.endpoint;
            this.cos.options = Client.initOptions(this.cos.options);

            this.setPermission(res.bucket.AccessControlList.Grant === 'private' ? 1 : 0);
            this.getResources();
        });
    }

    createFile(_param, type, callback) {
        this.cos.put(_param.key, _param.path).then((result) => {
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

    getResources(option = {}) {
        super.getResources();
        //delimiter
        let params = {
            'max-keys': this.limit,
        };

        if (option.keyword) {
            params.prefix = option.keyword;
        }

        if (this.marker) {
            params.marker = this.marker;
        }

        this.cos.list(params).then((data) => {
            if (!this.marker) {
                this.files = [];
            }
            let files = [];
            // TODO:空记录检测
            if (data.objects) {
                data.objects.forEach((item) => {
                    if (parseInt(item.Size) !== 0) {
                        files.push(util.convertMeta(item, brand.aliyun.key));
                    }
                });
            }

            // data.items = files;
            // data.marker = data.nextMarker;
            this.appendResources({
                items: files,
                marker: data.nextMarker
            }, option);
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
        let url;
        if (this.permission === 1) {
            url = this.cos.signatureUrl(key, {
                expires: parseInt(deadline)
            });
        } else {
            url = this.cos.generateObjectUrl(key);
        }
        return super.generateUrl(url);
    }
}


export default Bucket;
