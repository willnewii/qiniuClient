<template>
    <div id="app">
        <router-view></router-view>
    </div>
</template>

<script>
    import store from 'renderer/vuex/store'
    export default {
        store
    }
</script>

<style>
    @import url(https://fonts.googleapis.com/css?family=Lato:300);

    * {
        margin: 0;
        padding: 0;
    }

    html,
    body {
        height: 100%;
        font-family: Lato, Helvetica, sans-serif;
    }

    #app {
        width: 100%;
        height: 100%;
    }
</style>
