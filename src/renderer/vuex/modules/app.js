/**
 * Created by zhangweiwei on 2017/2/28.
 */
import * as types from '../mutation-types';

import {util} from '../../service';

const storage = require('electron-json-storage');

function setAppSetup(app) {
    storage.set('app_setup', app);
}

export default {
    state: {
        setup: {
            deleteNoAsk: false,//文件删除前是否弹出对话框
            copyType: 'markdown',
            bucket_name: '',
            bucket_dir: '',
            customedomain: {},
            imagestyle: 'imageView2/1/w/100/h/100/format/webp/q/10',//Grid时,提供了图片预览,可以设置的预览图片的压缩方式
            downloaddir: '',//设置文件的下载路径
            privatebucket: [],//七牛私有空间不能通过api获取,只能用户手动标记
            privatedeadline: 3600//默认1小时
        },
        app_buckets: [],
    },
    mutations: {
        [types.APP.setup_privatebucket](state, value) {
            state.setup.privatebucket = value;
            setAppSetup(state.setup);
        },
        [types.APP.setup_deadline](state, value) {
            state.setup.privatedeadline = value;
            setAppSetup(state.setup);
        },
        [types.APP.setup_downloaddir](state, value) {
            state.setup.downloaddir = value;
            setAppSetup(state.setup);
        },
        [types.APP.setup_deleteNoAsk](state, value) {
            state.setup.deleteNoAsk = value;
            setAppSetup(state.setup);
        },
        [types.APP.setup_copyType](state, value) {
            state.setup.copyType = value;
            setAppSetup(state.setup);
        },
        [types.APP.setup_customedomain](state, value) {
            if (!state.setup.customedomain) {
                state.setup.customedomain = {};
            }
            state.setup.customedomain = Object.assign(state.setup.customedomain, value);
            setAppSetup(state.setup);
        },
        [types.APP.setup_savedir](state, value) {
            state.setup.bucket_name = value[0];
            state.setup.bucket_dir = value[1];

            setAppSetup(state.setup);
        },
        [types.APP.setup_imagestyle](state, value) {
            state.setup.imagestyle = value;
            setAppSetup(state.setup);
        },
        [types.APP.app_buckets](state, value) {
            state.app_buckets = value;
        },
        [types.APP.app_setup_init](state, value) {
            state.setup = value;
        },
    },
    actions: {
        [types.APP.setup_a_deadline](context, value) {
            context.commit(types.APP.setup_deadline, value);
        },
        [types.APP.setup_a_privatebucket](context, value) {
            context.commit(types.APP.setup_privatebucket, value);
        },
        [types.APP.setup_a_imagestyle](context, value) {
            context.commit(types.APP.setup_imagestyle, value);
        },
        [types.APP.setup_a_deleteNoAsk](context, json) {
            context.commit(types.APP.setup_deleteNoAsk, json);
        },
        [types.APP.setup_a_downloaddir](context, json) {
            context.commit(types.APP.setup_downloaddir, json);
        },
        [types.APP.setup_a_copyType](context, json) {
            context.commit(types.APP.setup_copyType, json);
        },
        [types.APP.setup_a_savedir](context, value) {
            context.commit(types.APP.setup_savedir, value);
        },
        [types.APP.setup_a_customedomain](context, value) {
            context.commit(types.APP.setup_customedomain, value);
        },
        [types.APP.app_a_buckets](context, value) {
            context.commit(types.APP.app_buckets, value);
        },
        [types.APP.app_a_setup_init](context, callback) {
            storage.get('app_setup', (error, app) => {
                if (!error) {
                    if (!util.isEmptyObject(app)) {
                        context.commit(types.APP.app_setup_init, app);
                        callback && callback();
                    }
                }
            });
        },
    },
    getters: {
        [types.APP.setup_deadline](state) {
            return ('privatedeadline' in state.setup) ? state.setup.privatedeadline : 3600;
        },
        [types.APP.setup_privatebucket](state) {
            return ('privatebucket' in state.setup) ? state.setup.privatebucket : [];
        },
        [types.APP.setup_downloaddir](state) {
            return ('downloaddir' in state.setup) ? state.setup.downloaddir : '';
        },
        [types.APP.setup_imagestyle](state) {
            return ('imagestyle' in state.setup) ? state.setup.imagestyle : 'imageView2/1/w/100/h/100/format/webp/q/10';
        },
        [types.APP.setup_deleteNoAsk](state) {
            return ('deleteNoAsk' in state.setup) ? state.setup.deleteNoAsk : false;
        },
        [types.APP.setup_copyType](state) {
            return ('copyType' in state.setup) ? state.setup.copyType : 'url';
        },
        [types.APP.setup_bucket_name](state) {
            return ('bucket_name' in state.setup) ? state.setup.bucket_name : '';
        },
        [types.APP.setup_bucket_dir](state) {
            return ('bucket_dir' in state.setup) ? state.setup.bucket_dir : '';
        },
        [types.APP.setup_customedomain](state) {
            return ('customedomain' in state.setup) ? state.setup.customedomain : {};
        },
        [types.APP.app_buckets](state) {
            return state.app_buckets;
        }
    }
};