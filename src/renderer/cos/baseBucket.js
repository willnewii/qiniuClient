import { Constants, EventBus } from '../service/index'
import * as types from '../vuex/mutation-types'
import * as indexedDBHelper from '../service/indexedDBHelper'
import brand from './brand'

//由于七牛返回目录的接口不确定,直接通过PageSIze,内容不定.分页模式下,只加载5次
const limitPageSize = 1000

let loadState = -1 // 1：同步中(不显示loading,只显示左下角的sync...) 2：加载中
let message = null
let tempFiles = []
const isBrowser = typeof window !== 'undefined'

class baseBucket {
  constructor(bucketInfo, cos, key) {
    this.init()

    bucketInfo && (this.name = bucketInfo.name)
    bucketInfo && (this.location = bucketInfo.location)
    key && (this.key = key)
    this.cos = cos

    loadState = -1
    message = null

    if (isBrowser && (this.key === brand.qiniu.key || this.key === brand.tencent.key)) {
      indexedDBHelper.openDatabase(this.key, [this.name]).then(db => {
        window.cosDB = db
      })
    }
  }

  init() {
    if (isBrowser && window.cosDB) {
      window.cosDB.close()
      window.cosDB = null
    }
    this.key = '' //服务商
    this.space = '' //空间容量
    this.count = '' //文件个数

    //单次请求加载条数
    this.limit = limitPageSize

    this.name = ''
    this.location = ''
    //操作权限 0：正常 1：私有
    this.permission = 0

    //当前bucket 的可用域名列表
    this.domains = []
    //当前选择domain
    this.domain = ''
    //缓存请求时返回的marker
    this.marker = ''

    //当前bucket源数据
    this.files = []
    //分页加载,数据加载后先保存在tempFiles,加载完毕后在使用files
    this.tempFiles = []
    //已选的文件列表,批处理时使用
    this.selection = []
    //当前路径
    this.folderPath = ''

    // 文件队列(整合上传&下载)
    this.fileQueue = []

    //在generateUrl 返回https
    this.https = false
    /**
     * 分页加载(只会加载当前目录的文件，且是分页加载)
     * @type {boolean}
     */
    this.paging = false

    // 通过点击加载框的取消按钮
    this.cancel = false
  }

  /**
   * 0: 正常 1：私有
   * @param permission
   */
  setPermission(permission = 0) {
    this.permission = permission
    if (this.vm) {
      this.vm[types.app.update_buckets_info]({ name: this.name, permission: this.permission })
    }

    this.https = this.vm['setup_https']
  }

  /**
   * qiniu,aws,minio 需要手动设置
   */
  getLocalPermission() {
    let privateBuckets = this.vm.privatebucket
    let permission = privateBuckets && privateBuckets.length > 0 && privateBuckets.indexOf(this.name) !== -1 ? 1 : 0
    this.setPermission(permission)
  }

  setRecentDomain() {
    let recentDomains = this.vm.customeDomains
    if (recentDomains && recentDomains[this.name]) {
      this.domain = recentDomains[this.name]
    }
  }

  _handleParams(params, option, key = {}) {
    key = Object.assign({ prefix: 'prefix', delimiter: 'delimiter', marker: 'marker', limit: 'limit' }, key)

    params[key.limit] = this.limit

    if (option.keyword) {
      params[key.prefix] = option.keyword
    }

    if (this.paging) {
      // 仅返回指定目录下的文件
      params[key.prefix] && (params[key.prefix] += Constants.DELIMITER)
      params[key.delimiter] = Constants.DELIMITER
    }

    if (this.marker) {
      params[key.marker] = this.marker
    }
  }

  async preResources() {
    //重置多选数组
    this.selection = []

    if (loadState === -1 && isBrowser && window.cosDB) {
      this.files = Object.freeze(await indexedDBHelper.getRecords(cosDB, this.name))
      console.log('indexedDB 数据读取')
      if (this.files.length > 0) {
        loadState = 1
        this.paging = false //如果是同步状态，则关闭分页模式
        EventBus.$emit(Constants.Event.syncing, true)
      }
    }

    if (loadState !== 1) {
      loadState = 2
      let txt = '数据加载中,请稍后'

      if (this.count !== '') {
        txt += `(${parseFloat((tempFiles.length / this.count) * 100).toFixed(2)}%)`
      }

      console.log(this.tempFiles.length, this.count, txt)
      if (this.paging) {
        txt += '  分页加载'
      }

      EventBus.$emit(Constants.Event.loading, {
        show: true,
        message: txt,
        flag: 'getResources',
        cancel: () => {
          this.cancel = true
          console.log('取消')
        },
      })
    }
    console.time('load data')
  }

  /**
   * 根据marker状态判断是否继续请求
   * 请将data数据统一转换: items | marker
   * @param data
   * @param option
   */
  async postResources(data, option) {
    console.timeEnd('load data')
    if (!this.marker && loadState !== 1) {
      this.files = []
    }
    tempFiles = this.marker ? tempFiles.concat(data.items) : data.items
    this.marker = data.marker || ''

    console.log(`${this.paging ? '开启' : '未开启'}分页； 文件数:${tempFiles.length}； 分页标识:${this.marker}`)

    if (this.marker && !this.paging && !this.cancel) {
      await this.getResources(option)
    } else {
      EventBus.$emit(Constants.Event.loading, {
        show: false,
        flag: 'getResources',
      })

      if (this.paging) {
        this.files = this.files.concat(Object.freeze(tempFiles))
      } else {
        if (isBrowser && window.cosDB) {
          await indexedDBHelper.clearRecord(cosDB, this.name)
          await indexedDBHelper.addRecord(cosDB, this.name, tempFiles, true)
          EventBus.$emit(Constants.Event.syncing, false)
          console.log('indexedDB 数据替换')
        }
        this.files = Object.freeze(tempFiles)
      }
      tempFiles = []
      loadState = -1
      this.cancel = false
      option.success && option.success()
    }
  }

  /**
   * 根据子类url,统一做处理
   * @param url
   */
  generateUrl(url) {
    if (!url) {
      return ''
    }

    const protocol = (this.https ? 'https' : 'http') + '://'

    if (/^https?:\/\//.test(url)) {
      url = url.replace(/^https?:\/\//, protocol)
    } else {
      url = `${protocol}${url}`
    }

    return url
  }

  /**
   * 处理存储桶的CRUD 同步数据库
   * C 目前处理不了,文件创建时，并不会返回文件信息
   * TODO：同步后，只是修改了文件名,涉及文件ETag比对的模块，会出现异常
   */
  async syncDB(items, action) {
    switch (action) {
      case Constants.DBAction.rename:
        for (let i = 0; i < items.length; i++) {
          let newItem = JSON.parse(JSON.stringify(items[i]))
          newItem.key = newItem._key
          await indexedDBHelper.putRecord(cosDB, this.name, items[i].key, newItem)
        }
        break
      case Constants.DBAction.delete:
        for (let i = 0; i < items.length; i++) {
          await indexedDBHelper.deleteRecord(cosDB, this.name, items[i])
        }
        break
    }
  }

  _getFolder(name) {
    return {
      key: name.substring(0, name.length - 1),
      type: Constants.FileType.folder,
      fsize: 0,
    }
  }
}

export default baseBucket
