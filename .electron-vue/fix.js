const path = require('path')
const fs = require("fs")

/**
 * electron-renderer默认读取的是ali-oss browser 文件,没有bucket相关操作.需要修改一下
 * @type {string}
 */
let aliPackagePath = path.join(__dirname, "..", "node_modules/ali-oss/package.json")
if (fs.existsSync(aliPackagePath)){
    let content = fs.readFileSync(aliPackagePath).toString('utf8');
    content = content.replace("\"browser\"" , "\"browser1\"")
    fs.writeFileSync(aliPackagePath, content)
    console.log('aliPackage 修改完成');
}
