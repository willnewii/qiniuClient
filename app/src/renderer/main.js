import Vue from 'vue'
import Electron from 'vue-electron'
import Router from 'vue-router'

import App from './App'
import routes from './routes'

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
    ...App
}).$mount('#app')
