import upyun from 'upyun'
import upyunBucket from "./upyunBucket";


let cos = null;
let service_name = '';
//独立于各COS的配置
const PROTOCOL = 'http://';

function init(param) {
    const service = new upyun.Service(param.service_name, param.access_key, param.secret_key,);
    cos = new upyun.Client(service);
    console.log(cos);
    service_name = param.service_name;
}

function getBuckets(callback) {
    callback && callback(null, {datas: [{name: service_name}]});
}

function generateBucket(name) {
    return new upyunBucket(name, cos);
}

export {init, getBuckets, generateBucket};
