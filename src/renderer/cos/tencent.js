import cosUtil from 'cos-nodejs-sdk-v5/sdk/util'
const request = require('request')

cosUtil.isBrowser = false
import tencent from 'cos-nodejs-sdk-v5'
import TencentBucket from './tencentBucket'

let cos = null

function init(param) {
  cos = new tencent({
    SecretId: param.access_key,
    SecretKey: param.secret_key,
  })
}

function getBuckets(callback) {
  cos.getService(function (err, data) {
    let error = null
    if (err) {
      error = {}
      error.message = err.error.Message
      callback(error)
    } else {
      data.Buckets.forEach((item, index) => {
        data.Buckets[index].name = item.Name
        data.Buckets[index].location = item.Location
      })
      callback && callback(null, data.Buckets)
    }
  })
}

function fetch(params, callback) {
  cos.getObjectUrl(
    {
      ...params,
      Method: 'PUT',
      Key: params.key,
      Sign: true,
    },
    function (err, data) {
      if (err) return console.log(err)
      const req = request(
        {
          method: 'PUT',
          url: data.Url,
        },
        function (err, response, body) {
          console.log(err || body)
        }
      )
      request(params.path)
        .pipe(req)
        .on('close', () => {
          console.log('上传完毕')
          callback(err, { key: params.key })
        })
    }
  )
}

/**
 * 批量修改文件名(先拷贝到指定目录，在删除源文件)
 * @param bucket    名称
 * @param items     需要处理的文件
 * @param callback
 */
function rename(params, items, callback) {
  if (!Array.isArray(items)) {
    items = [items]
  }

  let files = []

  let changeName = function (item) {
    params.Key = item._key
    params.CopySource = params.Bucket + '.cos.' + params.Region + '.myqcloud.com/' + encodeURIComponent(item.key).replace(/%2F/g, '/')

    cos.sliceCopyFile(params, (err, data) => {
      if (!err) {
        files.push(item)
      }
      index++
      if (index !== items.length) {
        changeName(items[index])
      } else {
        remove(params, files, callback)
      }
    })
  }

  let index = 0
  changeName(items[index])
}

/**
 * 批量删除文件
 * @param params    bucket信息
 * @param items     需要处理的文件
 * @param callback
 */
function remove(params, items, callback) {
  if (!Array.isArray(items)) {
    items = [items]
  }
  params.Objects = []
  items.forEach(item => {
    params.Objects.push({ Key: item.key })
  })

  cos.deleteMultipleObject(params, function (err, data) {
    err && console.log(err)
    callback && callback(err, data)
  })
}

function generateBucket(name) {
  return new TencentBucket(name, cos)
}

export default { init, getBuckets, generateBucket, fetch, remove, rename }
