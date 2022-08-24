import { defineStore } from 'pinia'
import * as types from './mutation-types'
import { storagePromise, Constants, util } from '@/service'

const defaultImageStyle = '?imageView2/1/w/100/h/100/format/webp/q/10'

function setAppSetup(app) {
  storagePromise.set(Constants.Key.configuration, app)
}

export const useSetupStore = defineStore('setup', {
  state: () => {
    return {
      setup: {
        paging: true, //是否开启分页
        https: false, //是否支持Https
        showMenuBar: false, //是否显示菜单栏(win&Linux)
        hiddenDelBtn: false, //隐藏删除按钮
        deleteNoAsk: false, //文件删除前是否弹出对话框
        uploadNoAsk: true, //文件上传时是否弹出对话框
        isOverwrite: true, //上传时是否直接覆盖文件
        copyType: 'url', //默认复制类型
        showType: 1, //默认显示类型
        tray: {
          //托盘上传的 服务商/bucket/自定义路径
          brand: '',
          bucket_name: '',
          bucket_dir: '',
        },
        customedomain: {}, //名称有歧义.保存最近选择的域名
        imagestyle: defaultImageStyle, //Grid时,提供了图片预览,可以设置的预览图片的压缩方式
        downloaddir: '', //设置文件的下载路径
        privatebucket: [], //七牛私有空间不能通过api获取,只能用户手动标记
        expiresTime: 3600, //私有空间,过期时间默认1小时
        theme: 'auto',
        recent: {
          //最近使用的bucketname
          uuid: '',
          bucket: '',
        },
      },
    }
  },
  actions: {
    async [types.setup.setup_init](callback) {
      let app = await storagePromise.get(Constants.Key.configuration)
      if (!util.isEmptyObject(app)) {
        this.setup = app
      }
      console.log(app)
      callback && callback()
    },
    setup_update(key, value) {
      if (key === 'customedomain') {
        if (!this.setup.customedomain) {
          this.setup.customedomain = {}
        }
        this.setup.customedomain = Object.assign(this.setup.customedomain, value)
      } else if (key == 'deadline') {
        this.setup.expiresTime = value
      } else {
        this.setup[key] = value
      }
      setAppSetup(this.setup)
    },
  },
  getters: {
    [types.setup.deadline](state) {
      return 'expiresTime' in state.setup ? state.setup.expiresTime : 3600
    },
    [types.setup.setup_info](state) {
      return state.setup
    },
  },
})
