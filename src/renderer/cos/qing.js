const {QingStor, Config} = require('qingstor-sdk');

import QingBucket from "./qingBucket";

let cos = null;
let qinKey = null;
//独立于各COS的配置
const PROTOCOL = 'http://';

function init(param) {
    cos = new QingStor(new Config(param.access_key, param.secret_key));
    qinKey = param;
}

function getBuckets(callback) {
    cos.listBuckets().then((data) => {
        let error = null;
        if (data.statusCode !== 200) {
            error = {};
            error.message = data.message;
            callback && callback(error);
        } else {
            callback && callback(null, {datas: data.buckets});
        }
    });
}

function generateUrl(domain, key, deadline) {
    key = key.trim();
    if (deadline) {
    } else {
        return PROTOCOL + domain + '/' + encodeURI(key);
    }
}

function generateBucket(name) {
    return new QingBucket(name, cos);
}

export {init, getBuckets, generateBucket, generateUrl};