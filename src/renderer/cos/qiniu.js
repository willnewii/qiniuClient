import qiniu from 'qiniu';
import QiniuBucket from "@/cos/qiniuBucket";

import Request from '../api/API';

qiniu.conf.ACCESS_KEY = '';
qiniu.conf.SECRET_KEY = '';

//默认文件的分隔符
const DELIMITER = '/';
//独立于各COS的配置
const PROTOCOL = 'http://';

const methods = {
    //空间列表
    buckets: 'https://rs.qbox.me/buckets',
    //空间对应的域名列表(授权空间域名返回为空)
    domains: 'https://api.qiniu.com/v6/domain/list',
    //获取目录(是通过公共前缀模拟出的效果)
    resources: 'https://rsf.qbox.me/list',
};

function init(param) {
    qiniu.conf.ACCESS_KEY = param.access_key;
    qiniu.conf.SECRET_KEY = param.secret_key;
    qiniu.conf.RPC_TIMEOUT = 180000;
}

function getBuckets(callback) {
    let error = null;
    let request = new Request();
    request.setAuthorization(_httpAuthorization(methods.buckets));
    request.get(methods.buckets).then((result) => {
        callback(null, result.data);
    }).catch((error) => {
        callback(error);
    });
}


function getToken() {
    return new qiniu.auth.digest.Mac(qiniu.conf.ACCESS_KEY, qiniu.conf.SECRET_KEY);
}

/**
 * http请求鉴权
 * @param url
 * @returns {*}
 */
function _httpAuthorization(url) {
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
    key = key.trim();
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
 * 返回当前bucket文件列表
 */
function list(params, callback) {
    let config = new qiniu.conf.Config();
    let bucketManager = new qiniu.rs.BucketManager(getToken(), config);

    bucketManager.listPrefix(params.bucket, params, function (respErr, respBody, respInfo) {
        if (respBody.error) {
            respErr = {"error": respBody.error, 'status': respBody.status};
        }
        callback(respErr, respBody, respInfo);
    });

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
        scope: params.isOverwrite ? params.bucket : `${params.bucket}:${params.key}`,
    };
    let putPolicy = new qiniu.rs.PutPolicy(options);
    let uploadToken = putPolicy.uploadToken(getToken());

    let config = new qiniu.conf.Config();

    let resumeUploader = new qiniu.resume_up.ResumeUploader(config);
    let putExtra = new qiniu.resume_up.PutExtra();
    putExtra.progressCallback = (uploadBytes, totalBytes) => {
        if (params.progressCallback) {
            params.progressCallback(parseInt((uploadBytes / totalBytes * 100)));
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
 * 批量修改文件名
 * @param bucket    名称
 * @param items     需要处理的文件
 * @param replace   需要处理的文件
 * @param callback
 */
function rename(bucket, items, callback) {
    if (!Array.isArray(items)) {
        items = [items];
    }

    //批量删除
    let operations = [];
    items.forEach((item) => {
        operations.push(qiniu.rs.moveOp(bucket, item.key, bucket, item._key));
    });

    _batch(operations, callback);
}

/**
 * 批量删除文件
 * @param bucket    名称
 * @param items     需要处理的文件
 * @param callback
 */
function remove(bucket, items, callback) {
    if (!Array.isArray(items)) {
        items = [items];
    }

    //批量删除
    let operations = [];
    items.forEach((item) => {
        operations.push(qiniu.rs.deleteOp(bucket, item.key));
    });

    _batch(operations, callback);
}

//https://github.com/qiniu/nodejs-sdk/blob/master/examples/rs_batch_delete.js
function _batch(operations, callback) {
    let config = new qiniu.conf.Config();
    let bucketManager = new qiniu.rs.BucketManager(getToken(), config);

    bucketManager.batch(operations, function (err, respBody, respInfo) {
        if (err) {
            console.log(err);
        } else {
            // 200 is success, 298 is part success
            if (parseInt(respInfo.statusCode / 100) === 2) {
                respBody.forEach(function (item) {
                    if (item.code === 200) {
                        console.log(item.code + "\tsuccess");
                    } else {
                        console.log(item.code + "\t" + item.data.error);
                    }
                });
                callback(respInfo);
            } else {
                console.log(respInfo, respBody);
            }
        }
    });

}

function generateBucket(name) {
    return new QiniuBucket(name);
}

export {init, getBuckets, generateBucket, _httpAuthorization, generateUrl, list, remove, rename, upload, fetch, methods, DELIMITER};