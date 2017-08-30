<template>
    <div id="app" :style="{height:appHeight}">
        <router-view></router-view>
    </div>
</template>

<script>
    import store from 'renderer/vuex/store'

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
        data() {
            return {}
        },
        created: function () {
            if (process.platform !== 'darwin') {
                document.getElementById('title').remove();
            }
        },
        mounted() {
        }
    }
</script>

<style lang="scss">
    .vertical-center-modal {
        display: flex;
        align-items: center;
        justify-content: center;

        .ivu-modal {
            top: 0;

        }
    }
</style>
