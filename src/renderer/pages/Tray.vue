<style lang="scss" scoped>
.ivu-menu-horizontal {
  height: 40px;
  line-height: 40px;
}

.list {
  height: 260px;
  overflow: scroll;

  .item {
    display: flex;
    flex-direction: row;
    align-items: flex-end;
    padding: 10px;
    border-bottom: 1px #ccc solid;

    .image {
      width: 50px;
      height: 50px;
      margin-right: 10px;
    }

    .btn {
      margin-right: 5px;
    }
  }
}
</style>
<template>
  <div>
    <Menu mode="horizontal" active-name="1">
      <Menu-item name="1">上传记录</Menu-item>
    </Menu>
    <div class="list">
      <div class="item" v-for="item of logs" :key="item.key">
        <div v-if="item.code == 0">
          <div>{{ item.key }}</div>
          <div>
            <i-button class="btn" type="primary" size="small" @click="show(item.key)">查看</i-button>
            <i-button class="btn" type="primary" size="small" @click="copyFileUrl(item.key)">复制路径</i-button>
            <i-button class="btn" type="primary" size="small" @click="openInFolder(item.path)">源文件</i-button>
          </div>
        </div>
        <div v-else>
          {{ item.error }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import * as types from '../vuex/mutation-types'
import { util, Constants, storagePromise, mixins, brand } from '../service'
import storage from 'electron-json-storage'
import Request from '@/api/API'

let ipc
let bucket

export default {
  name: 'tray-page',
  mixins: [mixins.base],
  data() {
    return {
      domains: [],
      files: [],
      logs: [],
      current: 0,
      config: {},
    }
  },
  computed: {},
  async created() {
    //TODO: 托盘目前逻辑有问题,需要重写
    ipc = this.$electron.ipcRenderer

    let app = await storagePromise.get(Constants.Key.configuration)
    console.log(app)
    if (app && app.tray.brand && app.tray.bucket_name) {
      this.$storage.getBindCoses(result => {
        let hasFind = false
        for (let i = 0; i < result.coses.length; i++) {
          if (result.coses[i].uuid === app.tray.uuid) {
            hasFind = true
            this.$storage.initCOS(result.coses[i], result => {
              if (result) {
                this.$storage.getBuckets((err, result) => {
                  if (err) {
                    console.error(err)
                  } else {
                    for (let j = 0; j < result.length; j++) {
                      if (app.tray.bucket_name === result[j].name) {
                        console.log(app.tray.brand)
                        bucket = this.$storage.cos.generateBucket(result[j])
                        ipc.send(Constants.Listener.setBrand, {
                          key: app.tray.brand,
                        })
                        //七牛处理域名列表
                        if (app.tray.brand === brand.qiniu.key && this.$storage.cos.methods) {
                          let request = new Request()
                          let url = `${this.$storage.cos.methods.domains}?tbl=${app.tray.bucket_name}`
                          request.get(url).then(result => {
                            bucket.domain = result[0]
                          })
                        }
                        console.log('托盘启动')
                        break
                      }
                    }
                  }
                })
              } else {
                console.log('key 注册失败')
              }
            })
            break
          }
        }

        if (!hasFind) {
          console.log('未匹配到托盘信息')
        }
      })
    } else {
      console.error('未设置托盘')
    }

    ipc.removeAllListeners(Constants.Listener.trayUploadFile)
    ipc.on(Constants.Listener.trayUploadFile, (event, files) => {
      storage.get(Constants.Key.configuration, (error, app) => {
        if (app && app.tray.brand && app.tray.bucket_name) {
          this.files = files
          this.config = app
          this.doUploadFile()
        } else {
          ipc.send(Constants.Listener.showNotifier, {
            message: '请先设置上传空间[设置->托盘上传位置]',
          })
          this.updateStatus('')
        }
      })
    })
  },
  methods: {
    ...mapActions([types.setup.init]),
    updateStatus(title) {
      ipc.send(Constants.Listener.trayUpdateTitle, title)
    },
    doUploadFile() {
      if (this.current === this.files.length) {
        this.updateStatus('')
        this.current = 0
      } else {
        this.uploadFile(this.files[this.current])
      }
    },
    uploadFile(file) {
      this.updateStatus(`${this.current + 1}/${this.files.length}`)
      let key = ''
      key = (this.config.tray.bucket_dir ? this.config.tray.bucket_dir + '/' : '') + util.getFileNameWithFolder(file)
      let log = {
        path: file.path,
        key,
      }
      try {
        bucket.createFile(
          {
            key,
            path: file.path,
            progressCallback: progress => {
              if (progress !== 100) {
                this.updateStatus(`(${progress}%)${this.current + 1}/${this.files.length}`)
              }
            },
          },
          undefined,
          (err, ret) => {
            this.handleResult(err, log)
          },
        )
      } catch (err) {
        this.handleResult(err, log)
      }
    },
    handleResult(err, log) {
      console.log(err, log)
      if (!err) {
        //ret.key
        log.code = 0
        ipc.send(Constants.Listener.showNotifier, {
          title: '上传成功',
          message: log.path,
          image: log.path,
        })
      } else {
        log.code = err.status
        log.error = err.error
      }

      this.logs.unshift(log)
      this.current++
      this.doUploadFile()
    },
    show(key) {
      let url = bucket.generateUrl(key)
      this.$electron.shell.openExternal(url)
    },
    copyFileUrl(key) {
      let url = bucket.generateUrl(key)
      util.getClipboardText(this.config.copyType, url)
    },
    openInFolder(path) {
      this.$electron.shell.showItemInFolder(path)
    },
    isImg(file) {
      return new RegExp(/\.(png|jpe?g|gif|svg)(\?.*)?$/).test(file)
    },
  },
}
</script>
