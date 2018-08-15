import qiniu from 'qiniu';
import QiniuBucket from "@/cos/qiniuBucket";

qiniu.conf.ACCESS_KEY = '';
qiniu.conf.SECRET_KEY = '';

//独立于各COS的配置
const PROTOCOL = 'http://';

const methods = {
    //空间列表
    buckets: 'https://rs.qbox.me/buckets',
    //空间对应的域名列表(授权空间域名返回为空)
    domains: 'https://api.qiniu.com/v6/domain/list',
    //获取目录(是通过公共前缀模拟出的效果)
    getResources: 'https://rsf.qbox.me/list',
};

function init(param) {
    qiniu.conf.ACCESS_KEY = param.access_key;
    qiniu.conf.SECRET_KEY = param.secret_key;
    qiniu.conf.RPC_TIMEOUT = 180000;
}

let token = null;

function getToken() {
    if (!token && qiniu.conf.ACCESS_KEY && qiniu.conf.SECRET_KEY) {
        token = new qiniu.auth.digest.Mac(qiniu.conf.ACCESS_KEY, qiniu.conf.SECRET_KEY);
    }
    return token;
}

/**
 * http请求鉴权
 * @param url
 * @returns {*}
 */
function httpAuthorization(url) {
    return qiniu.util.generateAccessToken(getToken(), url, null);
}

/**
 * 根据 deadline 判断是否成成privateDownloadUrl
 * @param domain
 * @param key
 * @param deadline
 * @returns {string}
 */
function generateUrl(domain, key, deadline) {
    if (deadline) {
        let config = new qiniu.conf.Config();
        let bucketManager = new qiniu.rs.BucketManager(getToken(), config);
        deadline = parseInt(Date.now() / 1000) + deadline;
        return bucketManager.privateDownloadUrl(PROTOCOL + domain, key, deadline);
    } else {
        return PROTOCOL + domain + '/' + encodeURI(key);
    }
}

/**
 * 通过url抓取文件
 */
function fetch(params, callback) {
    let config = new qiniu.conf.Config();
    let bucketManager = new qiniu.rs.BucketManager(getToken(), config);

    bucketManager.fetch(params.path, params.bucket, params.key, function (respErr, respBody, respInfo) {
        if (respBody.error) {
            respErr = {"error": respBody.error, 'status': respBody.status};
        }
        callback(respErr, respBody);
    });
}

/**
 * 上传文件
 * @param params
 * @param callback
 */
function upload(params, callback) {
    let options = {
        scope: params.bucket,
    };
    let putPolicy = new qiniu.rs.PutPolicy(options);
    let uploadToken = putPolicy.uploadToken(getToken());

    let config = new qiniu.conf.Config();

    let resumeUploader = new qiniu.resume_up.ResumeUploader(config);
    let putExtra = new qiniu.resume_up.PutExtra();
    putExtra.progressCallback = (uploadBytes, totalBytes) => {
        if (params.progressCallback) {
            params.progressCallback(parseInt((uploadBytes / totalBytes * 10000)) / 100);
        }
    };

    resumeUploader.putFile(uploadToken, params.key, params.path, putExtra, function (respErr, respBody, respInfo) {
        if (respBody.error) {
            respErr = {"error": respBody.error};
        }
        console.log(respErr, respBody, respInfo);
        callback(respErr, respBody);
    });
}

/**
 * 删除文件操作
 */
function remove(params, callback) {
    let config = new qiniu.conf.Config();
    let bucketManager = new qiniu.rs.BucketManager(getToken(), config);

    bucketManager.delete(params.bucket, params.key, function (err, respBody, respInfo) {
        console.log(respBody, respInfo);
        if (!err) {
            callback(respInfo);
        } else {
            console.log(err);
        }
    });
}

function generateBucket(name) {
    return new QiniuBucket(name);
}

export {init, httpAuthorization, generateUrl, remove, upload, fetch, methods, generateBucket,};