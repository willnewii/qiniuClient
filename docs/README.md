## 功能介绍
功能的定义,大多是在自己使用过程中有什么需求,然后抽象化想出大致的模型,再考虑技术上能不能实现,然后转化成代码.

[目录](http://ou62js7ck.bkt.clouddn.com/%E5%B1%8F%E5%B9%95%E5%BF%AB%E7%85%A7%202018-01-12%20%E4%B8%8A%E5%8D%889.53.30.png)

### 目录显示
> 七牛云并没有目录的概念,但是可以通过给文件名起成'a/b/c/d.png',加之[API](https://developer.qiniu.com/kodo/api/1284/list)提供了获取公共分隔符的方法,这样就能做出伪目录的效果.方便你对一个空间的内容进行分类和管理

### 托盘上传
> 这是从iPic那抄来的,发现electron也能做,就开发了.
与拖拽上传功能比较后觉得:
1. 托盘功能需要用户提前设置上传目录
2. 每次拖拽心理上会有一个不确定性,我上传的目录对吗
3. 多屏操作的时候,只能拖拽至焦点屏幕的icon上,有时候容易混
4. icon小... 个人使用中,每次都有一个'瞄准'的过程

### 拖拽上传
> 上面已经说过了,目前感觉还是拖拽用起来最舒服

### todo
- sync folder
- mini模式

### 通过npmrc配置electron,node-sass下载路径

### electron.build 配置
- [electron.build cli](https://www.electron.build/cli)

### issue
- [Critical dependency: the request of a dependency is an expression](https://github.com/SimulatedGREG/electron-vue/issues/498)
