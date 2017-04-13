/**
 * Created by zhangweiwei on 2017/04/10.
 */

import axios from 'axios'
import config from './config'
import qiniu from 'qiniu'
import Qs from 'qs'

class API {

    constructor(view){
        this.that = view;
    }

    method = {
        getBuckets: qiniu.conf.RS_HOST + '/buckets',
        getDomains: qiniu.conf.API_HOST + '/v6/domain/list',
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
        this.that.$Loading.start();
       /* if (type === 'get') {
            config.params = param;
        } else {
            config.data = param;
        }*/

        config.headers.Authorization = qiniu.util.generateAccessToken(url, null);
        config.method = type;

        let request ;
        if (type === 'get') {
            request = axios.get(url, config)
        } else {
            request = axios[type](url, null, config)
        }

        request.then((response)=>{
            this.that.$Loading.finish();
        }).catch((error)=>{
            this.that.$Loading.error();
        })
        return request ;
    }

}
export default API;