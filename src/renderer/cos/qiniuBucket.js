import {Constants} from '../service/index';
import * as qiniu from '../cos/qiniu';

const DELIMITER = '/';

class Bucket {

    constructor(name) {
        this.reset();

        name && (this.name = name);
    }

    reset() {
        this.name = '';
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
        //显示类型 0: table  1: grid
        this.showType = 0;
    }

    /**
     * 根据privateBuckets判断是否是私有空间
     * 获取域名
     * 获取目录
     * 获取默认资源列表
     * @param vm => page
     */
    init(vm) {
        this.vm = vm;

        this.checkPrivate(vm.privatebucket);

        this.getDomains();
        this.getDirs();
        this.getResources();
    }

    /**
     * 获取当前目录
     * @returns {*}
     */
    getCurrentDirStr() {
        if (this.currentDir === Constants.Key.withoutDelimiter) {
            return '';
        } else {
            return this.currentDir;
        }
    }

    /**
     * 返回目录数组,忽略前两个手动添加的'全部'，'其它'
     * @returns {T[]}
     */
    getDirArray() {
        return this.dirs.slice(2);
    }

    /**
     * 检测是否是私密空间
     * @param privateBuckets
     */
    checkPrivate(privateBuckets) {
        this.isprivate = (privateBuckets && privateBuckets.length > 0 && privateBuckets.indexOf(this.name) !== -1);
    }

    /**
     * 设置domains
     * 如果正常读取domains,默认匹配最后一个(目前clouddn.com域名在最前,正好最后可以匹配自定义域名)
     * 如果domains为空,查询customeDomains
     * @param domains
     * @param customeDomains
     */
    setDomains(domains, customeDomains) {
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
    }

    getDomains() {
        this.vm.doRequsetGet(qiniu.methods.domains, {tbl: this.name}, (response) => {
            if (!response)
                return;

            this.setDomains(response.data, this.vm.customeDomains);
        });
    }

    /**
     * 添加dirs
     * @param data
     */
    setDirs(data) {
        if (data.commonPrefixes) {
            this.dirs = this.dirs.concat(data.commonPrefixes);
        }

        if (data.items) {//不包含公共前缀的文件列表,会出现其他文件夹列表
            this.withoutDelimiterFiles = this.withoutDelimiterFiles.concat(data.items);
        }
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

        this.vm.doRequset(qiniu.methods.getResources, data, (response) => {
            if (!response)
                return;

            this.setDirs(response.data);

            response.data.marker && this.getDirs(response.data.marker);
        });
    }

    /**
     * 添加files
     * @param data
     */
    setResources(data) {
        this.files = this.marker ? this.files.concat(data.items) : data.items;
        this.marker = data.marker ? data.marker : '';
    }

    getResources(keyword) {
        //重置多选数组
        this.selection = [];

        let param = {
            bucket: this.name,
            limit: 100
        };

        if (keyword) {
            param.prefix = keyword;
        }

        if (this.marker) {
            param.marker = this.marker;
        }

        this.vm.doRequset(qiniu.methods.getResources, param, (response) => {
            if (!response)
                return;

            this.setResources(response.data);
            this.vm.isLoaded = true;
        });
    }

    /**
     * 搜索操作
     *  dir：目录
     *  search：关键字
     */
    search(dir, search) {
        this.marker = '';
        this.getResources(search ? dir + search : dir);
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
            bucket: this.name
        };
        Object.assign(param, _param);
        if (type === 'fetch') {
            qiniu.fetch(param, callback);
        } else {
            qiniu.upload(param, callback);
        }
    }

    removeFile(item, callback) {
        let param = {
            key: item.key,
            bucket: this.name
        };

        qiniu.remove(param, (ret) => {
            callback && callback(ret);
        });
    }

    /**
     * 返回资源真实链接
     * @param index
     * @param key
     * @param deadline  私有模式,文件有效期
     * @returns {*}
     */
    getResoureUrl(index, key, deadline) {
        let fileName = key ? key : this.files[index].key;

        let url;
        if (this.isprivate) {
            url = qiniu.getPrivateUrl(this.domain, fileName, deadline);
        } else {
            url = qiniu.getQiniuUrl(this.domain, fileName);
        }
        return url;
    }
}


export default Bucket;