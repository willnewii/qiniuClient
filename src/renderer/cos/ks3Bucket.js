import { util } from '../service/index'
import baseBucket from './baseBucket'
import brand from './brand'

const fs = require('fs')

class Bucket extends baseBucket {
  constructor(bucketInfo, cos) {
    super(bucketInfo, cos, brand.ks3.key)
    const regionMap = {
      BEIJING: 'ks3-cn-beijing',
      SHANGHAI: 'ks3-cn-shanghai',
      GUANGZHOU: 'ks3-cn-guangzhou',
      HONGKONG: 'ks3-cn-hk-1',
      RUSSIA: 'ks3-rus',
      SINGAPORE: 'ks3-sgp',
    }

    cos.endpoint = regionMap[bucketInfo.region] + '.ksyuncs.com'
    cos.config({
      baseUrl: cos.endpoint,
    })
    console.log('KS3 BUCKET', this)
  }

  /**
   * 获取bucket访问权限
   * 获取资源
   * @param vm => page
   */
  bindPage(vm) {
    this.vm = vm
    this.paging = this.vm.paging

    this.getACL()
  }

  getACL() {
    this.cos.bucket.getACL(
      {
        Bucket: this.name,
      },
      (err, data) => {
        if (err) {
          console.error('Error', err)
        } else if (data) {
          let isPrivate = true
          const grant = data.AccessControlPolicy.AccessControlList.Grant
          const grantArray = Array.isArray(grant) ? grant : [grant]
          grantArray.forEach(item => {
            if (item.Grantee.URI && item.Grantee.URI.indexOf('AllUsers') !== -1) {
              isPrivate = false
              return
            }
          })
          this.setPermission(isPrivate ? 1 : 0)
          this.getResources()
        }
      },
    )
  }

  createFile(_param, type, callback) {
    let params = {
      Bucket: this.name,
      Key: _param.key,
      // Body: fs.createReadStream(_param.path),
      filePath: _param.path,
      ContentLength: fs.statSync(_param.path).size,
    }
    this.cos.object.put(params, function (err, data) {
      callback(err, { key: _param.key })
    })
  }

  // todo 支持批量
  removeFile(items, callback) {
    let count = items.length
    console.log(items)
    items.forEach(item => {
      let params = {
        Bucket: this.name,
        Key: item.Key,
      }
      this.cos.object.del(params, function () {
        count = count - 1
        console.log(count)
        if (count === 0) {
          callback && callback()
        }
      })
    })
  }

  async renameFile(items, callback) {
    const item = items[0]
    this.cos.object.put(
      {
        Bucket: this.name,
        Key: item._key, // new key
      },
      (err, data) => {
        if (err) {
          callback && callback({ error: '重命名|创建拷贝失败' })
        } else {
          this.cos.object.del(
            {
              Bucket: this.name,
              Key: item.Key,
            },
            function (err, data) {
              if (err) {
                callback && callback({ error: '重命名|删除旧文件失败' })
                return
              }
              callback && callback()
            },
          )
        }
      },
      {
        'x-kss-copy-source': `/${this.name}/${item.Key}`,
      },
    )
  }

  async getResources(option = {}) {
    await super.preResources()
    //delimiter
    let params = {
      Bucket: this.name,
    }

    this._handleParams(params, option, {
      limit: 'max-keys',
    })

    this.cos.bucket.get(params, (error, data) => {
      console.log('list objects: ', data)
      let files = []
      if (data.ListBucketResult.Contents) {
        if (!Array.isArray(data.ListBucketResult.Contents)) {
          data.ListBucketResult.Contents = [data.ListBucketResult.Contents]
        }
        data.ListBucketResult.Contents.forEach(item => {
          if (parseInt(item.Size) !== 0) {
            files.push(util.convertMeta(item, brand.ks3.key))
          }
        })
      }

      data.ListBucketResult.CommonPrefixes &&
        data.ListBucketResult.CommonPrefixes.forEach(item => {
          files.push(this._getFolder(item.Prefix))
        })

      this.postResources(
        {
          items: files,
          marker: JSON.parse(data.ListBucketResult.IsTruncated) && data.ListBucketResult.Contents.slice(-1)[0].Key,
        },
        option,
      )
    })
  }

  /**
   * 返回资源真实链接
   * @param index
   * @param key
   * @param deadline  私有模式,文件有效时间
   * @returns {*}
   */
  generateUrl(key, expires) {
    let url = `${this.cos.endpoint}/${this.name}/${key}`

    if (this.permission === 1) {
      // kind of hack
      const bucketName = this.name
      const objectName = encodeURIComponent(key)
      const ak = this.cos.ak
      const sk = this.cos.sk
      const deadline = Math.ceil(new Date().getTime() / 1000) + expires
      const token = encodeURIComponent(this.cos.auth.getQueryStringSignature(sk, deadline, bucketName, objectName))

      url = `http://${this.cos.endpoint}/${bucketName}/${objectName}?AccessKeyId=${ak}&Expires=${deadline}&Signature=` + token
    }

    return super.generateUrl(url)
  }
}

export default Bucket
