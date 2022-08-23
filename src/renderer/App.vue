<template>
  <div id="app" :style="{ height: appHeight }">
    <div v-if="showDragView" class="drag-view"></div>
    <router-view></router-view>
  </div>
</template>

<script>
import { mapState, mapActions } from 'pinia'
import * as types from '@/vuex/mutation-types'
import { useSetupStore } from '@/stores/setup'

import { Constants, EventBus } from '@/service'

const customTitlebar = require('custom-electron-titlebar')

export default {
  data() {
    return {
      titleBar: null,
      showDragView: process.platform === 'darwin',
      appHeight: '100%',
    }
  },
  computed: {
    ...mapState(useSetupStore, [types.setup.setup_info]),
  },
  created: async function () {
    if (process.platform === 'win32') {
      this.$Notice.config({
        top: 40,
      })
    }
    EventBus.$on(Constants.Event.changeTheme, theme => {
      this.doChangeTheme(theme)
    })
    this[types.setup.setup_init](() => {
      this.doChangeTheme(this[types.setup.setup_info].theme)
    })
  },
  methods: {
    ...mapActions(useSetupStore, [types.setup.setup_init]),
    doChangeTheme(theme) {
      if (process.platform === 'win32' && !this.titleBar) {
        this.titleBar = new customTitlebar.Titlebar({
          icon: require('../main/assets/icons/icon.png'),
        })
      }
      if (theme === 'auto') {
        this.$electron.ipcRenderer.once(Constants.Listener.darkMode, (event, arg) => {
          this._loadTheme(arg ? 'dark' : 'light')
        })
        this.$electron.ipcRenderer.send(Constants.Listener.darkMode)
      } else {
        this._loadTheme(theme)
      }
    },
    _loadTheme(name = 'light') {
      let ele = document.querySelector('html')
      ele.className = `theme-${name}`
      if (this.titleBar) {
        this.titleBar.updateBackground(customTitlebar.Color.fromHex(name === 'light' ? '#FFF' : '#444'))
      }
    },
  },
}
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
