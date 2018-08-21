/**
 * Created by zhangweiwei on 2017/2/28.
 */
import * as types from '../mutation-types';

export default {
    state: {
        app: {
            name: '', //cos name
            buckets: [],
            buckets_info: [],
        }

    },
    mutations: {
        [types.app.buckets](state, value) {
            state.app.buckets = value;
        },
        [types.app.buckets_info](state, value) {
            state.app.buckets_info = value;
        },
        [types.app.name](state, value) {
            state.app.name = value;
        },
    },
    actions: {
        [types.app.a_buckets_info](context, value) {
            context.commit(types.app.buckets_info, value);
        },
        [types.app.a_buckets](context, value) {
            context.commit(types.app.buckets, value);
        },
        [types.app.a_name](context, value) {
            context.commit(types.app.name, value);
        },
    },
    getters: {
        [types.app.buckets_info](state) {
            return state.app.buckets_info;
        },
        [types.app.buckets](state) {
            return state.app.buckets;
        },
        [types.app.name](state) {
            return state.app.name;
        },
    }
};