<template>
    <div class="status-view" v-bind:class="{'status-view-none' : !visible}">
        <div v-if="progress > 0" :style="{width: progress + '%'}" class="progress"></div>
        <div>{{message}}</div>
        <div>{{path}}</div>
    </div>
</template>
<script>
    export default {
        name: 'StatusView',
        data() {
            return {
                visible: false,
                path: '',
                message: '',
                // 单个文件时 表示文件的进度. 多文件时表示总进度
                progress: 0
            };
        },
        created() {},
        methods: {}
    };
</script>
<style lang="scss" scoped>
    @import "../style/params";

    .status-view {
        opacity: 1;
        position: fixed;
        bottom: 0;
        width: 100%;
        left: 0;
        text-align: left;
        background-color: rgba(0, 0, 0, 0.51);
        color: #FFFFFF;
        padding: 5px 10px;
        font-size: 12px;
        z-index: 901;
        transition: opacity 1s;
    }

    .status-view-none {
        opacity: 0;
        transition: opacity .5s;
    }

    .progress {
        height: 100%;
        background-color: $primary;
        position: absolute;
        top: 0;
        left: 0;
        transition: width 1s;
        z-index: -1;
    }
</style>
