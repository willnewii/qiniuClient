const {QingStor, Config} = require('qingstor-sdk');

import brand from "./brand";
import QingBucket from "./qingBucket";

let cos = null;

//独立于各COS的配置
const PROTOCOL = 'http://';

function init(param) {
    cos = new QingStor(new Config(param.access_key, param.secret_key));
}

function getBuckets(callback) {
    cos.listBuckets().then((data) => {
        let error = null;
        if (data.statusCode !== 200) {
            error = {};
            error.message = data.message;
            callback && callback(error);
        } else {
            let names = [];
            data.buckets.forEach((item) => {
                names.push(item.name);
            });
            callback && callback(null, {names, datas: data.buckets});
        }
    });
}

/**
 * 批量修改文件名
 * @param bucket    名称
 * @param items     需要处理的文件
 * @param replace   需要处理的文件
 * @param callback
 */
function rename(params, items, callback) {
    if (!Array.isArray(items)) {
        items = [items];
    }

    let files = [];

    let changeName = function (item) {
        params.Key = item._key;
        params.CopySource = params.Bucket + '.cos.' + params.Region + '.myqcloud.com/' + encodeURIComponent(item.key).replace(/%2F/g, '/');

        cos.sliceCopyFile(params, (error, data) => {
            console.log(error, data);
            if (!error) {
                files.push(item);
            }
            index++;
            if (index !== items.length) {
                changeName(items[index]);
            } else {
                remove(params, files, callback);
            }
        });
    };


    let index = 0;
    changeName(items[index]);
}

/**
 * 批量删除文件
 * @param params    bucket信息
 * @param items     需要处理的文件
 * @param callback
 */
function remove(params, items, callback) {
    if (!Array.isArray(items)) {
        items = [items];
    }
    params.Objects = [];
    items.forEach((item) => {
        params.Objects.push({Key: item.key});
    });

    cos.deleteMultipleObject(params, function (err, data) {
        if (err) {
            console.log(err);
        } else {
            callback && callback(data);
        }
    });
}

function generateBucket(name) {
    return new QingBucket(name, cos);
}

export {init, getBuckets, generateBucket, remove, rename};