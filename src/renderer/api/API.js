/**
 * Created by zhangweiwei on 2017/04/10.
 */
import axios from 'axios'
import config from './config'
import * as util from '../service/util'
import qiniu from '../cos/qiniu'

import Qs from 'qs'

class API {
  constructor(view) {
    this.view = view
    this.config = util.deepCopy(config)
  }

  post(url, param) {
    return this._request(url, 'post', param)
  }

  get(url, param) {
    if (param) url = url + '?' + Qs.stringify(param)

    if (/(qiniu.com|qbox.me)/g.test(url)) {
      // 七牛api
      this.setAuthorization(qiniu._httpAuthorization(url))
    }
    return this._request(url, 'get')
  }

  setAuthorization(authorization) {
    this.config.headers.Authorization = authorization
  }

  _request(url, type, param) {
    this.view && this.view.$Loading.start()

    this.config.method = type

    let request
    if (type === 'get') {
      request = axios.get(url, this.config)
    } else {
      request = axios[type](url, param, this.config)
    }

    request
      .then(response => {
        this.view && this.view.$Loading.finish()
      })
      .catch(error => {
        this.view && this.view.$Loading.error()
      })
    return request
  }
}

export default API
