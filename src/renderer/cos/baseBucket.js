import * as Constants from "@/service/constants";

class baseBucket {

    constructor(name, cos) {
        this.reset();

        name && (this.name = name);
        this.cos = cos;
    }

    reset() {
        this.name = '';
        //是否是私有空间
        this.isprivate = false;

        //当前bucket 的可用域名列表
        this.domains = [];
        //当前选择domain
        this.domain = '';
        //缓存请求时返回的marker
        this.marker = '';

        //当前bucket源数据
        this.files = [];
        //已选的文件列表,批处理时使用
        this.selection = [];
        //当前路径
        this.folderPath = '';


        //旧设计,Table 中使用,稍后会弃用
        this.dirs = [];
        this.dirs.push('');//全部
        this.dirs.push(Constants.Key.withoutDelimiter);//其它
        //当前选择dir
        this.currentDir = '';
        //其他文件列表(不含有请求时delimiter的文件列表)
        this.withoutDelimiterFiles = [];
    }
}

export default baseBucket;