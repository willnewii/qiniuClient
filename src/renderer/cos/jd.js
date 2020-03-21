const AWS = require('aws-sdk');
import AWSBucket from "./awsBucket";

let s3;

function init(param) {
    console.log(param);
    let options = {apiVersion: '2006-03-01'};

    AWS.config = new AWS.Config({
        accessKeyId: param.access_key,
        secretAccessKey: param.secret_key,
        region: param.region,
        endpoint: `https://s3.${param.region}.jdcloud-oss.com`,
        s3ForcePathStyle: true,
        signatureVersion: 'v4',
    });

    s3 = new AWS.S3(options);
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
