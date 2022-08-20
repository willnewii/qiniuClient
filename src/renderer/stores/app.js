import { defineStore } from 'pinia'
import * as types from '../vuex/mutation-types'

export const useAppStore = defineStore('app_pinia', {
  state: () => {
    return {
      app: {
        name: '', //cos name
        buckets_info: [], //bucket对象列表
        //计划中...
        datas: [], //TODO: 上传/下载日志列表
      },
    }
  },
  actions: {
    [types.app.buckets_info](value) {
      this.app.buckets_info = value
    },
    [types.app.update_buckets_info](value) {
      this.app.buckets_info.forEach((item, index) => {
        if (item.name === value.name) {
          this.app.buckets_info[index].permission = value.permission
        }
      })
    },
    [types.app.name](value) {
      this.app.name = value
    },
    [types.app.datas](value) {
      this.app.datas = value
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
})
