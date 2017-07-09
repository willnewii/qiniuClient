import Vue from 'vue'

import Router from 'vue-router'
import Electron from 'vue-electron'

import axios from 'axios';

import iView from 'iview';
import 'iview/dist/styles/iview.css';

Vue.use(Electron);
Vue.use(Router);
Vue.use(iView);
Vue.config.debug = false;

import routes from './routes'
import store from './vuex/store'

const router = new Router({
    scrollBehavior: () => ({y: 0}),
    routes
});

//拦截器

axios.interceptors.response.use((response) => {
    return response;
}, (error) => {
    if (error.response.status == 401) {
        router.push({path: '/login'});
    }
});

import App from './App';
/!* eslint-disable no-new *!/
new Vue({
    router,
    store,
    ...App
}).$mount('#app');
