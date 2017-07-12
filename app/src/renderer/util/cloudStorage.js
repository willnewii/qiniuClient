import qiniu from 'qiniu';

function init(param) {
    qiniu.conf.ACCESS_KEY = param.access_key;
    qiniu.conf.SECRET_KEY = param.secret_key;

    qiniu.conf.RPC_TIMEOUT = 180000;
}

function getToken() {
    return new qiniu.auth.digest.Mac(qiniu.conf.ACCESS_KEY, qiniu.conf.SECRET_KEY);
}

/**
 * http请求鉴权
 * @param url
 * @returns {*}
 */
function httpAuthorization(url) {
    return qiniu.util.generateAccessToken(getToken(), url, null)
}

/**
 * 通过url抓取文件
 */
function fetch(params, callback) {
    let config = new qiniu.conf.Config();
    let bucketManager = new qiniu.rs.BucketManager(getToken(), config);

    bucketManager.fetch(params.path, params.bucket, params.key, function (respErr, respBody, respInfo) {
        if (respErr) {
            throw respErr;
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
            params.progressCallback(parseInt((uploadBytes / totalBytes * 10000)) / 100)
        }
    };

    resumeUploader.putFile(uploadToken, params.key, params.path, putExtra, function (respErr, respBody, respInfo) {
        if (respErr) {
            throw respErr;
        }
        callback(respErr, respBody);
    })

    /*    let formUploader = new qiniu.form_up.FormUploader(config);
     let putExtra = new qiniu.form_up.PutExtra();

     formUploader.putFile(uploadToken, params.key, params.path, putExtra, function (respErr, respBody, respInfo) {
     if (respErr) {
     throw respErr;
     }
     callback(respErr, respBody);
     });*/
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
            callback(respBody);
        } else {
            console.log(err);
        }
    });
}

export {init, httpAuthorization, remove, upload, fetch}