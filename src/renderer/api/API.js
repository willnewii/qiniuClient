/**
 * Created by zhangweiwei on 2017/04/10.
 */
import Vue from 'vue';
import axios from 'axios';
import config from './config';

import Qs from 'qs';

class API {

    constructor(view) {
        this.view = view;
    }

    post(url, param) {
        //config.data = param;
        // return axios.post("", null, config);
        let _url = url;
        if (param)
            _url = _url + '?' + Qs.stringify(param);
        return this._request(_url, 'post');
    }

    get(url, param) {
        // config.params = param;
        //return axios.get("", config);

        let _url = url;
        if (param)
            _url = _url + '?' + Qs.stringify(param);

        return this._request(_url, 'get');
    }

    _request(url, type, param) {
        this.view.$Loading.start();

        let regStr = /^http.*(qiniu.com|qbox.me)/g;
        if (regStr.test(url)) {
            config.headers.Authorization = this.view.$storage.cos.httpAuthorization(url);
        } else {
            delete config.headers.Authorization;
        }

        config.method = type;

        let request;
        if (type === 'get') {
            request = axios.get(url, config);
        } else {
            request = axios[type](url, null, config);
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