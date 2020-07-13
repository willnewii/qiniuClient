import Vue from "vue"
import brand from "../cos/brand"

/**
 * feature 功能指令
 * 指令用法：
 *  - 匹配brand中各服务商已配置好的功能,如果有,显示元素,没有则隐藏元素
 *    <i-button v-feature:urlUpload >url上传</a-button>
 */
const feature = Vue.directive("feature", {
    inserted: function (el, binding, vnode) {
        checkFeature(el, binding, vnode)
    },
    update: function (el, binding, vnode) {
        checkFeature(el, binding, vnode)
    }
})

function checkFeature(el, binding, vnode) {
    if (vnode.context.$storage.key) {
        let features = brand[vnode.context.$storage.key].features

        if (!features || !features.includes(binding.arg)) {
            ;(el.parentNode && el.parentNode.removeChild(el)) || (el.style.display = "none")
        }
    }
}

export default feature
