import Vue from 'vue';


import Electron from 'vue-electron';
import VueLazyload from 'vue-lazyload';
import ViewUI from 'view-design';

import menuDirective from 'v-contextmenu/src/directive';
import contextmenu from 'v-contextmenu/src/index';
import VirtualScrollList from 'vue-virtual-scroll-list';
import Viewer from "v-viewer";
import StatusView from '../components/StatusView.js'

import 'v-contextmenu/dist/index.css';
import 'view-design/dist/styles/iview.css';
import 'viewerjs/dist/viewer.css';

import '../directives/feature'

Vue.use(Electron);
Vue.use(VueLazyload, {
    throttleWait: 800,
});
Vue.component('virtual-list', VirtualScrollList);
Vue.component('Viewer', Viewer);


menuDirective.inserted = function (el, binding, vnode) {
    if (!binding.value)
        return;
    const contextmenu = vnode.context.$refs[binding.value];

    contextmenu.addRef({el, vnode});
    contextmenu.$contextmenuId = el.id || contextmenu._uid; // eslint-disable-line no-underscore-dangle
};

Vue.use(contextmenu);
Vue.use(ViewUI);

Vue.prototype.$statusView = StatusView;
