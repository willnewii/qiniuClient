<template>
    <div id="app" :style="{height:appHeight}">
        <router-view></router-view>
    </div>
</template>

<script>
    import store from 'renderer/vuex/store'

//    import titlebar from "titlebar";

    export default {
        store,
        computed: {
            appHeight() {
                if (document.getElementById('title'))
                    return (window.innerHeight - document.getElementById('title').offsetHeight) + 'px';
                else
                    return '100%';
            }
        },
        mounted() {
            /*            let t = titlebar();
             t.appendTo(document.getElementById('title'));

             t.on('close', () => {
             this.$electron.ipcRenderer.send('window-close');
             });
             t.on('minimize', () => {
             this.$electron.ipcRenderer.send('window-minimize');
             });
             t.on('maximize', () => {
             this.$electron.ipcRenderer.send('window-maximize');
             });
             t.on('fullscreen', () => {
             this.$electron.ipcRenderer.send('window-fullscreen');
             });*/
        }
    }
</script>

<style lang="scss">
    @import url(https://fonts.googleapis.com/css?family=Lato:500);

    .vertical-center-modal {
        display: flex;
        align-items: center;
        justify-content: center;

        .ivu-modal {
            top: 0;

        }
    }
</style>
