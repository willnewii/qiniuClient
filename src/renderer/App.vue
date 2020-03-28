<template>
    <div id="app" :style="{height:appHeight}">
        <router-view></router-view>
    </div>
</template>

<script>
    import {Constants, util} from '@/service';
    import {mapGetters, mapActions} from 'vuex';
    import * as types from '@/vuex/mutation-types';

    export default {
        data() {
            return {};
        },
        computed: {
            ...mapGetters({
                setup_theme: types.setup.theme,
                setup_showMenuBar: types.setup.showMenuBar,
            }),
            appHeight() {
                if (document.getElementById('title'))
                    return (window.innerHeight - document.getElementById('title').offsetHeight) + 'px';
                else
                    return '100%';
            }
        },
        created: async function () {
            await this[types.setup.init](() => {
                //this.$electron.ipcRenderer.send(Constants.Listener.showMenuBar, this.setup_showMenuBar);
                if (this.setup_theme === 'auto') {
                    this.$electron.ipcRenderer.once(Constants.Listener.darkMode, (event, arg) => {
                        util.loadTheme(arg ? 'dark' : 'light');
                    });
                    this.$electron.ipcRenderer.send(Constants.Listener.darkMode);
                } else {
                    util.loadTheme(this.setup_theme);
                }
            });
        },
        methods: {
            ...mapActions([
                types.setup.init,
            ]),
        }
    };
</script>
<style lang="scss">
    @import './style/animate';
    @import './style/base';
    @import './style/theme';
</style>
