import {Constants, EventBus, util} from '../service/index';
import * as types from "@/vuex/mutation-types";

//由于七牛返回目录的接口不确定,直接通过PageSIze,内容不定.分页模式下,只加载5次
const MAXCOUNT = 5;
let loadCount = 0;

class baseBucket {

    constructor(name, cos) {
        this.reset();

        name && (this.name = name);
        this.cos = cos;

        //单次请求加载条数
        this.limit = 1000;
    }

    reset() {
        this.brand = '';                //服务商
        this.space = '';                //空间容量
        this.count = '';               //文件个数
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
        //在generateUrl 返回https
        this.https = false;
        //分页加载
        this.paging = false;
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

        this.https = this.vm[types.setup.https];
    }

    /**
     * 此方法目前只有七牛云使用
     */
    getResources() {
        let txt = '数据加载中,请稍后';

        if (this.count !== '') {
            txt += `(${parseFloat(this.tempFiles.length / this.count * 100).toFixed(2)}%)`;
        }

        console.log(this.tempFiles.length, this.count, txt);
        if (this.paging) {
            txt += '  分页加载';
        }
        EventBus.$emit(Constants.Event.loading, {
            show: true,
            message: txt,
            flag: 'getResources'
        });
        loadCount++;
    }

    /**
     * 根据marker状态判断是否继续请求
     * 请将data数据统一转换: items | marker
     * @param data
     * @param option
     */
    appendResources(data, option) {
        this.tempFiles = this.marker ? this.tempFiles.concat(data.items) : data.items;
        this.marker = data.marker ? data.marker : '';

        //开启分页模式&文件数大于阀值&marker不为空
        console.log(`分页模式:${this.paging} tempFiles:${this.tempFiles.length}`);
        if (this.paging && loadCount >= MAXCOUNT && this.marker) {
            EventBus.$emit(Constants.Event.loading, {
                show: false,
                flag: 'getResources'
            });

            this.files = this.files.concat(Object.freeze(this.tempFiles));
            this.tempFiles = [];
            loadCount = 0;
        } else if (this.marker) {
            this.getResources(option);
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

        //默认添加http
        if (!/^https?:\/\//.test(url)) {
            url = 'http://' + url;
        }

        if (this.https && url.startsWith('http://')) {
            return url.replace('http://', 'https://');
        }

        return url;
    }
}

export default baseBucket;