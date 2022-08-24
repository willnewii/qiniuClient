<template>
  <div class="page">
    <!-- <div class="item" v-if="isShowMenuBarItem">
            <span class="item-title">隐藏菜单栏</span>
            <i-switch :value="setup.showMenuBar" size="small" @on-change="showMenuBarChange"></i-switch>
        </div> -->
    <!--        <Divider orientation="left">全局设置</Divider>-->
    <Row class="row">
      <Col :span="rowSpan"><span class="item-title">开启Https</span></Col>
      <Col span="12"><i-switch :value="setup.https" size="small" @on-change="httpsChange"></i-switch></Col>
    </Row>
    <Row class="row" v-feature:paging>
      <Col :span="rowSpan">开启分页</Col>
      <Col span="12">
        <i-switch :value="setup.paging" size="small" @on-change="pagingChange"></i-switch>
        <Icon class="help" @click="openBrowser(2)" type="md-help" />
      </Col>
    </Row>
    <Row class="row">
      <Col :span="rowSpan">隐藏删除按钮</Col>
      <Col span="12"><i-switch :value="setup.hiddenDelBtn" size="small" @on-change="hiddenDelBtnChange"></i-switch></Col>
    </Row>
    <Row class="row">
      <Col :span="rowSpan">直接删除,不显示确认框</Col>
      <Col span="12"><i-switch :value="setup.deleteNoAsk" size="small" @on-change="deleteNoAskChange"></i-switch></Col>
    </Row>
    <Row class="row">
      <Col :span="rowSpan">直接上传,不显示确认框</Col>
      <Col span="12"><i-switch :value="setup.uploadNoAsk" size="small" @on-change="uploadNoAskChange"></i-switch></Col>
    </Row>
    <Row class="row">
      <Col :span="rowSpan">如果文件已存在,是否覆盖上传</Col>
      <Col span="12">
        <i-switch :value="setup.isOverwrite" size="small" @on-change="isOverwriteChange"></i-switch>
      </Col>
    </Row>
    <Row class="row">
      <Col :span="rowSpan">复制到粘贴板格式</Col>
      <Col span="12">
        <Radio-group :value="setup.copyType" @on-change="copyTypeChange">
          <Radio label="url"></Radio>
          <Radio label="markdown"></Radio>
        </Radio-group>
      </Col>
    </Row>
    <Row class="row">
      <Col :span="rowSpan">主题</Col>
      <Col span="12">
        <Radio-group :value="theme" @on-change="themesChange">
          <Radio label="auto">自动</Radio>
          <Radio label="light"></Radio>
          <Radio label="dark"></Radio>
        </Radio-group>
      </Col>
    </Row>
    <Row class="row">
      <Col :span="rowSpan">下载目录</Col>
      <Col span="12">
        <Input v-model="downloaddir" size="small" placeholder="默认download目录" style="width: 80%" disabled />
        <Button @click="choiceDownloadolder" size="small" class="save-btn" icon="ios-folder-outline" />
      </Col>
    </Row>

    <!--<Divider orientation="left"
            >托盘设置<span class="title-tips" v-if="setup_tray"
                >(文件将会被上传至{{ brands[setup_tray.brand] && brands[setup_tray.brand].name }}：{{
                    setup_tray.bucket_name
                }}/{{ setup_tray.bucket_dir ? setup_tray.bucket_dir + "/" : "" }}目录下)</span
            ></Divider
        >
        <div class="item">
            <Row class="row-line">
                <Col span="12">
                    <Select v-model="tray.bucket_name" size="small" style="width: 30%;" placeholder="空间名称">
                        <Option v-for="item in buckets_info" :value="item.name" :key="item.name"
                            >{{ item.name }}
                        </Option>
                    </Select>
                    /
                    <Input v-model="tray.bucket_dir" size="small" style="width: 66%;" placeholder="路径" />
                </Col>
                <Col span="10" offset="1">
                    <Button @click="saveTray" size="small" class="save-btn">保存</Button>
                </Col>
            </Row>
        </div>
-->
    <div class="item" v-feature:imageStyle>
      预览图片样式：
      <Icon class="help" @click="openBrowser(0)" type="md-help" />
      <Row class="row-line">
        <Col span="12">
          <Input v-model="imagestyle" size="small" placeholder="七牛图片样式" style="width: 100%" />
        </Col>
        <Col span="11" offset="1">
          <Button @click="saveImagestyle" size="small" class="save-btn">保存</Button>
        </Col>
      </Row>
    </div>

    <div class="item" v-feature:manualPrivateBucket>
      私有空间：
      <Icon class="help" @click="openBrowser(1)" type="md-help" />
      <CheckboxGroup v-model="privates" @on-change="privatesChange">
        <Checkbox v-for="(item, index) in buckets_info" :key="index" :label="item.name">
          <span style="margin-left: 5px">{{ item.name }}</span>
        </Checkbox>
      </CheckboxGroup>
      <Row class="row-line">
        <Col span="12">
          <Input v-model="deadline" size="small" placeholder="过期时间,单位分钟" style="width: 20%; margin-right: 10px" />
          分钟
        </Col>
        <Col span="11" offset="1">
          <Button @click="saveDeadline" size="small" class="save-btn">保存</Button>
        </Col>
      </Row>
    </div>
  </div>
</template>

<script>
import { mapActions, mapState } from 'pinia'
import { useAppStore } from '@/stores/app'
import { useSetupStore } from '@/stores/setup'
import * as types from '../stores/mutation-types'

import { Constants, EventBus } from '../service'
import * as utilMain from '../../main/util/util'
import brands from '@/cos/brand'

export default {
  name: 'setup-page',
  data() {
    return {
      rowSpan: 8,
      tray: {},
      imagestyle: '',
      downloaddir: '',
      deadline: 0,
      privates: [],
      theme: '',
      brands: brands,
      isShowMenuBarItem: utilMain.isWin() || utilMain.isLinux(),
    }
  },
  computed: {
    ...mapState(useAppStore, [types.app.buckets_info]),
    ...mapState(useSetupStore, {
      setup: state => {
        return state.setup
      },
    }),
  },
  components: {},
  created: function () {
    this.tray = JSON.parse(JSON.stringify(this.setup.tray))
    this.imagestyle = this.setup.imagestyle
    this.downloaddir = this.setup.downloaddir
    this.privates = this.setup.privatebucket
    this.theme = this.setup.theme
    this.deadline = this.setup.deadline / 60

    this.$electron.ipcRenderer.on(Constants.Listener.choiceDownloadFolder, (event, path) => {
      this.downloaddir = path[0]
      this.saveDownloadolder()
    })
  },
  methods: {
    ...mapActions(useAppStore, [types.app.update_buckets_info]),
    ...mapActions(useSetupStore, [types.setup.setup_update]),
    pagingChange: function (payload) {
      this[types.setup.setup_update]('paging', payload)
      this.$storage.cos.paging = payload
    },
    httpsChange: function (payload) {
      this[types.setup.setup_update]('https', payload)
      this.$storage.cos.https = payload
    },
    hiddenDelBtnChange: function (payload) {
      this[types.setup.setup_update]('hiddenDelBtn', payload)
    },
    deleteNoAskChange: function (payload) {
      this[types.setup.setup_update]('deleteNoAsk', payload)
    },
    uploadNoAskChange: function (payload) {
      this[types.setup.setup_update]('uploadNoAsk', payload)
    },
    isOverwriteChange: function (payload) {
      this[types.setup.setup_update]('isOverwrite', payload)
    },
    copyTypeChange: function (payload) {
      this[types.setup.setup_update]('copyType', payload)
    },
    privatesChange: function (privatebucket) {
      this.buckets_info.forEach(item => {
        let permission = privatebucket.indexOf(item.name) !== -1 ? 1 : 0
        this[types.app.update_buckets_info]({ name: item.name, permission: permission })
      })
      this[types.setup.setup_update]('privatebucket', privatebucket)
      EventBus.$emit(Constants.Event.changePrivate, privatebucket)
    },
    themesChange(payload) {
      EventBus.$emit(Constants.Event.changeTheme, payload)
      this[types.setup.setup_update]('theme', payload)
    },
    saveTray: function () {
      this[types.setup.tray]('theme', {
        uuid: this.$storage.info.uuid,
        brand: this.$storage.info.key,
        bucket_name: this.tray.bucket_name,
        bucket_dir: this.tray.bucket_dir,
      })
      this.$Message.success('托盘设置修改成功，重启应用后生效')
    },
    saveImagestyle: function () {
      this[types.setup.setup_update]('imagestyle', this.imagestyle)
      this.$Message.success('图片样式修改成功')
    },
    saveDeadline: function () {
      if (isNaN(this.deadline)) {
        this.$Message.error('请检查过期时间值格式是否正确')
      } else {
        this[types.setup.setup_update]('deadline', this.deadline * 60)
        this.$Message.success('私有空间过期时间已修改为' + this.deadline + '分钟')
      }
    },
    choiceDownloadolder() {
      this.$electron.ipcRenderer.send(Constants.Listener.choiceDownloadFolder, { properties: ['openDirectory'] })
    },
    saveDownloadolder() {
      this[types.setup.setup_update]('downloaddir', this.downloaddir)
      this.$Message.success('下载路径修改成功')
    },
    openBrowser(index) {
      let url
      switch (index) {
        case 0: //图片样式
          url = 'https://developer.qiniu.com/dora/manual/1279/basic-processing-images-imageview2'
          break
        case 1: //私有资源下载
          url = 'https://developer.qiniu.com/kodo/manual/1656/download-private'
          break
        case 2: //数据加载方式
          url = 'https://github.com/willnewii/qiniuClient/wiki/%E6%95%B0%E6%8D%AE%E5%8A%A0%E8%BD%BD%E6%96%B9%E5%BC%8F'
          break
      }
      this.$electron.shell.openExternal(url)
    },
    showMenuBarChange: function (payload) {
      this.$electron.ipcRenderer.send(Constants.Listener.showMenuBar, payload)
      this[types.setup.setup_update]('showMenuBar', payload)
    },
  },
}
</script>

<style lang="scss" scoped>
@import '../style/params';

.page {
  background-color: var(--bg-resource);
  height: 100%;
  padding: 30px;
  overflow-y: scroll;

  .title {
    font-size: 14px;
    padding: 15px 0;
    border-bottom: 1px solid #e0e0e0;

    .title-tips {
      margin-left: 10px;
      font-size: 12px;
      font-weight: normal;
    }
  }

  .title:nth-child(1) {
    padding-top: 0px;
  }

  .row {
    padding: 15px 0;
  }
  .item {
    padding: 15px 0;

    & > .item-title {
      width: 200px;
      display: inline-block;

      &:after {
        content: '：';
      }
    }
  }
}

.help {
  margin-left: 10px;
  border: 1px var(--fontColor) solid;
  border-radius: 50%;
  padding: 5px;
  transform: scale(0.7);
}

.row-line {
  padding-top: 20px;
}

.save-btn {
  background: #ffffff;
}
</style>
