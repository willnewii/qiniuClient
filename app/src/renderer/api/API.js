/**
 * Created by zhangweiwei on 2017/04/10.
 */

import axios from 'axios'
import config from './config'
import * as cloudStorage from '../service/cloudStorage'

import Qs from 'qs'

class API {

    constructor(view) {
        this.view = view;
    }

    method = {
        //列举一个账号的所有空间
        getBuckets: 'http://rs.qbox.me/buckets',
        //获取一个空间绑定的域名列表
        getDomains: 'http://api.qiniu.com/v6/domain/list',
        //获取目录(是通过公共前缀模拟出的效果)
        getResources: 'http://rsf.qbox.me/list',
    };

    post(url, param) {
        //config.data = param;
        // return axios.post("", null, config);
        let _url = url;
        if (param)
            _url = _url + '?' + Qs.stringify(param);
        return this._request(_url, 'post')
    }

    get (url, param) {
        // config.params = param;
        //return axios.get("", config);

        let _url = url;
        if (param)
            _url = _url + '?' + Qs.stringify(param);

        return this._request(_url, 'get')
    }

    _request(url, type, param) {
        this.view.$Loading.start();
        /*        let element = document.getElementsByClassName('ivu-loading-bar')[0]; //会产生位置抖动
                if (process.platform !== 'darwin') {
                    if (element.className.indexOf('ivu-loading-bar-win') === -1) {
                        element.className += ' ivu-loading-bar-win';
                    }
                }*/
        /* if (type === 'get') {
         config.params = param;
         } else {
         config.data = param;
         }*/
        if (url.indexOf('github.com') === -1) {
            config.headers.Authorization = cloudStorage.httpAuthorization(url);
        } else {
            delete config.headers.Authorization;
        }
        config.method = type;

        let request;
        if (type === 'get') {
            request = axios.get(url, config)
        } else {
            request = axios[type](url, null, config)
        }

        request.then((response) => {
            this.view.$Loading.finish();
        }).catch((error) => {
            this.view.$Loading.error();
        });
        return request;
    }

}

export default API;