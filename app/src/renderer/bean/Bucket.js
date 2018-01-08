import {Constants} from '../service/index';

const delimiter = '/';

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
        //全部文件列表
        this.files = [];
        //其他文件列表(不含有请求时delimiter的文件列表)
        this.withoutDelimiterFiles = [];
        //显示类型 0: table  1: grid
        this.showType = 0;
    }

    /**
     * 检测是否是私密空间
     * @param privatebuckets
     */
    checkPrivate(privatebuckets) {
        this.isprivate = (privatebuckets && privatebuckets.length > 0 && privatebuckets.indexOf(this.name) !== -1);
    }

    /**
     * 设置domains
     * 如果正常读取domains,默认匹配最后一个(目前clouddn.com域名在最前,正好最后可以匹配自定义域名)
     * 如果domains为空,查询customeDomains
     * @param domains
     * @param customeDomains
     */
    setDomains(domains , customeDomains) {
        if(domains && domains.length > 0){
            this.domains = domains;
            //默认选择最后一个域名
            this.domain = this.domains[this.domains.length - 1];
        }else{
            if (customeDomains && customeDomains[this.name]) {
                this.domain = customeDomains[this.name];
            } else {
                this.domain = '';
            }
        }
    }

    /**
     * 添加dirs
     * @param data
     */
    setDirs(data){
        if (data.commonPrefixes) {
            this.dirs = this.dirs.concat(data.commonPrefixes);
        }

        if (data.items) {//不包含公共前缀的文件列表,会出现其他文件夹列表
            this.withoutDelimiterFiles = this.withoutDelimiterFiles.concat(data.items);
        }
    }

    /**
     * 添加files
     * @param data
     */
    setResources(data){
        this.files = this.marker ? this.files.concat(data.items) : data.items;
        this.marker = data.marker ? data.marker : '';
    }
}

export default Bucket;