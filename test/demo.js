import axios from "axios"
import fs from "fs"

const Key = require("./Key")

import CloudObjectStorage from "../src/renderer/cos/CloudObjectStorage.js"
import brand from "../src/renderer/cos/brand.js"
import * as util from "../src/renderer/service/util"
import * as Constants from "../src/renderer/service/constants"

const cosName = brand.qiniu.key

_init()

let cloudObjectStorage = new CloudObjectStorage()
let bucket = null
cloudObjectStorage.setBrand(brand[cosName].key)

cloudObjectStorage.initCOS(
    {
        access_key: Key[cosName].access_key,
        secret_key: Key[cosName].secret_key
    },
    (result) => {
        cloudObjectStorage.getBuckets((err, result) => {
            let bucketInfo = result[0]
            bucket = cloudObjectStorage.cos.generateBucket(bucketInfo)

            bucket.limit = 100
            // bucket.paging = true ;
            console.log(`存储桶${bucket.name}加载中...`)

            getList()
            // createFile()
            // createFile2()
            // removeFile()
            // renameFile()
        })
    }
)

/**
 * 获取存储桶的统计信息
 * 目前只支持七牛
 */
function getTotal() {
    if (cosName === brand.qiniu.key) {
        bucket.getTotal((result) => {
            console.log(result)
        })
    }
}

/**
 * 获取存储桶文件列表
 */
function getList() {
    bucket.getResources({
        success: () => {
            // console.log(bucket.files);
        }
    })
}

/**
 * 上传文件(本地文件)
 */
function createFile() {
    let filePath = "./file/ac.jpg"

    bucket.createFile(
        {
            key: util.getPostfix(filePath),
            path: fs.realpathSync(filePath),
            progressCallback: (progress) => {
                console.log(`上传进度:${progress}`)
            }
        },
        undefined,
        (err, result) => {
            console.log(result)
        }
    )
}

/**
 * 上传文件(url)
 * 请根据brand文件,features查看当前云是否支持通过url上传
 * qiniu&qing 是通过服务器抓取
 * tencent 是下载再上传
 */
function createFile2() {
    let filePath = "https://www.baidu.com/img/PCtm_d9c8750bed0b3c7d089fa7d55720d6cf.png"

    bucket.createFile(
        {
            key: util.getPostfix(filePath),
            path: filePath
        },
        Constants.UploadType.FETCH,
        (err, result) => {
            console.log(result)
        }
    )
}

function removeFile() {
    let files = [{ key: "ac.jpg" }]
    bucket.removeFile(files, (result) => {
        console.log(result)
    })
}

function renameFile() {
    let files = [{ key: "ac.jpg", _key: "ac1.jpg" }]
    bucket.renameFile(files, (result) => {
        console.log(result)
    })
}

function _init() {
    //跟应用统一处理
    axios.interceptors.response.use(
        (response) => {
            if (response.data) {
                return typeof response.data === "object" ? response.data : JSON.parse(response.data)
            }
            return response.data
        },
        (error) => {
            return Promise.reject(error)
        }
    )
}
