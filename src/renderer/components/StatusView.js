import Vue from "vue"
import StatusViewComponent from "./StatusView.vue"

let statusViewInstance = undefined;
const StatusViewConstructor = Vue.extend(StatusViewComponent)

StatusViewConstructor.prototype.destroy = function () {
  if (statusViewInstance) {
    statusViewInstance = undefined
  }
  // 先将组件隐藏
  this.visible = false
  // 延迟300毫秒，等待loading关闭动画执行完之后销毁组件
  setTimeout(() => {
    // 移除挂载的dom元素
    if (this.$el && this.$el.parentNode) {
      this.$el.parentNode.removeChild(this.$el)
    }
    // 调用组件的$destroy方法进行组件销毁
    this.$destroy()
  }, 300)
}

StatusViewConstructor.prototype.show = function (options = {}) {
  this.visible = true
  if (options.path) this.path = options.path
  if (options.message) this.message = options.message
  if (options.progress) this.progress = options.progress
}

function getInstance (opts = {}) {
  if (!statusViewInstance){
    // 要挂载的元素
    const parent = document.body
    statusViewInstance = new StatusViewConstructor({
      el: document.createElement("div"),
      data: opts
    })
    parent.appendChild(statusViewInstance.$el)
  }

  return statusViewInstance;
}

export default {
  show(options = {}){
    getInstance().show(options);
  },
  destroy(){
    getInstance().destroy();
  }
}
