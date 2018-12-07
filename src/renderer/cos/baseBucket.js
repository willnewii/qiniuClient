import {Constants, EventBus, util} from '../service/index';
import * as types from "@/vuex/mutation-types";

class baseBucket {

    constructor(name, cos) {
        this.reset();

        name && (this.name = name);
        this.cos = cos;

        this.limit = 1000;
    }

    reset() {
        this.name = '';
        this.location = '';
        //操作权限 0：正常 1：私有
        this.permission = 0;

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

        this.https = false;

        //旧设计,Table 中使用,稍后会弃用
        this.dirs = [];
        this.dirs.push('');//全部
        //当前选择dir
        this.currentDir = '';
        //其他文件列表(不含有请求时delimiter的文件列表)
        this.withoutDelimiterFiles = [];
    }

    /**
     * 0: 正常 1：私有
     * @param permission
     */
    setPermission(permission) {
        this.permission = permission;
        if (this.vm) {
            this.vm[types.app.a_update_buckets_info]({name: this.name, permission: this.permission});
        }

        this.https = this.vm[types.setup.setup_https];
    }

    getResources() {
        EventBus.$emit(Constants.Event.loading, {
            show: true,
            message: '数据加载中,请稍后',
            flag: 'getResources'
        });
    }

    /**
     * 根据marker状态判断是否继续请求
     * 请将data数据统一转换: items | marker
     * @param data
     * @param keyword
     */
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

    /**
     * 根据子类url,统一做处理
     * @param url
     */
    generateUrl(url) {
        if (this.https && url.startsWith('http://')) {
            return url.replace('http://', 'https://');
        }

        console.log(url);
        return url;
    }
}

export default baseBucket;