<template>
  <div>
    //删除前确认
    //默认复制:markdown / url
    //默认上传位置
  </div>
</template>

<script>
  import CurrentPage from './LandingPageView/CurrentPage'
  import Links from './LandingPageView/Links'
  import Versions from './LandingPageView/Versions'
  export default {
    components: {
      CurrentPage,
      Links,
      Versions
    },
    name: 'landing-page'
  }
</script>

<style scoped>
  img {
    margin-top: -25px;
    width: 450px;
  }
</style>
