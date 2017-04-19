/**
 * Created by zhangweiwei on 2017/2/28.
 */
import * as types from '../mutation-types'

import * as util from '../../util/util'
const storage = require('electron-json-storage');

function setAppSetup(key, value) {
    storage.get('app_setup', (error, app) => {
        if (!error) {
            app[key] = value;
            storage.set('app_setup', app);
        }
    })
}

export default {
    state: {
        setup: {
            deleteNoAsk: false,
            copyType: 'markdown',
            bucket_name: '',
            bucket_dir: '',
        },
        app_buckets: [],
        menuState:true
    },
    mutations: {
        [types.APP.setup_deleteNoAsk](state, value){
            state.setup.deleteNoAsk = value;
            setAppSetup('deleteNoAsk', value);
        },
        [types.APP.setup_copyType](state, value){
            state.setup.copyType = value;
            setAppSetup('copyType', value);
        },
        [types.APP.setup_savedir](state, bucket_name, bucket_dir){
            state.setup.bucket_name = bucket_name;
            state.setup.bucket_dir = bucket_dir;
        },
        [types.APP.app_buckets](state, value){
            state.app_buckets = value;
        },
        [types.APP.app_setup_init](state, value){
            state.setup = value;
        },
    },
    actions: {
        [types.APP.qiniu_key](context, json){
            context.commit(types.APP.qiniu_key, json);
        },
        [types.APP.app_a_buckets](context, value){
            context.commit(types.APP.app_buckets, value);
        },
        [types.APP.setup_a_deleteNoAsk](context, json){
            context.commit(types.APP.setup_deleteNoAsk, json);
        },
        [types.APP.setup_a_copyType](context, json){
            context.commit(types.APP.setup_copyType, json);
        },
        [types.APP.setup_a_savedir](context, value1, value2){
            context.commit(types.APP.setup_savedir, value1, value2);
        },
        [types.APP.app_a_setup_init](context){
            storage.get('app_setup', (error, app) => {
                if (!error) {
                    if (!util.isEmptyObject(app)) {
                        context.commit(types.APP.app_setup_init, app);
                    }
                }
            })
        },
    },
    getters: {
        [types.APP.setup_deleteNoAsk](state){
            return ('deleteNoAsk' in state.setup) ? state.setup.deleteNoAsk : false;
        },
        [types.APP.setup_copyType](state){
            return ('copyType' in state.setup) ? state.setup.copyType : 'url';
        },
        [types.APP.setup_savedir](state){
            if ('bucket_name' in state.setup) {
                return state.setup.bucket_name;
            } else {
                return '';
            }
        },
        [types.APP.app_buckets](state){
            return state.app_buckets;
        }
    }
}