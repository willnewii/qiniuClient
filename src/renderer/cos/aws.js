const AWS = require('aws-sdk');
const Minio = require('minio');

import AWSBucket from "./awsBucket";
import brand from '../cos/brand';

let s3;

function init(param) {
    let options = {apiVersion: '2006-03-01'};

    AWS.config = new AWS.Config({
        accessKeyId: param.access_key, secretAccessKey: param.secret_key, region: param.region
    });

    if (param.endpoint) {
        AWS.config.update({
            endpoint: param.endpoint,
            signatureVersion: 'v4',
            s3ForcePathStyle: true,
        });
    }

    s3 = new AWS.S3(options);

    if (param.key === brand.minio.key) {
        let url = new URL(param.endpoint);
        s3.minio = new Minio.Client({
            endPoint: url.hostname,
            port: parseInt(url.port),
            useSSL: false,
            accessKey: param.access_key,
            secretKey: param.secret_key
        });
    }
}

function getBuckets(callback) {
    s3.listBuckets().promise().then((data) => {
        data.Buckets.forEach((item, index) => {
            data.Buckets[index].name = data.Buckets[index].Name;
        });
        callback && callback(null, {datas: data.Buckets});
    }).catch((error) => {
        callback && callback(error);
    });
}

function generateBucket(name) {
    return new AWSBucket(name, s3);
}

export {init, getBuckets, generateBucket};
