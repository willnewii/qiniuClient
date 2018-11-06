# qiniuClient v0.2.1
![](http://blog-res.mayday5.me/niu_128.png?imageView2/1/w/30/h/30/q/75|imageslim)
> 七牛存储文件管理客户端.跟七牛云官网后台相比,增加了按目录显示,删除,修改等操作.支持URL上传,文件夹上传。腾讯COS也顺手支持了一下

## 效果图
【多选 按住 mac:command win:ctrl】
![qiniuClient-1.0.0截图1.png](http://blog-res.mayday5.me/img/%E5%B1%8F%E5%B9%95%E5%BF%AB%E7%85%A7%202018-10-24%20%E4%B8%8B%E5%8D%885.10.48.png)

【右键菜单&dark 配色】
![qiniuClient-1.0.0截图2.png](http://blog-res.mayday5.me/img/%E5%B1%8F%E5%B9%95%E5%BF%AB%E7%85%A7%202018-10-24%20%E4%B8%8B%E5%8D%885.05.42.png)

## 更新说明
2018.11.06
***
- 支持同步功能啦 [规则说明](https://github.com/willnewii/qiniuClient/wiki/bucket%E5%90%8C%E6%AD%A5)

2018.10.30
***
- 增加dark配色(mac会自动判断,您也可以在设置页手动设置)
- 支持腾讯云COS([部分功能不支持](https://github.com/willnewii/qiniuClient/wiki/%E8%85%BE%E8%AE%AFCOS%E4%B8%8D%E6%94%AF%E6%8C%81%E6%83%85%E5%86%B5))
- 支持搜索功能(默认会读取您COS的全部文件列表,这样就可以支持模糊查询,坏处就是bucket切换特别慢...)
- 优化了大空间(主要是文件个数多)的加载.
- 模拟目录显示,方便文件归类

old
***
- 文件的增、删,同时也支持文件夹的批量上传和删除啦
- 文件按日期/大小 排序和筛选
- URL上传,现在URL也支持批量上传了
    - 七牛提供了API,可以直接通过url抓取文件并保存到七牛.如果你经常有先从别的网站下载,然后在上传至七牛云的操作,这个功能应该对你有帮助
- 托盘上传
    - mac的特性,方便快捷,谁用谁知道.致敬一下[iPic](https://toolinbox.net/iPic/)
- 拖拽上传
    - O__O "… 本来是看别人有才做的...后来发现还挺好用
- 图片模式
    - 显示预览图,如果您有维护图片的需求,这个功能还算实用.
- 私有空间操作([说明](https://github.com/willnewii/qiniuClient/wiki/%E7%A7%81%E6%9C%89%E7%A9%BA%E9%97%B4%E5%92%8C%E6%8E%88%E6%9D%83%E7%A9%BA%E9%97%B4))

## 下载
- [mac v0.2.1](http://blog-res.mayday5.me/file/COS%E7%AE%A1%E7%90%86%E5%AE%A2%E6%88%B7%E7%AB%AF-0.2.1-mac.dmg)
- [win v0.2.0](http://blog-res.mayday5.me/file/COS%E7%AE%A1%E7%90%86%E5%AE%A2%E6%88%B7%E7%AB%AF-0.2.0-win_2.exe)

## Build Setup
``` bash
# 安装依赖
npm i
# 运行开发模式
npm run dev

# 构建对应你的平台的安装包
npm run build:mac
npm run build:win32
```

## Technologies
- [electron](https://github.com/electron/electron)
- [electron-vue](https://github.com/SimulatedGREG/electron-vue)
- [vue2.0 + axios + router + vuex](https://github.com/vuejs/vue)
- [iview 3.0](https://github.com/iview/iview)
- [v-contextmenu '右键菜单'](https://github.com/snokier/v-contextmenu)
- [vue-virtual-scroll-list](https://github.com/tangbc/vue-virtual-scroll-list)

## 参考资料
- [图标来源：懒人图库](http://www.lanrentuku.com/vector/animal/lansexinxianniunaibiaoqian-shiliang.html)
- [electron 文档](https://github.com/electron/electron/tree/master/docs-translations/zh-CN)
- [electron-vue 文档](https://simulatedgreg.gitbooks.io/electron-vue/cn/)
- [七牛API](https://developer.qiniu.com/kodo/api/1731/api-overview)
- [webpack2 文档](https://doc.webpack-china.org)
- [Node.js 文档](http://nodejs.cn/api/)
- [electron.build cli 文档](https://www.electron.build/cli)
