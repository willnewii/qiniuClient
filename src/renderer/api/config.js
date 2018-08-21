/**
 * Created by zhangweiwei on 2017/2/27.
 */
import Qs from 'qs'

//process.env.NODE_ENV
export default {
    url: '',
    method: 'post',
    baseURL: '',
    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    transformRequest: [function (data) {
        if (data) {
            data = Qs.stringify(data);
            return data;
        } else {
            return;
        }
    }],
    transformResponse: [function (data) {
        return data;
    }],
    paramsSerializer: function (params) {
        return Qs.stringify(params, {arrayFormat: 'brackets'})
    },
    timeout: 30000,
    withCredentials: false, // default
    responseType: 'json', // default
    onUploadProgress: function (progressEvent) {
        // Do whatever you want with the native progress event
    },
    onDownloadProgress: function (progressEvent) {
        // Do whatever you want with the native progress event
    },
    maxContentLength: 2000,
    validateStatus: function (status) {
        return status >= 200 && status < 300; // default
    },
    maxRedirects: 5, // default
    handleError: true //自增参数,是否在interceptors处理错误状态.
}