const fs = require('fs');
import {Constants} from '../service/index';

const DELIMITER = '/';

class Bucket {

    constructor(name, cos) {
        this.reset();

        name && (this.name = name);
        this.cos = cos;
    }

    reset() {
        this.name = '';
        this.location = '';//腾讯COS字段
        this.domains = [];
        this.isprivate = false;

        this.dirs = [];
        this.dirs.push('');//全部
        this.dirs.push(Constants.Key.withoutDelimiter);//其它

        //当前选择dir
        this.currentDir = '';
        //当前选择domain
        this.domain = '';
        //当前dir加载返回的marker
        this.marker = '';

        //已选的文件列表
        this.selection = [];
        //当前显示文件列表
        this.files = [];
        //其他文件列表(不含有请求时delimiter的文件列表)
        this.withoutDelimiterFiles = [];
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
            this.getResources();//获取文件列表
        }
        /*this.checkPrivate();

        this.getDomains();
        this.getDirs();
        */
    }

    /**
     * 返回当前目录，[全部,其他]都返回''
     * @returns {*}
     */
    getCurrentDir() {
        return this.currentDir === Constants.Key.withoutDelimiter ? '' : this.currentDir;
    }

    /**
     * 返回目录数组,忽略前两个手动添加的'全部'，'其它'
     * @returns {T[]}
     */
    getDirArray() {
        return this.dirs.slice(2);
    }

    /**
     * 检测是否属于私密空间
     */
    checkPrivate() {
        let privateBuckets = this.vm.privatebucket;
        this.isprivate = (privateBuckets && privateBuckets.length > 0 && privateBuckets.indexOf(this.name) !== -1);
    }

    /**
     * 设置domains
     * 如果正常读取domains,默认匹配最后一个(目前clouddn.com域名在最前,正好最后可以匹配自定义域名)
     * 如果domains为空,查询customeDomains
     */
    getDomains() {
        this.vm.doRequset(qiniu.methods.domains, {tbl: this.name}, (response) => {
            if (!response)
                return;

            let domains = response.data;
            let customeDomains = this.vm.customeDomains;
            if (domains && domains.length > 0) {
                this.domains = domains;
                //默认选择最后一个域名
                this.domain = this.domains[this.domains.length - 1];
            } else {
                if (customeDomains && customeDomains[this.name]) {
                    this.domain = customeDomains[this.name];
                } else {
                    this.domain = '';
                }
            }
        });
    }

    /**
     * 获取该bucket下的目录
     * @param marker 上一次列举返回的位置标记，作为本次列举的起点标记
     */
    getDirs(marker) {//获取目录
        let data = {
            bucket: this.name,
            delimiter: DELIMITER,
            limit: 1000
        };
        if (marker) {
            data.marker = marker;
        }

        this.vm.doRequset(qiniu.methods.resources, data, (response) => {
            if (!response)
                return;

            let data = response.data;
            if (data.commonPrefixes) {
                this.dirs = this.dirs.concat(data.commonPrefixes);
            }

            if (data.items) {//不包含公共前缀的文件列表,会出现其他文件夹列表
                this.withoutDelimiterFiles = this.withoutDelimiterFiles.concat(data.items);
            }

            response.data.marker && this.getDirs(response.data.marker);
        });
    }


    getResources(keyword) {
        let params = {
            Bucket: this.name,
            Region: this.location
        };

        //key fsize mimeType putTime
        this.cos.getBucket(params, (err, data) => {
            if (err) {
                console.log(err);
            } else {
                console.log(data);
                data.Contents.forEach((item) => {
                    if (item.Key.indexOf('/') === item.Key.length - 1) {
                        let dir = item.Key.substring(0, item.Key.length - 1);
                        if (this.dirs.indexOf(dir) === -1) {
                            this.dirs.push(dir);
                        }
                    } else {
                        this.files.push({
                            key: item.Key,
                            fsize: item.Size,
                            putTime: new Date(item.LastModified).getTime(),
                            mimeType: ''
                        });
                    }
                });
            }
        });
    }

    /**
     * 搜索操作
     *  dir：目录
     *  search：关键字
     */
    search(dir, search = '') {
        this.marker = '';
        this.getResources(dir + search);
    }

    /**
     * 设置当前目录
     * @param dir
     */
    setCurrentDir(dir) {
        this.currentDir = dir;
        this.marker = '';

        if (dir === Constants.Key.withoutDelimiter) {
            this.files = this.withoutDelimiterFiles;
        } else {
            this.search(this.currentDir);
        }
    }

    createFile(_param, type, callback) {

        console.log(fs.readFileSync(_param.path));

        let param = {
            Bucket: this.name,
            Region: this.location,
            Key: _param.key,
            Body:fs.createReadStream(_param.path),
            ContentLength: fs.statSync(_param.path).size,
            onProgress: function (progressData) {
                console.log(JSON.stringify(progressData));
            }
        };

        console.log(param);
        this.cos.putObject(param, (err, data) => {
            console.log(err || data);
            //fs.unlinkSync(_param.path);
        });

        /*Object.assign(param, _param);
        if (type === 'fetch') {
            qiniu.fetch(param, callback);
        } else {
            qiniu.upload(param, callback);
        }*/
    }

    removeFile(item, callback) {
        this.cos.deleteObject({
            Bucket: this.name, // Bucket 格式：test-1250000000
            Region: this.location,
            Key: item.key,
        }, function (err, data) {
            console.log(err || data);
            callback && callback(data);
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
            Key: key
        };

        return this.cos.getObjectUrl(params, (err, data) => {
            //console.log(err || data);
        });
    }
}


export default Bucket;