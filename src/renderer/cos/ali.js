const aliOSS = require('ali-oss');
import AliBucket from "./aliBucket";


let cos = null;
//独立于各COS的配置
const PROTOCOL = 'http://';

function init(param) {
    cos = aliOSS({
        accessKeyId: param.access_key,
        accessKeySecret: param.secret_key,
        internal:param.internal // 是否支持内网访问
    });
}

function getBuckets(callback) {
    cos.listBuckets().then((data) => {
        callback && callback(null, {datas: data.buckets});
    }).catch((error) => {
        callback && callback(error);
    });
}

function generateUrl(domain, key, deadline) {
}

function generateBucket(name) {
    return new AliBucket(name, cos);
}

export {init, getBuckets, generateBucket, generateUrl};
