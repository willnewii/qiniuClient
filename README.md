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
    - 七牛有api,可以直接通过url抓取文件并保存至七牛.如果你经常干那种先下载,再上传的事,这个是挺方便的一个功能
4. 托盘上传
    - mac独有的功能,方便快捷,谁用谁知道
5. 拖拽上传
    - O__O "…  就只是拖拽上传.  目前只支持单文件

## 截图
![qiniu-Client_和_qiniu-Client_和_README_md_-_my-project2_-____Downloads_Web_Vue_my-project2_.jpg](http://obfmtiyt5.bkt.clouddn.com/img/qiniuClient-0.0.4%E6%88%AA%E5%9B%BE.png)

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

## 参考资料 
- [electron-doc 中文文档-gitbook](https://wizardforcel.gitbooks.io/electron-doc/content/index.html)
- [中文文档](https://github.com/electron/electron/tree/master/docs-translations/zh-CN)
- [七牛API](https://developer.qiniu.com/kodo/api/1731/api-overview)
- [webpack2 中文文档](https://doc.webpack-china.org)