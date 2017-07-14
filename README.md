# qiniuClien

> 七牛存储文件管理客户端.跟官网比主要多了一个托盘上传功能.可以更便捷的上传文件.

#### todo
- 文件拖拽

#### Technologies
- [electron](https://github.com/electron/electron)
- [electron-vue](https://github.com/SimulatedGREG/electron-vue)
- [vue2.0 + axios + router + vuex](https://github.com/vuejs/vue)
- [iview 2.0](https://github.com/iview/iview)

#### 功能
1. 文件的增、删、查
2. 显示目录 
3. 转存文件
3. 文件按日期/大小 排序
4. 托盘上传

#### 截图
![qiniu-Client_和_qiniu-Client_和_README_md_-_my-project2_-____Downloads_Web_Vue_my-project2_.jpg](http://obfmtiyt5.bkt.clouddn.com/11111%2Fqiniu-Client_%E5%92%8C_qiniu-Client_%E5%92%8C_README_md_-_my-project2_-____Downloads_Web_Vue_my-project2_.jpg)

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
More information can be found [here](https://simulatedgreg.gitbooks.io/electron-vue/content/docs/npm_scripts.html).


##### tips: iView + Electron [独立构建-vs-运行时构建](https://cn.vuejs.org/v2/guide/installation.html#独立构建-vs-运行时构建)
```
TypeError: _vue2.default.compile is not a function at VueComponent.compile
//官网提示可以在webpack添加
resolve: {
  alias: {
    'vue$': 'vue/dist/vue.common.js'
  }
}
我的没有效果...我直接修改了vue的package.json
```

#### 参考资料 
- [中文文档-gitbook](https://wizardforcel.gitbooks.io/electron-doc/content/index.html)
- [中文文档](https://github.com/electron/electron/tree/master/docs-translations/zh-CN)
- [electron-cn-docs](https://github.com/amhoho/electron-cn-docs/)
- [七牛API](https://developer.qiniu.com/kodo/api/1731/api-overview)
- [webpack2 中文文档](https://doc.webpack-china.org)