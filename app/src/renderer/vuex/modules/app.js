/**
 * Created by zhangweiwei on 2017/2/28.
 */
import * as types from '../mutation-types'
//const storage = require('electron-json-storage');

export default {
    state: {
        qiniu_key: {},
    },
    mutations: {
        [types.APP.qiniu_key](state, json){
            state.qiniu_key = json;
        }
    },
    actions: {
        [types.APP.qiniu_key](context, json){
            context.commit(types.APP.qiniu_key, json);
        },
    },
    getters: {
        [types.APP.qiniu_key](state){
            return state.qiniu_key;
        }
    }
}