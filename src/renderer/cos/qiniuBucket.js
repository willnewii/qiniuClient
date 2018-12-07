import {Constants, EventBus, util} from '../service/index';
import * as qiniu from '../cos/qiniu';
import baseBucket from './baseBucket';
import Request from "@/api/API";
import {_httpAuthorization} from "../cos/qiniu";

class Bucket extends baseBucket {

    constructor(name, cos) {
        super(name, cos);
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

        this.getACL();
        this.getDomains();
        this.getResources();
    }

    /**
     * 检测是否属于私密空间
     */
    getACL() {
        let privateBuckets = this.vm.privatebucket;
        let permission = (privateBuckets && privateBuckets.length > 0 && privateBuckets.indexOf(this.name) !== -1) ? 1 : 0;
        this.setPermission(permission);
    }

    /**
     * 设置domains
     * 如果正常读取domains,默认匹配最后一个(目前clouddn.com域名在最前,正好最后可以匹配自定义域名)
     * 如果domains为空,查询customeDomains
     * 如果设置了自定义域名,https 默认设置为false
     */
    getDomains() {
        let request = new Request();
        let url = `${qiniu.methods.domains}?tbl=${this.name}`;

        request.setAuthorization(_httpAuthorization(url));
        request.get(url).then((result) => {
            let domains = JSON.parse(result.data);
            let customeDomains = this.vm.customeDomains;
            if (domains && domains.length > 0) {
                this.domains = domains;
                //默认选择最后一个域名
                this.domain = 'http://' + this.domains[this.domains.length - 1];
            } else {
                if (customeDomains && customeDomains[this.name]) {
                    this.domain = customeDomains[this.name];
                    this.https = false;
                } else {
                    this.domain = '';
                }
            }
        }).catch((error) => {
            console.log(error);
        });
    }

    getResources(keyword) {
        super.getResources();
        //重置多选数组
        this.selection = [];

        let param = {
            bucket: this.name,
            limit: this.limit
        };

        if (keyword) {
            param.prefix = keyword;
        }

        if (this.marker) {
            param.marker = this.marker;
        }

        qiniu.list(param, (respErr, respBody, respInfo) => {
            let data = respInfo.data;

            data.items.forEach((item, index) => {
                data.items[index] = util.convertMeta(item, 0);
            });

            this.appendResources(data, keyword);
        });
    }

    createFile(_param, type, callback) {
        let param = {
            bucket: this.name
        };
        Object.assign(param, _param);
        if (type === Constants.UploadType.FETCH) {
            qiniu.fetch(param, callback);
        } else if (type === Constants.UploadType.UPLOAD) {
            qiniu.upload(param, callback);
        }
    }

    removeFile(items, callback) {
        qiniu.remove(this.name, items, (ret) => {
            callback && callback(ret);
        });
    }

    renameFile(items, callback) {
        qiniu.rename(this.name, items, (ret) => {
            callback && callback(ret);
        });
    }

    /**
     * 返回资源真实链接,无域名时,返回空链接.
     * @param index
     * @param key
     * @param deadline  私有模式,文件有效期
     * @returns {*}
     */
    generateUrl(key, deadline) {
        let url = this.domain ? qiniu.generateUrl(this.domain, key, (this.permission === 1 ? deadline : null)) : '';
        return super.generateUrl(url);
    }

    /**
     *  已弃用
     *  搜索操作
     *  dir：目录
     *  search：关键字
     */
    search(dir, search = '') {
        this.marker = '';
        this.getResources(dir + search);
    }
}


export default Bucket;