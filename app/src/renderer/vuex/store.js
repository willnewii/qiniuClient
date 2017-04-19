import Vue from 'vue'
import Vuex from 'vuex'

import app from './modules/app'

Vue.use(Vuex)

export default new Vuex.Store({
    modules: {
        app
    },
    strict: process.env.NODE_ENV !== 'production'
})