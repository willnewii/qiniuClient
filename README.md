# 云存储管理客户端 v0.3.3
![](http://blog-res.mayday5.me/file/icon.png?imageView2/1/w/80/h/80/q/75|imageslim) 女朋友给做的新图标😜
> 云存储管理客户端。支持七牛云、腾讯云、青云、阿里云、又拍云。仿文件夹式管理、图片预览、拖拽上传、文件夹上传、同步、批量导出URL等功能

## 效果图
【目前已支持 七牛云、腾讯云、青云、阿里云、又拍云】
![屏幕快照 2018-12-25 下午4.02.10.png](http://blog-res.mayday5.me/img/%E5%B1%8F%E5%B9%95%E5%BF%AB%E7%85%A7%202018-12-25%20%E4%B8%8B%E5%8D%884.02.10.png)

【批量选择】
![屏幕快照 2018-12-25 下午4.26.14.png](http://blog-res.mayday5.me/%E5%B1%8F%E5%B9%95%E5%BF%AB%E7%85%A7%202018-12-25%20%E4%B8%8B%E5%8D%884.26.14.png)

【右键菜单&dark 配色】
![屏幕快照 2018-12-25 下午4.28.47.png](http://blog-res.mayday5.me/img/%E5%B1%8F%E5%B9%95%E5%BF%AB%E7%85%A7%202018-12-25%20%E4%B8%8B%E5%8D%884.28.47.png)

## 更新说明
2019.08.14
***
- 新增显示webp格式图片
2019.04.26
***
- 新增上传成功后,自动复制链接到剪切板 感谢[xiaobebe](https://github.com/xiaobebe)
- 新增分页模式开关
- 新增加载提示框添加进度显示(七牛云)
- change：修改操作逻辑.单击为选中，双击为下一级或图片预览
- fix：七牛新建存储空间获取count、space数据异常
- fix：腾讯COS上传失败
- fix: 开启原图保护图片不显示

2018.12.25
***
- 🎄圣诞快乐~
- 优化了构建流程
- 新增分页模式,针对七牛云文件量很大的用户,应该会好一些.
- 新增支持**又拍云**对象存储
2018.12.07
***
- 腾讯云支持自定义域名
- 设置页面添加https开关
- 新增支持**阿里云**对象存储
- fix:windwos 不显示通知
2018.11.19
***
- 支持资源URL批量导出
- 应用内直接浏览图片
- 新增支持**青云**对象存储

2018.11.06
***
- 支持同步功能啦 [规则说明](https://github.com/willnewii/qiniuClient/wiki/bucket%E5%90%8C%E6%AD%A5%E8%A7%84%E5%88%99)

2018.10.30
***
- 增加dark配色(mac会自动判断,您也可以在设置页手动设置)
- 支持**腾讯云**对象存储
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
- 私有空间操作([说明](https://github.com/willnewii/qiniuClient/wiki/%E4%B8%83%E7%89%9B%E7%A7%81%E6%9C%89%E7%A9%BA%E9%97%B4%E5%92%8C%E6%8E%88%E6%9D%83%E7%A9%BA%E9%97%B4%E5%A4%84%E7%90%86)）

## 下载
- [云存储管理客户端-0.3.3-mac.dmg](http://blog-res.mayday5.me/file/%E4%BA%91%E5%AD%98%E5%82%A8%E7%AE%A1%E7%90%86%E5%AE%A2%E6%88%B7%E7%AB%AF-0.3.3-mac.dmg)
- [云存储管理客户端-0.3.2-win.exe](http://blog-res.mayday5.me/file/%E4%BA%91%E5%AD%98%E5%82%A8%E7%AE%A1%E7%90%86%E5%AE%A2%E6%88%B7%E7%AB%AF-0.3.2-win.exe)

## Build Setup
``` bash
# 安装依赖
npm i
# 运行开发模式
npm run dev

# 构建对应你的平台的安装包
npm run build:mac
npm run build:win32

# 字段说明
package,添加了一个cdnPath字段.你可以将资源上传至该路径下.这样可以实现简单的renderer资源的动态更新.默认为空读取本地.
- renderer.js
- style.css
```

### issue
- 阿里云上传回调异常

## Technologies
- [electron](https://github.com/electron/electron)
- [electron-vue](https://github.com/SimulatedGREG/electron-vue)
- [vue2.0 + axios + router + vuex](https://github.com/vuejs/vue)
- [iview 3.0](https://github.com/iview/iview)
- [v-contextmenu '右键菜单'](https://github.com/snokier/v-contextmenu)
- [vue-virtual-scroll-list](https://github.com/tangbc/vue-virtual-scroll-list)

## 参考资料
- [electron 文档](https://github.com/electron/electron/tree/master/docs-translations/zh-CN)
- [electron-vue 文档](https://simulatedgreg.gitbooks.io/electron-vue/cn/)
- [七牛API](https://developer.qiniu.com/kodo/api/1731/api-overview)
- [webpack2 文档](https://doc.webpack-china.org)
- [Node.js 文档](http://nodejs.cn/api/)
- [electron.build cli 文档](https://www.electron.build/cli)
