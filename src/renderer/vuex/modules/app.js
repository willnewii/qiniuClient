/**
 * Created by zhangweiwei on 2017/2/28.
 */
import * as types from '../mutation-types'

export default {
  state: {
    app: {
      name: '', //cos name
      buckets_info: [], //bucket对象列表
      //计划中...
      datas: [], //TODO: 上传/下载日志列表
    },
  },
  mutations: {
    [types.app.buckets_info](state, value) {
      state.app.buckets_info = value
    },
    [types.app.a_update_buckets_info](state, value) {
      state.app.buckets_info.forEach((item, index) => {
        if (item.name === value.name) {
          state.app.buckets_info[index].permission = value.permission
        }
      })
    },
    [types.app.name](state, value) {
      state.app.name = value
    },
    [types.app.datas](state, value) {
      state.app.datas = value
    },
  },
  actions: {
    [types.app.a_buckets_info](context, value) {
      context.commit(types.app.buckets_info, value)
    },
    [types.app.a_update_buckets_info](context, value) {
      context.commit(types.app.a_update_buckets_info, value)
    },
    [types.app.a_name](context, value) {
      context.commit(types.app.name, value)
    },
    [types.app.a_datas](context, value) {
      context.commit(types.app.datas, value)
    },
  },
  getters: {
    [types.app.buckets_info](state) {
      return state.app.buckets_info
    },
    [types.app.name](state) {
      return state.app.name
    },
    [types.app.datas](state) {
      return state.app.datas
    },
  },
}
