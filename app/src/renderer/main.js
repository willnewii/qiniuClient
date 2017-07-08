import Vue from 'vue'
import Router from 'vue-router'
import Electron from 'vue-electron'

import App from './App'
import routes from './routes'
import store from './vuex/store'

import iView from 'iview';
import 'iview/dist/styles/iview.css';

Vue.use(Electron)
Vue.use(Router)
Vue.use(iView)
Vue.config.debug = false


const router = new Router({
    scrollBehavior: () => ({y: 0}),
    routes
})

//拦截器
import axios from 'axios'
axios.interceptors.response.use((response) => {
    return response;
}, (error) => {
    if (error.response.status == 401) {
        router.push({path: '/login'});
    }
});

/* eslint-disable no-new */
new Vue({
    router,
    store,
    ...App
}).$mount('#app')
