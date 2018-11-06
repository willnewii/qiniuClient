import {Constants, EventBus, util} from '../service/index';

class baseBucket {

    constructor(name, cos) {
        this.reset();

        name && (this.name = name);
        this.cos = cos;

        this.limit = 1000;
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
        //分页加载,数据加载后先保存在tempFiles,加载完毕后在使用files
        this.tempFiles = [];
        //已选的文件列表,批处理时使用
        this.selection = [];
        //当前路径
        this.folderPath = '';

        //下载列表
        this.downloads = [];
        //上传列表
        this.uploads = [];


        //旧设计,Table 中使用,稍后会弃用
        this.dirs = [];
        this.dirs.push('');//全部
        this.dirs.push(Constants.Key.withoutDelimiter);//其它
        //当前选择dir
        this.currentDir = '';
        //其他文件列表(不含有请求时delimiter的文件列表)
        this.withoutDelimiterFiles = [];
    }

    getResources() {
        EventBus.$emit(Constants.Event.loading, {
            show: true,
            message: '数据加载中,请稍后',
            flag: 'getResources'
        });
    }

    appendResources(data, keyword) {
        this.tempFiles = this.marker ? this.tempFiles.concat(data.items) : data.items;
        this.marker = data.marker ? data.marker : '';

        if (this.marker) {
            this.getResources(keyword);
        } else {
            EventBus.$emit(Constants.Event.loading, {
                show: false,
                flag: 'getResources'
            });
            this.files = Object.freeze(this.tempFiles);
            this.tempFiles = [];
        }
    }
}

export default baseBucket;