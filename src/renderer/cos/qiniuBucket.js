import { Constants, util } from '../service/index'
import qiniu from '../cos/qiniu'
import baseBucket from './baseBucket'
import Request from '../api/API'
import brand from '../cos/brand'
import dayjs from 'dayjs'

class Bucket extends baseBucket {
  constructor(bucketInfo, cos) {
    super(bucketInfo, cos, brand.qiniu.key)
  }

  /**
   * 根据privateBuckets判断是否是私有空间
   * 获取域名
   * 获取目录
   * 获取默认资源列表
   * @param vm => bucketPage
   */
  bindPage(vm) {
    this.vm = vm
    this.paging = this.vm.paging
    this.getACL()
    this.getDomains()
    this.getTotal(info => {
      if (info) {
        this.space = info.space
        this.count = info.count
      }
      this.getResources()
    })
  }

  /**
   * 检测是否属于私密空间
   */
  getACL() {
    this.getLocalPermission()
  }

  /**
   * 设置domains
   * 如果正常读取domains,默认匹配最后一个(目前clouddn.com域名在最前,正好最后可以匹配自定义域名)
   * 如果domains为空,查询customeDomains
   * 如果设置了自定义域名,https 默认设置为false
   */
  getDomains() {
    let request = new Request()
    request
      .get(qiniu.methods.domains, { tbl: this.name })
      .then(result => {
        this.domain = ''

        if (result && result.length > 0) {
          this.domains = result

          //默认选择最后一个域名
          this.domain = this.domains[this.domains.length - 1]
        }

        super.setRecentDomain()
      })
      .catch(error => {
        console.log(error)
      })
  }

  /**
   * 空间统计
   * 尝试获取 标准或低频空间的最近一天的文件数量统计
   * @param callback
   */
  async getTotal(callback) {
    const formatStr = 'YYYYMMDD000000'
    let day = dayjs()
    let param = `?bucket=${this.name}&begin=${day.add(-1, 'day').format(formatStr)}&end=${day.format(formatStr)}&g=day`

    let requests = [qiniu.methods.count, qiniu.methods.count_line, qiniu.methods.space, qiniu.methods.space_line].map(url => {
      return new Request().get(`${url}${param}`)
    })

    Promise.all(requests)
      .then(result => {
        callback &&
          callback({
            count: result[0].datas[0] || result[1].datas[0],
            space: result[2].datas[0] || result[3].datas[0],
          })
      })
      .catch(error => {
        console.log(error)
        callback &&
          callback({
            count: 0,
            space: 0,
          })
      })
  }

  async getResources(option = {}) {
    await super.preResources()

    let params = {
      bucket: this.name,
    }

    this._handleParams(params, option)

    qiniu.list(params, async (respErr, respBody, respInfo) => {
      if (respErr) {
        console.error(respErr)
        return
      }
      let files = respInfo.data.items.map((item, index) => {
        return util.convertMeta(item, brand.qiniu.key)
      })
      //commonPrefixes 文件夹
      respInfo.data.commonPrefixes &&
        respInfo.data.commonPrefixes.forEach(item => {
          files.push(this._getFolder(item))
        })

      await this.postResources(
        {
          items: files,
          marker: respInfo.data.marker,
        },
        option
      )
    })
  }

  createFile(_param, type = Constants.UploadType.UPLOAD, callback) {
    let param = {
      bucket: this.name,
    }
    Object.assign(param, _param)
    if (type === Constants.UploadType.FETCH) {
      qiniu.fetch(param, callback)
    } else if (type === Constants.UploadType.UPLOAD) {
      qiniu.upload(param, callback)
    }
  }

  removeFile(items, callback) {
    qiniu.remove(this.name, items, ret => {
      callback && callback(ret)
    })
  }

  renameFile(items, callback) {
    qiniu.rename(this.name, items, ret => {
      callback && callback(ret)
    })
  }

  refreshUrls(items, callback) {
    qiniu.refreshUrls(items, callback)
  }

  /**
   * 返回资源真实链接,无域名时,返回空链接.
   * @param index
   * @param key
   * @param deadline  私有模式,文件有效期
   * @returns {*}
   */
  generateUrl(key, deadline) {
    let url = this.domain ? qiniu.generateUrl(this.domain, key, this.permission === 1 ? deadline : null) : ''
    return super.generateUrl(url)
  }
}

export default Bucket
