import upyun from "upyun"
import upyunBucket from "./upyunBucket"

let cos = null
let service_name = ""
//独立于各COS的配置
const PROTOCOL = "http://"

function init(param) {
    const service = new upyun.Service(param.service_name, param.access_key, param.secret_key)
    cos = new upyun.Client(service)
    service_name = param.service_name
}

async function getBuckets(callback) {
    try {
        let result = await cos.usage("/")
        console.dir(result)
        callback && callback(null, [{ name: service_name }])
    } catch (e) {
        callback && callback(e)
    }
}

function generateBucket(name) {
    return new upyunBucket(name, cos)
}

export default { init, getBuckets, generateBucket }
