<template>
    <div id="app" :style="{height:appHeight}">
        <div v-if="showDragView" class="drag-view"></div>
        <router-view></router-view>
    </div>
</template>

<script>
    import {Constants, util, EventBus} from '@/service';
    import {mapGetters, mapActions} from 'vuex';
    import * as types from '@/vuex/mutation-types';
    const customTitlebar = require('custom-electron-titlebar');

    export default {
        data() {
            return {
                titleBar: null,
                showDragView: process.platform === 'darwin',
                appHeight: '100%'
            };
        },
        computed: {
            ...mapGetters({
                setup_theme: types.setup.theme,
                setup_showMenuBar: types.setup.showMenuBar,
            }),
        },
        created: async function () {
            EventBus.$on(Constants.Event.changeTheme, (theme) => {
                this.doChangeTheme(theme)
            });
            await this[types.setup.init](() => {
                this.doChangeTheme(this.setup_theme)
            });
        },
        methods: {
            ...mapActions([
                types.setup.init,
            ]),
            doChangeTheme(theme){
                if (process.platform === 'win32' && !this.titleBar){
                    this.titleBar = new customTitlebar.Titlebar({
                        icon: require('../main/assets/icons/icon.png')
                    });
                }
                if (theme === 'auto') {
                    this.$electron.ipcRenderer.once(Constants.Listener.darkMode, (event, arg) => {
                        this._loadTheme(arg ? 'dark' : 'light');
                    });
                    this.$electron.ipcRenderer.send(Constants.Listener.darkMode);
                } else {
                    this._loadTheme(theme);
                }
            },
            _loadTheme(name = 'light') {
                let ele = document.querySelector("html");
                ele.className = `theme-${name}`
                if (this.titleBar){
                    this.titleBar.updateBackground(customTitlebar.Color.fromHex(name === 'light' ? '#FFF' : '#444'));
                }
            }
        }
    };
</script>
<style lang="scss">
    @import './style/animate';
    @import './style/base';
    @import './style/theme';
</style>
<style scoped>
    .drag-view {
        height: 22px;
        width: 100%;
        -webkit-app-region: drag;
    }
</style>
