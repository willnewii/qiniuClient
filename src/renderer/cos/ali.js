const aliOSS = require("ali-oss")
import AliBucket from "./aliBucket"

let cos = null

function init(param) {
    cos = aliOSS({
        accessKeyId: param.access_key,
        accessKeySecret: param.secret_key,
        internal: param.internal // 是否支持内网访问
    })
}

function getBuckets(callback) {
    cos.listBuckets()
        .then((data) => {
            callback && callback(null, data.buckets)
        })
        .catch((error) => {
            callback && callback(error)
        })
}

function generateUrl(domain, key, deadline) {}

function generateBucket(bucketInfo) {
    return new AliBucket(bucketInfo, cos)
}

export default { init, getBuckets, generateBucket, generateUrl }
