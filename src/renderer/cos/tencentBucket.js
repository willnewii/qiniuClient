import EventBus from "@/service/EventBus";

const fs = require('fs');
import {Constants, util} from '../service/index';
import baseBucket from './baseBucket';
import * as tencent from './tencent';

const DELIMITER = '/';

class Bucket extends baseBucket {

    constructor(name, cos) {
        super(name, cos);
    }

    reset() {
        super.reset();

        //腾讯COS字段
        this.location = '';
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
            // this.getDirs();
            this.getResources();
        }
        /*this.checkPrivate();
        this.getDomains();
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

    checkPrivate() {
    }

    getDomains() {
    }

    /**
     * 获取该bucket下的目录
     * @param marker 上一次列举返回的位置标记，作为本次列举的起点标记
     */
    getDirs(marker) {//获取目录
        let params = {
            Bucket: this.name,
            Region: this.location,
            Delimiter: DELIMITER,
            MaxKeys: 1000,
        };
        if (marker) {
            params.Marker = marker;
        }

        this.cos.getBucket(params, (err, data) => {
            if (err) {
                console.log(err);
            } else {
                if (data.CommonPrefixes) {
                    data.CommonPrefixes.forEach((item) => {
                        this.dirs.push(item.Prefix);
                    });
                }

                if (data.Contents) {
                    data.Contents.forEach((item) => {
                        this.withoutDelimiterFiles.push(util.convertMeta(item));
                    });
                }

                data.NextMarker && this.getDirs(data.NextMarker);
            }
        });
    }


    getResources(keyword) {
        let params = {
            Bucket: this.name,
            Region: this.location,
            MaxKeys: this.limit,
        };

        if (keyword) {
            params.Prefix = keyword;
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
                        files.push(util.convertMeta(item, 1));
                    }
                });

                data.items = files;
                this.appendResources(data, keyword);
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