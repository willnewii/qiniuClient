import Vue from 'vue';
import Vuex from 'vuex';

import app from './modules/app';
import setup from './modules/setup';

Vue.use(Vuex);

export default new Vuex.Store({
    modules: {
        app,
        setup
    },
    strict: process.env.NODE_ENV !== 'production'
});