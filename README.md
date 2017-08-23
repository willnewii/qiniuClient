# qiniuClien

> 七牛存储文件管理客户端.跟官网相比,增加了目录显示,托盘上传,URL上传,文件排序 .我觉得还不错 😂

## Technologies
- [electron](https://github.com/electron/electron)
- [electron-vue](https://github.com/SimulatedGREG/electron-vue)
- [vue2.0 + axios + router + vuex](https://github.com/vuejs/vue)
- [iview 2.0](https://github.com/iview/iview)

## 功能
1. 文件的增、删、查
2. 目录显示
    - 七牛web页面没有这个功能,我觉得还挺实用,方便归类
3. 文件按日期/大小 排序(方便查找)
3. URL上传
    - 七牛提供了API,可以直接通过url抓取文件并保存到七牛.如果你经常干那种先下载,再上传的事,这个功能应该对你有帮助
4. 托盘上传
    - mac的特性,方便快捷,谁用谁知道
5. 拖拽上传
    - O__O "…  就是拖拽上传
6. 图片模式
    - 显示预览图,如果你有文章插图需要维护,应该可以方便查找

## 截图
![qiniu-Client截图.jpg](http://obfmtiyt5.bkt.clouddn.com/img%2FqiniuClient-0.0.5%E6%88%AA%E5%9B%BE.png)

![qiniu-Client截图2.jpg](http://obfmtiyt5.bkt.clouddn.com/img%2FqiniuClient-0.0.5%E6%88%AA%E5%9B%BE-2.png)

## Build Setup

``` bash
npm i  //electron 需要的文件下载巨慢,经常卡死,耐心,不行就翻墙

# serve with hot reload at localhost:9080
npm run dev

# build electron app for production
npm run build

# run webpack in production
npm run pack
```
More information can be found [electron-vue](https://simulatedgreg.gitbooks.io/electron-vue/content/docs/npm_scripts.html).

## issue
- 小文件下载状态更新异常
- 上传进度不灵敏.七牛上传文件块设置的是4M.调小以后,进度条反应比较正常,但是会提示上传失败 😂,所以会感觉明明上传了,但是半天没响应.
- ~~小文件上传失败.没有详细测试,大概范围是小于100KB的文件上传会失败.~~ 解决啦~ 🤓

## tips
### npm 安装git分支
```shell
npm i --save git://github.com/willnewii/nodejs-sdk.git#patch-1
```

## 参考资料
- [electron 中文文档](https://github.com/electron/electron/tree/master/docs-translations/zh-CN)
- [七牛API](https://developer.qiniu.com/kodo/api/1731/api-overview)
- [webpack2 中文文档](https://doc.webpack-china.org)