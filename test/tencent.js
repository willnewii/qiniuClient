const Key = require("./Key")
const request = require("request")
const fs = require("fs")
const COS = require("cos-nodejs-sdk-v5")
// 创建实例

var cos = new COS(Key.tencent)

// 获取桶列表
/*cos.getService(function (err, data) {
    let error = null;
    if (err) {
        console.log(err);
    } else {
        data.Buckets.forEach((item, index) => {
            data.Buckets[index].name = item.Name;
        });
        console.log(data.Buckets.length);
    }
});*/

// 获取指定桶域名信息
/*cos.getBucketDomain({ Bucket: "lg-js1sz496-1253247195", Region: "ap-shanghai" }, (err, data) => {
    console.log(data);
})*/

// 通过url上传文件
cos.getObjectUrl(
  {
    Bucket: "lg-js1sz496-1253247195",
    Region: "ap-shanghai",
    Method: "PUT",
    Key: "test_url.jpg",
    Sign: true
  },
  function (err, data) {
    if (err) return console.log(err)
    console.log(data.Url)
    const req = request(
      {
        method: "PUT",
        url: data.Url
      },
      function (err, response, body) {
        console.log(err || body)
      }
    )
    request("http://hbimg.b0.upaiyun.com/bd2c58e89c901f1c7e3e0a1e0d23140c2ac256674e038-0P35Bu_fw658")
      .pipe(req)
      .on("close", () => {
        console.log("上传完毕")
      })
  }
)
