import Vue from 'vue';

import Router from 'vue-router';
import Electron from 'vue-electron';
import VueLazyload from 'vue-lazyload';
import axios from 'axios';

import iView from 'iview';
import 'iview/dist/styles/iview.css';

import {util} from './service';
import CloudObjectStorage from "@/cos/CloudObjectStorage";
import brand from "@/cos/brand";

Vue.use(Electron);
Vue.use(Router);
Vue.use(iView);
Vue.use(VueLazyload);

Vue.prototype.$storage = new CloudObjectStorage();
// Vue.prototype.$storage.setName(brand.qiniu);
// Vue.config.debug = false;

import routes from './routes';
import store from './vuex/store';

const router = new Router({
    scrollBehavior: () => ({y: 0}),
    routes
});

Vue.filter('getfileNameByPath', function (value) {
    return util.getPostfix(value);
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
    router,
    store,
    ...App
}).$mount('#app');

