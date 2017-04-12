# my-project2

> An electron-vue project

## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:9080
npm run dev

# build electron app for production
npm run build

# run webpack in production
npm run pack
```
More information can be found [here](https://simulatedgreg.gitbooks.io/electron-vue/content/docs/npm_scripts.html).

---

This project was generated from [electron-vue](https://github.com/SimulatedGREG/electron-vue) using [vue-cli](https://github.com/vuejs/vue-cli). Documentation about this project can be found [here](https://simulatedgreg.gitbooks.io/electron-vue/content/index.html).

#### fix
- vue package.json
```
"main": "dist/vue.common.js",
```

- sync-request package.json
```
"main": "./browser.js"
```

#### iView + Electron [独立构建-vs-运行时构建](https://cn.vuejs.org/v2/guide/installation.html#独立构建-vs-运行时构建)
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


### [中文文档-gitbook](https://wizardforcel.gitbooks.io/electron-doc/content/index.html)
- [中文文档](https://github.com/electron/electron/tree/master/docs-translations/zh-CN)
- [electron-cn-docs](https://github.com/amhoho/electron-cn-docs/)

- [qiniu api](https://developer.qiniu.com/kodo/api/1731/api-overview)

- [webpack2 中文文档](https://doc.webpack-china.org)