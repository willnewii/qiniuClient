import tencent from 'cos-nodejs-sdk-v5';
import TencentBucket from "@/cos/tencentBucket";

let cos = null;

//独立于各COS的配置
const PROTOCOL = 'http://';

const methods = {
    //空间对应的域名列表(授权空间域名返回为空)
    domains: 'https://api.qiniu.com/v6/domain/list',
    //获取目录(是通过公共前缀模拟出的效果)
    resources: 'https://rsf.qbox.me/list',
};

function init(param) {
    cos = new tencent({
        SecretId: param.access_key,
        SecretKey: param.secret_key,
    });
}

function getBuckets(callback) {
    cos.getService(function (err, data) {
        let error = null;
        if (err) {
            error = {};
            error.message = err.error.Message;
        }

        callback(error, data.Buckets);
    });
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
    return new TencentBucket(name);
}

export {init, getBuckets, generateUrl, remove, upload, fetch, methods, generateBucket,};