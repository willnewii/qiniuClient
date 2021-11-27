const fs = require('fs')
import brand from './brand'
import { util } from '../service/index'
import baseBucket from './baseBucket'

class Bucket extends baseBucket {
  constructor(name, cos) {
    super(name, cos, brand.upyun.key)
  }

  /**
   * 获取bucket访问权限
   * 获取资源
   * @param vm => page
   */
  bindPage(vm) {
    this.vm = vm

    this.paging = true
    this.getDomains()
    this.setPermission()
    this.getResources()
  }

  /**
   * 又拍云没有获取绑定域名的api,只能手动设置
   */
  getDomains() {
    super.setRecentDomain()
  }

  createFile(_param, type, callback) {
    this.cos.putFile(_param.key, fs.readFileSync(_param.path)).then(result => {
      console.log(result)
      callback(null, { key: _param.key })
    })
  }

  async removeFile(items, callback) {
    for (let file of items) {
      await this.cos.deleteFile(file.key)
    }
    callback && callback()
  }

  async renameFile(items, callback) {
    for (let file of items) {
      let data = await this.cos.copy(file._key, file.key)
      let result = await this.cos.deleteFile(file.key)
      console.log(data, result)
    }
    callback && callback()
  }

  getResources(option = {}) {
    super.preResources()
    let params = {
      limit: this.limit,
    }

    if (option.refresh) {
      this.marker = null
    }

    if (this.marker) {
      params.iter = this.marker
    }

    this.cos
      .listDir(option.keyword || '/', params)
      .then(async data => {
        let files = []
        data.files.forEach(item => {
          if (parseInt(item.Size) !== 0) {
            item.remotePath = option.keyword
            files.push(util.convertMeta(item, brand.upyun.key))
          }
        })

        data.items = files
        data.marker = files.length > 0 ? data.next : ''
        await this.postResources(data, option)
      })
      .catch(error => {
        console.dir(error)
      })
  }

  /**
   * 返回资源真实链接
   * @param index
   * @param key
   * @param deadline  私有模式,文件有效期
   * @returns {*}
   */
  generateUrl(key, deadline) {
    if (this.domain) {
      let domain = this.domain

      if (!/^https?:\/\//.test(domain)) {
        domain = 'http://' + domain
      }

      if (domain.lastIndexOf('/') === domain.length - 1) {
        return super.generateUrl(domain + key)
      } else {
        return super.generateUrl(domain + '/' + key)
      }
    } else {
      return ''
    }
  }
}

export default Bucket
