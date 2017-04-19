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

/* eslint-disable no-new */
new Vue({
    router,
    store,
    ...App
}).$mount('#app')
