import Vue from 'vue';


import Electron from 'vue-electron';
import VueLazyload from 'vue-lazyload';
import iView from 'iview';
import menuDirective from 'v-contextmenu/src/directive';
import contextmenu from 'v-contextmenu/src/index';

import 'v-contextmenu/dist/index.css';
import 'iview/dist/styles/iview.css';

Vue.use(Electron);
Vue.use(VueLazyload);

menuDirective.inserted = function (el, binding, vnode) {
    if (!binding.value)
        return;
    const contextmenu = vnode.context.$refs[binding.value];

    contextmenu.addRef({el, vnode});
    contextmenu.$contextmenuId = el.id || contextmenu._uid; // eslint-disable-line no-underscore-dangle
};

Vue.use(contextmenu);
Vue.use(iView);