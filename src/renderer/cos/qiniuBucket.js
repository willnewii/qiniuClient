import {Constants, util} from '../service/index';
import * as qiniu from '../cos/qiniu';
import baseBucket from './baseBucket';
import Request from "@/api/API";
import brand from "../cos/brand";
import dayjs from 'dayjs';

class Bucket extends baseBucket {

    constructor(name, cos) {
        super(name, cos);
        this.brand = brand.qiniu.key;
        this.paging = false;
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
        this.getTotal((info) => {
            if (info) {
                this.space = info.space;
                this.count = info.count;

                if (info.count > Constants.PAGESIZE) {
                    this.paging = true;
                }
            }
            this.getResources();
        });
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
        request.get(qiniu.methods.domains, {tbl: this.name}).then((result) => {
            let domains = result;
            let customeDomains = this.vm.customeDomains;
            if (domains && domains.length > 0) {

                for (let i = 0; i < domains.length; i++) {
                    domains[i] = domains[i];
                }
                this.domains = domains;
                //默认选择最后一个域名
                this.domain = this.domains[this.domains.length - 1];
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


    /**
     * 空间统计
     * 尝试获取 标准或低频空间的最近一天的文件数量统计
     * @param callback
     */
    getTotal(callback) {
        super.getResources();
        const formatStr = 'YYYYMMDD000000';
        let day = dayjs();
        let param = `?bucket=${this.name}&begin=${day.add(-1, 'day').format(formatStr)}&end=${day.format(formatStr)}&g=day`;


        let request1 = new Request();
        let url1 = `${qiniu.methods.count}${param}`;

        let request2 = new Request();
        let url2 = `${qiniu.methods.count_line}${param}`;

        let request3 = new Request();
        let url3 = `${qiniu.methods.space}${param}`;

        let request4 = new Request();
        let url4 = `${qiniu.methods.space_line}${param}`;

        Promise.all([request1.get(url1), request2.get(url2), request3.get(url3), request4.get(url4)]).then((result) => {
            console.log(result[2].datas[0], result[3].datas[0]);
            callback && callback({
                count: result[0].datas[0] || result[1].datas[0],
                space: result[2].datas[0] || result[3].datas[0]
            });
        }).catch((error) => {
            console.log(error);
            callback && callback({
                count: 0,
                space: 0
            });
        });
    }

    getResources(option = {}) {
        super.getResources();
        //重置多选数组
        this.selection = [];

        let param = {
            bucket: this.name,
            limit: this.limit
        };

        if (option.keyword) {
            param.prefix = option.keyword;
        }

        if (this.paging) {
            param.delimiter = '/';
            param.prefix && (param.prefix += '/');
        }

        if (this.marker) {
            param.marker = this.marker;
        }

        qiniu.list(param, (respErr, respBody, respInfo) => {
            if (respErr) {
                console.error(respErr);
                return;
            }

            let data = respInfo.data;
            data.items.forEach((item, index) => {
                data.items[index] = util.convertMeta(item, 0);
            });
            //commonPrefixes 文件夹
            data.commonPrefixes && data.commonPrefixes.forEach((item, index) => {
                let key = item.substring(0, item.length - 1);
                data.items.push({
                    key: key,
                    type: Constants.FileType.folder,
                    fsize: 0,
                });
            });

            this.appendResources(data, option);
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
}


export default Bucket;