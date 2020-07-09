const { QingStor, Config, Signer } = require("qingstor-sdk")

import QingBucket from "./qingBucket"

let cos = null
let signer = null
let qinKey = null

function init(param) {
    cos = new QingStor(
        new Config({
            access_key_id: param.access_key,
            secret_access_key: param.secret_key
        })
    )
    signer = new Signer(param.access_key, param.secret_key)
    qinKey = param
}

function getBuckets(callback) {
    cos.listBuckets().then((data) => {
        if (data.buckets) {
            callback && callback(null, data.buckets)
        } else {
            let error = {}
            error.message = data.message
            callback && callback(error)
        }
    })
}

function generateUrl(domain, key, deadline, request) {
    key = key.trim()
    let url
    if (deadline) {
        const { operation } = request
        operation.expires = parseInt(Date.now() / 1000) + parseInt(deadline)
        url = signer.signQuery(operation).uri
    } else {
        url = domain + "/" + encodeURI(key)
    }
    return url
}

function generateBucket(name) {
    return new QingBucket(name, cos)
}

export default { init, getBuckets, generateBucket, generateUrl }
