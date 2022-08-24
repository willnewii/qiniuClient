const KS3 = require('ks3/lib/ks3')
import KS3Bucket from './ks3Bucket'

let client

function init(param) {
  client = new KS3(param.access_key, param.secret_key)
  client.config({
    dataType: 'json',
  })
  console.log('client: ', client)
}

function getBuckets(callback) {
  _getBuckets(client, callback)
}

function _getBuckets(client, callback) {
  client.service.get(function (error, result) {
    let data = result.ListAllMyBucketsResult.Buckets
    data.Bucket.forEach((item, index) => {
      data.Bucket[index].name = data.Bucket[index].Name
      data.Bucket[index].region = data.Bucket[index].Region
    })
    // 有错误则回调错误
    callback && callback(error || null, data.Bucket)
  })
}

function generateBucket(bucketInfo) {
  return new KS3Bucket(bucketInfo, client)
}

export default { init, getBuckets, _getBuckets, generateBucket }
