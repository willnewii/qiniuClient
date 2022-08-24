import brand from './brand'

const fs = require('fs')
import { Constants, util } from '../service/index'
import baseBucket from './baseBucket'
import qing from './qing'

const mime = require('mime-types')

class Bucket extends baseBucket {
  constructor(bucketInfo, cos) {
    super(bucketInfo, cos, brand.qingstor.key)

    this.bucket = this.cos.Bucket(this.name, this.location)
  }

  /**
   * 获取bucket访问权限
   * 获取资源
   * @param vm => page
   */
  bindPage(vm) {
    this.vm = vm
    this.paging = this.vm.paging
    this.vm.buckets_info.forEach(item => {
      if (item.name === this.name) {
      }
    })

    this.getACL()
    // this.getDomains();
  }

  /**
   * 获取Bucket访问权限状态
   */
  getACL() {
    this.bucket.getACL().then(data => {
      let flag = true
      if (data && data.acl.length > 0) {
        for (let item of data.acl) {
          if (item.grantee.name === 'QS_ALL_USERS') {
            flag = false
          }
        }
      }
      this.setPermission(flag ? 1 : 0)
      this.getResources()
    })
  }

  createFile(_param, type = Constants.UploadType.UPLOAD, callback) {
    let params = {}

    if (type === Constants.UploadType.FETCH) {
      params = {
        'X-QS-Fetch-Source': _param.path,
      }
    } else if (type === Constants.UploadType.UPLOAD) {
      params = {
        body: fs.readFileSync(_param.path),
        'Content-Length': fs.statSync(_param.path).size,
        'Content-Type': mime.lookup(_param.key),
      }
    }
    this.bucket.putObject(_param.key, params).then(data => {
      callback(null, { key: _param.key })
    })
  }

  async removeFile(item, callback) {
    for (let file of item) {
      let data = await this.bucket.deleteObject(file.key)
      console.log(data)
    }
    callback && callback()
  }

  async renameFile(items, callback) {
    for (let file of items) {
      console.log(this.name, file.key, file._key)
      let data = await this.bucket.putObject(file._key, {
        'X-QS-Move-Source': '/' + this.name + '/' + file.key,
      })
      console.log(data)
    }
    callback && callback()
  }

  async getResources(option = {}) {
    await super.preResources()
    let params = Object.create(null)

    this._handleParams(params, option)

    this.cos
      .Bucket(this.name, this.location)
      .listObjects(params)
      .then(data => {
        let files = data.keys.map(item => {
          return util.convertMeta(item, brand.qingstor.key)
        })

        //commonPrefixes 文件夹
        data.common_prefixes &&
          data.common_prefixes.forEach(item => {
            files.push(this._getFolder(item))
          })

        this.postResources(
          {
            items: files,
            marker: data.has_more ? data.next_marker : '',
          },
          option,
        )
      })
  }

  /**
   * 返回资源真实链接
   * @param index
   * @param key
   * @param deadline  私有模式,文件有效期
   * @returns {*}
   */
  generateUrl(key, deadline = 3600) {
    let url
    if (this.permission === 1) {
      url = qing.generateUrl(null, key, deadline, this.cos.Bucket(this.name, this.location).getObjectRequest(key))
    } else {
      url = qing.generateUrl(`${this.name}.${this.location}.qingstor.com`, key, null)
    }
    return super.generateUrl(url)
  }
}

export default Bucket
