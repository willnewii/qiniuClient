import Vue from 'vue';
import * as Constants from './service/constants';
import Router from 'vue-router';
import axios from 'axios';


import "@/service/loadComponent";
import CloudObjectStorage from "@/cos/CloudObjectStorage";

Vue.prototype.$storage = new CloudObjectStorage();


Vue.use(Router);

import PasteImageService from "./service/pasteImageService";

const pasteImageService = new PasteImageService();

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
    if (to.name === Constants.PageName.login) {
        pasteImageService.setEnable(false);
    } else {
        pasteImageService.setEnable(true);
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

//拦截器(会影响到青云的请求)
axios.interceptors.response.use((response) => {
    if (response.data) {
        return typeof (response.data) === 'object' ? response.data : JSON.parse(response.data);
    }
    return response.data;
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
