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
            deleteNoAsk: false,                                     //文件删除前是否弹出对话框
            isOverwrite: true,                                     //上传时是否直接覆盖文件
            copyType: 'url',
            brand: '',
            bucket_name: '',
            bucket_dir: '',
            customedomain: {},
            imagestyle: 'imageView2/1/w/100/h/100/format/webp/q/10',//Grid时,提供了图片预览,可以设置的预览图片的压缩方式
            downloaddir: '',                                        //设置文件的下载路径
            privatebucket: [],                                      //七牛私有空间不能通过api获取,只能用户手动标记
            privatedeadline: 3600,                                  //默认1小时
            theme: 'auto'
        }
    },
    mutations: {
        [types.setup.setup_privatebucket](state, value) {
            state.setup.privatebucket = value;
            setAppSetup(state.setup);
        },
        [types.setup.setup_isOverwrite](state, value) {
            state.setup.isOverwrite = value;
            setAppSetup(state.setup);
        },
        [types.setup.setup_deadline](state, value) {
            state.setup.privatedeadline = value;
            setAppSetup(state.setup);
        },
        [types.setup.setup_downloaddir](state, value) {
            state.setup.downloaddir = value;
            setAppSetup(state.setup);
        },
        [types.setup.setup_deleteNoAsk](state, value) {
            state.setup.deleteNoAsk = value;
            setAppSetup(state.setup);
        },
        [types.setup.setup_copyType](state, value) {
            state.setup.copyType = value;
            setAppSetup(state.setup);
        },
        [types.setup.setup_customedomain](state, value) {
            if (!state.setup.customedomain) {
                state.setup.customedomain = {};
            }
            state.setup.customedomain = Object.assign(state.setup.customedomain, value);
            setAppSetup(state.setup);
        },
        [types.setup.setup_savedir](state, value) {
            state.setup.bucket_name = value[0];
            state.setup.bucket_dir = value[1];
            state.setup.brand = value[2];

            setAppSetup(state.setup);
        },
        [types.setup.setup_imagestyle](state, value) {
            state.setup.imagestyle = value;
            setAppSetup(state.setup);
        },
        [types.setup.setup_theme](state, value) {
            state.setup.theme = value;
            setAppSetup(state.setup);
        },
        [types.setup.setup_init](state, value) {
            state.setup = value;
        },
    },
    actions: {
        [types.setup.setup_a_isOverwrite](context, value) {
            context.commit(types.setup.setup_isOverwrite, value);
        },
        [types.setup.setup_a_deadline](context, value) {
            context.commit(types.setup.setup_deadline, value);
        },
        [types.setup.setup_a_privatebucket](context, value) {
            context.commit(types.setup.setup_privatebucket, value);
        },
        [types.setup.setup_a_imagestyle](context, value) {
            context.commit(types.setup.setup_imagestyle, value);
        },
        [types.setup.setup_a_deleteNoAsk](context, json) {
            context.commit(types.setup.setup_deleteNoAsk, json);
        },
        [types.setup.setup_a_downloaddir](context, json) {
            context.commit(types.setup.setup_downloaddir, json);
        },
        [types.setup.setup_a_copyType](context, json) {
            context.commit(types.setup.setup_copyType, json);
        },
        [types.setup.setup_a_savedir](context, value) {
            context.commit(types.setup.setup_savedir, value);
        },
        [types.setup.setup_a_customedomain](context, value) {
            context.commit(types.setup.setup_customedomain, value);
        },
        [types.setup.setup_a_theme](context, value) {
            context.commit(types.setup.setup_theme, value);
        },
        async [types.setup.setup_init](context, callback) {
            let app = await storagePromise.get(Constants.Key.configuration);
            if (!util.isEmptyObject(app)) {
                context.commit(types.setup.setup_init, app);
                callback && callback();
            }
        },
    },
    getters: {
        [types.setup.setup_isOverwrite](state) {
            return ('isOverwrite' in state.setup) ? state.setup.isOverwrite : true;
        },
        [types.setup.setup_deadline](state) {
            return ('privatedeadline' in state.setup) ? state.setup.privatedeadline : 3600;
        },
        [types.setup.setup_privatebucket](state) {
            return ('privatebucket' in state.setup) ? state.setup.privatebucket : [];
        },
        [types.setup.setup_downloaddir](state) {
            return ('downloaddir' in state.setup) ? state.setup.downloaddir : '';
        },
        [types.setup.setup_imagestyle](state) {
            return ('imagestyle' in state.setup) ? state.setup.imagestyle : 'imageView2/1/w/100/h/100/format/webp/q/10';
        },
        [types.setup.setup_deleteNoAsk](state) {
            return ('deleteNoAsk' in state.setup) ? state.setup.deleteNoAsk : false;
        },
        [types.setup.setup_copyType](state) {
            return ('copyType' in state.setup) ? state.setup.copyType : 'url';
        },
        [types.setup.setup_brand](state) {
            return ('brand' in state.setup) ? state.setup.brand : '';
        },
        [types.setup.setup_bucket_name](state) {
            return ('bucket_name' in state.setup) ? state.setup.bucket_name : '';
        },
        [types.setup.setup_bucket_dir](state) {
            return ('bucket_dir' in state.setup) ? state.setup.bucket_dir : '';
        },
        [types.setup.setup_customedomain](state) {
            return ('customedomain' in state.setup) ? state.setup.customedomain : {};
        },
        [types.setup.setup_theme](state) {
            return ('theme' in state.setup) ? state.setup.theme : 'auto';
        }
    }
};