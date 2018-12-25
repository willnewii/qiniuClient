/**
 * Created by zhangweiwei on 2018/08/15.
 */
import {util, storagePromise, Constants} from '@/service';
import * as types from '@/vuex/mutation-types';

function setAppSetup(app) {
    storagePromise.set(Constants.Key.configuration, app);
}

export default {
    state: {
        setup: {
            https: false,                                            //是否支持Https
            deleteNoAsk: false,                                     //文件删除前是否弹出对话框
            uploadNoAsk: true,                                      //文件上传时是否弹出对话框
            isOverwrite: true,                                      //上传时是否直接覆盖文件
            copyType: 'url',                                        //默认复制类型
            brand: '',                                              //托盘上传的 服务商/bucket/自定义路径
            bucket_name: '',
            bucket_dir: '',
            customedomain: {},
            imagestyle: 'imageView2/1/w/100/h/100/format/webp/q/10',//Grid时,提供了图片预览,可以设置的预览图片的压缩方式
            downloaddir: '',                                        //设置文件的下载路径
            privatebucket: [],                                      //七牛私有空间不能通过api获取,只能用户手动标记
            expiresTime: 3600,                                      //私有空间,过期时间默认1小时
            theme: 'auto',
            recentname: ''                                          //最近使用的bucketname
        }
    },
    mutations: {
        [types.setup.privatebucket](state, value) {
            state.setup.privatebucket = value;
            setAppSetup(state.setup);
        },
        [types.setup.isOverwrite](state, value) {
            state.setup.isOverwrite = value;
            setAppSetup(state.setup);
        },
        [types.setup.deadline](state, value) {
            state.setup.expiresTime = value;
            setAppSetup(state.setup);
        },
        [types.setup.downloaddir](state, value) {
            state.setup.downloaddir = value;
            setAppSetup(state.setup);
        },
        [types.setup.https](state, value) {
            state.setup.https = value;
            setAppSetup(state.setup);
        },
        [types.setup.deleteNoAsk](state, value) {
            state.setup.deleteNoAsk = value;
            setAppSetup(state.setup);
        },
        [types.setup.uploadNoAsk](state, value) {
            state.setup.uploadNoAsk = value;
            setAppSetup(state.setup);
        },
        [types.setup.copyType](state, value) {
            state.setup.copyType = value;
            setAppSetup(state.setup);
        },
        [types.setup.customedomain](state, value) {
            if (!state.setup.customedomain) {
                state.setup.customedomain = {};
            }
            state.setup.customedomain = Object.assign(state.setup.customedomain, value);
            setAppSetup(state.setup);
        },
        [types.setup.savedir](state, value) {
            state.setup.bucket_name = value[0];
            state.setup.bucket_dir = value[1];
            state.setup.brand = value[2];

            setAppSetup(state.setup);
        },
        [types.setup.imagestyle](state, value) {
            state.setup.imagestyle = value;
            setAppSetup(state.setup);
        },
        [types.setup.theme](state, value) {
            state.setup.theme = value;
            setAppSetup(state.setup);
        },
        [types.setup.recentname](state, value) {
            state.setup.recentname = value;
            setAppSetup(state.setup);
        },
        [types.setup.init](state, value) {
            state.setup = value;
        },
    },
    actions: {
        [types.setup.a_isOverwrite](context, value) {
            context.commit(types.setup.isOverwrite, value);
        },
        [types.setup.a_deadline](context, value) {
            context.commit(types.setup.deadline, value);
        },
        [types.setup.a_privatebucket](context, value) {
            context.commit(types.setup.privatebucket, value);
        },
        [types.setup.a_imagestyle](context, value) {
            context.commit(types.setup.imagestyle, value);
        },
        [types.setup.a_https](context, json) {
            context.commit(types.setup.https, json);
        },
        [types.setup.a_deleteNoAsk](context, json) {
            context.commit(types.setup.deleteNoAsk, json);
        },
        [types.setup.a_uploadNoAsk](context, json) {
            context.commit(types.setup.uploadNoAsk, json);
        },
        [types.setup.a_downloaddir](context, json) {
            context.commit(types.setup.downloaddir, json);
        },
        [types.setup.a_copyType](context, json) {
            context.commit(types.setup.copyType, json);
        },
        [types.setup.a_savedir](context, value) {
            context.commit(types.setup.savedir, value);
        },
        [types.setup.a_customedomain](context, value) {
            context.commit(types.setup.customedomain, value);
        },
        [types.setup.a_theme](context, value) {
            context.commit(types.setup.theme, value);
        },
        [types.setup.a_recentname](context, value) {
            context.commit(types.setup.recentname, value);
        },
        async [types.setup.init](context, callback) {
            let app = await storagePromise.get(Constants.Key.configuration);
            if (!util.isEmptyObject(app)) {
                context.commit(types.setup.init, app);
                callback && callback();
            }
        },
    },
    getters: {
        [types.setup.isOverwrite](state) {
            return ('isOverwrite' in state.setup) ? state.setup.isOverwrite : true;
        },
        [types.setup.deadline](state) {
            return ('expiresTime' in state.setup) ? state.setup.expiresTime : 3600;
        },
        [types.setup.privatebucket](state) {
            return ('privatebucket' in state.setup) ? state.setup.privatebucket : [];
        },
        [types.setup.downloaddir](state) {
            return ('downloaddir' in state.setup) ? state.setup.downloaddir : '';
        },
        [types.setup.imagestyle](state) {
            return ('imagestyle' in state.setup) ? state.setup.imagestyle : 'imageView2/1/w/100/h/100/format/webp/q/10';
        },
        [types.setup.https](state) {
            return ('https' in state.setup) ? state.setup.https : false;
        },
        [types.setup.deleteNoAsk](state) {
            return ('deleteNoAsk' in state.setup) ? state.setup.deleteNoAsk : false;
        },
        [types.setup.uploadNoAsk](state) {
            return ('uploadNoAsk' in state.setup) ? state.setup.uploadNoAsk : false;
        },
        [types.setup.copyType](state) {
            return ('copyType' in state.setup) ? state.setup.copyType : 'url';
        },
        [types.setup.brand](state) {
            return ('brand' in state.setup) ? state.setup.brand : '';
        },
        [types.setup.bucket_name](state) {
            return ('bucket_name' in state.setup) ? state.setup.bucket_name : '';
        },
        [types.setup.bucket_dir](state) {
            return ('bucket_dir' in state.setup) ? state.setup.bucket_dir : '';
        },
        [types.setup.customedomain](state) {
            return ('customedomain' in state.setup) ? state.setup.customedomain : {};
        },
        [types.setup.theme](state) {
            return ('theme' in state.setup) ? state.setup.theme : 'auto';
        },
        [types.setup.recentname](state) {
            return ('recentname' in state.setup) ? state.setup.recentname : '';
        }
    }
};