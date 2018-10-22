import Vue from 'vue';

import Router from 'vue-router';
import axios from 'axios';


import "@/service/loadComponent";
import CloudObjectStorage from "@/cos/CloudObjectStorage";


Vue.use(Router);

Vue.prototype.$storage = new CloudObjectStorage();

//import brand from "@/cos/brand";
// Vue.prototype.$storage.setName(brand.qiniu);
// Vue.config.debug = false;

import routes from './routes';
import store from './vuex/store';

const router = new Router({
    scrollBehavior: () => ({y: 0}),
    routes
});

router.afterEach((to, from) => {
    if (to.meta && to.meta.hideTitle) {
        document.getElementById('title') && document.getElementById('title').remove();
    }
});

import * as util from '@/service/util';

//组件中直接显示文件名 'XXX/AAA/BBB/a.png => a.png'
Vue.filter('getfileNameByUrl', function (value) {
    return util.getPostfix(value);
});

Vue.filter('formatDate', function (value) {
    return util.formatDate(value);
});

Vue.filter('formatFileSize', function (value) {
    return util.formatFileSize(value);
});

//拦截器
axios.interceptors.response.use((response) => {
    return response;
}, (error) => {
    if (error && error.response && error.response.status === 401) {
        router.push({path: '/login'});
    }
    return Promise.reject(error);
});

import App from './App';

new Vue({
    el: '#app',
    router,
    store,
    render: h => h(App)
});

