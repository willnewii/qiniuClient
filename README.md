# qiniuClien v0.0.8
![](http://ou62js7ck.bkt.clouddn.com/niu_128.png)
> 七牛存储文件管理客户端.跟官网相比,增加了按目录显示,托盘上传,URL上传,文件排序 .我觉得还不错 😂

## 效果图
![qiniuClient-0.0.6截图1.png](http://obfmtiyt5.bkt.clouddn.com/img%2FqiniuClient-0.0.6%E6%88%AA%E5%9B%BE1.png)

![qiniuClient-0.0.6截图2.png](http://obfmtiyt5.bkt.clouddn.com/img%2FqiniuClient-0.0.6%E6%88%AA%E5%9B%BE2.png)

## 功能
1. 文件的增、删、文件(文件前缀搜索)
2. 目录显示
    - 七牛web页面没有这个功能,我觉得还挺实用,方便归类
3. 文件按日期/大小 排序(方便查找)
3. URL上传
    - 七牛提供了API,可以直接通过url抓取文件并保存到七牛.如果你经常干那种先下载,再上传的事,这个功能应该对你有帮助
4. 托盘上传
    - mac的特性,方便快捷,谁用谁知道
5. 拖拽上传
    - O__O "… 本来是看别人有才做的...后来发现还挺好用 😂
6. 图片模式
    - 显示预览图,如果你有维护图片的需求,这个功能应该对你有帮助
7. 批量上传,删除,下载
8. 私有空间操作

## 说明
1. 如果你经常使用markdown写文档并配图的话,可以将设置中的'复制到粘贴板格式',勾选为'markdown'.

2. 七牛的空间有私有/公开两种状态.但是并没有提供获取相应状态的api 🤣 .如果你需要操作私有空间,请先在设置页面'私有空间'选项,勾选相对应的空间.

3. 七牛的搜索api是按照前缀搜索,并非模糊.所以关键字一定要匹配前缀.如果你点击了相应的目录.

4. [building-windows-apps-from-non-windows-platforms](https://github.com/electron-userland/electron-packager#building-windows-apps-from-non-windows-platforms)


## Technologies
- [electron](https://github.com/electron/electron)
- [electron-vue](https://github.com/SimulatedGREG/electron-vue)
- [vue2.0 + axios + router + vuex](https://github.com/vuejs/vue)
- [iview 2.0](https://github.com/iview/iview)

## Build Setup

``` bash
npm i  //electron 需要的文件下载巨慢,经常卡死,耐心,不行就翻墙

# serve with hot reload at localhost:9080
npm run dev

# build electron app for production
npm run package-mac
npm run package-win32
```

More information can be found [electron-vue](https://simulatedgreg.gitbooks.io/electron-vue/content/docs/npm_scripts.html).

## issue
- 获取不到授权空间domain.因为七牛api的设计,如果在您有授权空间的情况下,是可以进行文件的列表读取/上传/删除操作,但是在获取domains时总返回为空,导致无法拼接完整的url,而无法访问.
- 上传进度不灵敏.七牛上传文件块设置的是4M.调小以后,进度条反应比较正常,但是会提示上传失败 😂,所以会感觉明明上传了,但是半天没响应.
- ~~小文件下载状态更新异常~~ 解决啦~ 🤓
- ~~小文件上传失败.没有详细测试,大概范围是小于100KB的文件上传会失败.~~ 解决啦~ 🤓

## dev tips
### npm 安装git分支
```shell
npm i --save git://github.com/willnewii/nodejs-sdk.git#patch-1
```
### electron-winstaller 构建失败
```shell
The Product/@Version attribute's value, '!(bind.FileVersion.qiniu-Client.exe)', is not a valid version.
```
检查package.name 是否包含'-' . [windows-installer-#203](https://github.com/electron/windows-installer/issues/203)


## 参考资料
- [图标来源：懒人图库](http://www.lanrentuku.com/vector/animal/lansexinxianniunaibiaoqian-shiliang.html)
- [electron 文档](https://github.com/electron/electron/tree/master/docs-translations/zh-CN)
- [七牛API](https://developer.qiniu.com/kodo/api/1731/api-overview)
- [webpack2 文档](https://doc.webpack-china.org)
- [Node.js 文档](http://nodejs.cn/api/)
- [electron.build cli doc](https://www.electron.build/cli)