<template>
    <div class="status-view" v-bind:class="{'status-view-none' : !status.show}">
        <div v-if="status.progress > 0" :style="{width: status.progress + '%'}" class="progress"></div>
        <div>{{status.message}}</div>
        <div>{{status.path}}</div>
    </div>
</template>
<script>
    import {Constants, EventBus} from '../service/index';

    export default {
        name: 'StatusView',
        data() {
            return {
                status: {
                    show: false,
                    path: '',
                    message: '',
                    progress: 0
                },
            };
        },
        created() {
            EventBus.$on(Constants.Event.statusView, (option) => {
                this.status = ('show' in option && !option.show) ? this.$options.data().status : Object.assign(this.status, option);
            });
            this.$once('hook:beforeDestroy', function () {
                EventBus.$off(Constants.Event.statusView);
            });
        },
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
        padding: 10px;
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
        z-index: -1;
    }
</style>
