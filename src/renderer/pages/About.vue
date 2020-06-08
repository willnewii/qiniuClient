<template>
    <div class="about-view">
        <img class="logo" src="../assets/img/icon.png">
        <div class="name">{{info.cnname}}</div>
        <div>v{{info.version}}</div>
        <div>{{platform}}</div>
        <div>electron: {{versions.electron}}</div>
    </div>
</template>
<script>
    import pkg from '../../../package';

    export default {
        name: 'about-page',
        mixins: [],
        data() {
            return {
                info: pkg,
                versions: process.versions,
                platform: process.platform
            };
        },
        created() {
            document.getElementById('title') && document.getElementById('title').remove();
        },
        methods: {}
    };
</script>
<style lang="scss" scoped>
    .about-view {
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;

        .logo {
            width: 100px;
            height: 100px;
        }

        .name {
            font-weight: bold;
            font-size: 20px;
            padding: 10px 0;
        }
    }
</style>

