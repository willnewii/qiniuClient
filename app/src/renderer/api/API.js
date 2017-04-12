/**
 * Created by zhangweiwei on 2017/04/10.
 */

import axios from 'axios'
import config from './config'
import qiniu from 'qiniu'
import Qs from 'qs'

class API {

    method = {
        getBuckets: qiniu.conf.RS_HOST + '/buckets',
        domains: qiniu.conf.API_HOST + '/v6/domain/list',
        getResources: qiniu.conf.RSF_HOST + '/list',
    }

    post(url, param) {
        //config.data = param;
        // return axios.post("", null, config);
        let _url = url;
        if (param)
            _url = _url + '?' + Qs.stringify(param)
        return this._request(_url, 'post')
    }

    get(url, param) {
        // config.params = param;
        //return axios.get("", config);

        let _url = url;
        if (param)
            _url = _url + '?' + Qs.stringify(param)

        return this._request(_url, 'get')
    }

    _request(url, type, param) {
       /* if (type === 'get') {
            config.params = param;
        } else {
            config.data = param;
        }*/

        config.headers.Authorization = qiniu.util.generateAccessToken(url, null);

        config.method = type;

        if (type === 'get') {
            return axios.get(url, config)
        } else {
            return axios[type](url, null, config)
        }
    }

}
export default API;