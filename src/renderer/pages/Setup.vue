<template>
    <div class="page">
        <h4 class="title">全局设置</h4>
        <!-- <div class="item" v-if="isShowMenuBarItem">
            <span class="item-title">隐藏菜单栏</span>
            <i-switch :value="setup_showMenuBar" size="small" @on-change="showMenuBarChange"></i-switch>
        </div> -->
        <div class="item">
            <span class="item-title">开启Https</span>
            <i-switch :value="setup_https" size="small" @on-change="httpsChange"></i-switch>
        </div>
        <div class="item">
            <span class="item-title">开启分页</span>
            <i-switch :value="setup_paging" size="small" @on-change="pagingChange"></i-switch>
            <Button @click="openBrowser(2)" size="small">关于数据加载方式</Button>
        </div>
        <div class="item">
            <span class="item-title">直接删除,不显示确认框</span>
            <i-switch :value="setup_deleteNoAsk" size="small" @on-change="deleteNoAskChange"></i-switch>
        </div>
        <div class="item">
            <span class="item-title">直接上传,不显示确认框</span>
            <i-switch :value="setup_uploadNoAsk" size="small" @on-change="uploadNoAskChange"></i-switch>
        </div>

        <div class="item">
            <span class="item-title">如果文件已存在,是否覆盖上传</span>
            <i-switch :value="setup_isOverwrite" size="small" @on-change="isOverwriteChange"></i-switch>
        </div>
        <div class="item">
            <span class="item-title">复制到粘贴板格式</span>
            <Radio-group :value="setup_copyType" @on-change="copyTypeChange">
                <Radio label="url"></Radio>
                <Radio label="markdown"></Radio>
            </Radio-group>
        </div>
        <div class="item">
            <span class="item-title">主题</span>
            <Radio-group :value="theme" @on-change="themesChange">
                <Radio label="auto">自动</Radio>
                <Radio label="light"></Radio>
                <Radio label="dark"></Radio>
            </Radio-group>
        </div>

        <h4 class="title">托盘设置<span class="title-tips" v-if="setup_bucket_name">(文件将会被上传至{{brands[brand] && brands[brand].name}}：{{setup_bucket_name}}/{{setup_bucket_dir ? setup_bucket_dir +
                '/' : ''}}目录下)</span></h4>
        <div class="item">
            <Row class="row-line">
                <Col span="12">
                    <Select v-model="bucketname" size="small" style="width:30%" placeholder="空间名称">
                        <Option v-for="item in buckets_info" :value="item.name" :key="item.name">{{ item.name }}
                        </Option>
                    </Select>
                    /
                    <Input v-model="bucketdir" size="small" style="width:66%" placeholder="路径"/>
                </Col>
                <Col span="10" offset="1">
                    <Button @click="saveDir" size="small" class="save-btn">保存</Button>
                </Col>
            </Row>
        </div>

        <div class="item">
            <span class="item-title">下载目录</span>
            <Row class="row-line">
                <Col span="12">
                    <Input v-model="downloaddir" size="small" placeholder="默认download目录" style="width: 100%;"
                           disabled/>
                </Col>
                <Col span="11" offset="1">
                    <Button @click="choiceDownloadolder" size="small" class="save-btn"
                            icon="ios-folder-outline"/>
                </Col>
            </Row>

        </div>

        <template v-if="brands.qiniu.key === $storage.key">
            <div class="item">
                预览图片样式：
                <Button @click="openBrowser(0)" size="small">什么是图片样式?</Button>
                <br>
                <Row class="row-line">
                    <Col span="12">
                        <Input v-model="imagestyle" size="small" placeholder="七牛图片样式" style="width: 100%;"/>
                    </Col>
                    <Col span="11" offset="1">
                        <Button @click="saveImagestyle" size="small" class="save-btn">保存</Button>
                    </Col>
                </Row>
            </div>
        </template>
        <template
                v-if="brands.qiniu.key === $storage.key || brands.aws.key === $storage.key || brands.jd.key === $storage.key || brands.minio.key === $storage.key">
            <div class="item">
                私有空间：
                <Button @click="openBrowser(1)" size="small">什么是私有空间?</Button>
                <br>
                <CheckboxGroup v-model="privates" @on-change="privatesChange">
                    <Checkbox v-for="item,index in buckets_info" :key="index" :label="item.name">
                        <span>{{item.name}}</span>
                    </Checkbox>
                </CheckboxGroup>
                <Row class="row-line">
                    <Col span="12">
                        <Input v-model="deadline" size="small" placeholder="过期时间,单位分钟"
                               style="width: 20%; margin-right: 10px"/>分钟
                    </Col>
                    <Col span="11" offset="1">
                        <Button @click="saveDeadline" size="small" class="save-btn">保存</Button>
                    </Col>
                </Row>
            </div>
        </template>
    </div>
</template>

<script>
    import {mapGetters, mapActions} from 'vuex';
    import {Constants, util, EventBus} from '../service';
    import * as utilMain from '../../main/util';
    import * as types from '../vuex/mutation-types';
    import brands from '@/cos/brand';

    export default {
        name: 'setup-page',
        data() {
            return {
                brand: '',
                bucketname: '',
                bucketdir: '',
                imagestyle: '',
                downloaddir: '',
                deadline: 0,
                privates: [],
                theme: '',
                brands: brands,
                isShowMenuBarItem: utilMain.isWin() || utilMain.isLinux()
            };
        },
        computed: {
            ...mapGetters({
                buckets_info: types.app.buckets_info,
                setup_copyType: types.setup.copyType,
                setup_deleteNoAsk: types.setup.deleteNoAsk,
                setup_showMenuBar: types.setup.showMenuBar,
                setup_https: types.setup.https,
                setup_paging: types.setup.paging,
                setup_uploadNoAsk: types.setup.uploadNoAsk,
                setup_isOverwrite: types.setup.isOverwrite,
                setup_brand: types.setup.brand,
                setup_bucket_name: types.setup.bucket_name,
                setup_bucket_dir: types.setup.bucket_dir,
                setup_imagestyle: types.setup.imagestyle,
                setup_downloaddir: types.setup.downloaddir,
                setup_privatebucket: types.setup.privatebucket,
                setup_theme: types.setup.theme,
                setup_deadline: types.setup.deadline
            })
        },
        components: {},
        created: function () {
            this.brand = this.setup_brand;
            this.bucketname = this.setup_bucket_name;
            this.bucketdir = this.setup_bucket_dir;
            this.imagestyle = this.setup_imagestyle;
            this.downloaddir = this.setup_downloaddir;
            this.privates = this.setup_privatebucket;
            this.theme = this.setup_theme;
            this.deadline = this.setup_deadline / 60;

            this.$electron.ipcRenderer.on(Constants.Listener.choiceDownloadFolder, (event, path) => {
                this.downloaddir = path[0];
                this.saveDownloadolder();
            });

            this.$electron.ipcRenderer.on(Constants.Listener.darkMode, (event, arg) => {
                util.loadTheme(arg ? 'dark' : 'light');
                this[types.setup.a_theme]('auto');
            });
        },
        methods: {
            ...mapActions([
                types.app.a_update_buckets_info,
                types.setup.a_copyType,
                types.setup.a_https,
                types.setup.a_showMenuBar,
                types.setup.a_paging,
                types.setup.a_deleteNoAsk,
                types.setup.a_uploadNoAsk,
                types.setup.a_savedir,
                types.setup.a_imagestyle,
                types.setup.a_downloaddir,
                types.setup.a_privatebucket,
                types.setup.a_deadline,
                types.setup.a_isOverwrite,
                types.setup.a_theme,
            ]),
            pagingChange: function (state) {
                this[types.setup.a_paging](state);
            },
            showMenuBarChange: function (state) {
                this.$electron.ipcRenderer.send(Constants.Listener.showMenuBar, state);
                this[types.setup.a_showMenuBar](state);
            },
            httpsChange: function (state) {
                this[types.setup.a_https](state);
            },
            deleteNoAskChange: function (state) {
                this[types.setup.a_deleteNoAsk](state);
            },
            uploadNoAskChange: function (state) {
                this[types.setup.a_uploadNoAsk](state);
            },
            isOverwriteChange: function (state) {
                this[types.setup.a_isOverwrite](state);
            },
            copyTypeChange: function (model) {
                this[types.setup.a_copyType](model);
            },
            privatesChange: function (privatebucket) {
                this.buckets_info.forEach((item) => {
                    let permission = privatebucket.indexOf(item.name) !== -1 ? 1 : 0;
                    this[types.app.a_update_buckets_info]({name: item.name, permission: permission});
                });
                this[types.setup.a_privatebucket](privatebucket);
                EventBus.$emit(Constants.Event.changePrivate, privatebucket);
            },
            themesChange(item) {
                if (item === 'auto') {
                    this.$electron.ipcRenderer.send(Constants.Listener.darkMode);
                } else {
                    util.loadTheme(item);
                    this[types.setup.a_theme](item);
                }
            },
            saveDir: function () {
                this.$electron.ipcRenderer.send(Constants.Listener.setBrand, {
                    key: this.$storage.key
                });
                this.brand = this.$storage.key;
                this[types.setup.a_savedir]([this.bucketname, this.bucketdir, this.$storage.key]);
                this.$Message.success('托盘保存路径修改成功');
            },
            saveImagestyle: function () {
                this[types.setup.a_imagestyle]([this.imagestyle]);
                this.$Message.success('图片样式修改成功');
            },
            saveDeadline: function () {
                if (isNaN(this.deadline)) {
                    this.$Message.error('请检查过期时间值格式是否正确');
                } else {
                    this[types.setup.a_deadline](this.deadline * 60);
                    this.$Message.success('私有空间过期时间已修改为' + this.deadline + '分钟');
                }
            },
            choiceDownloadolder() {
                this.$electron.ipcRenderer.send(Constants.Listener.choiceDownloadFolder, {properties: ['openDirectory']});
            },
            saveDownloadolder() {
                this[types.setup.a_downloaddir](this.downloaddir);
                this.$Message.success('下载路径修改成功');
            },
            openBrowser(index) {
                let url;
                switch (index) {
                    case 0://图片样式
                        url = 'https://developer.qiniu.com/dora/manual/1279/basic-processing-images-imageview2';
                        break;
                    case 1://私有资源下载
                        url = 'https://developer.qiniu.com/kodo/manual/1656/download-private';
                        break;
                    case 2://数据加载方式
                        url = 'https://github.com/willnewii/qiniuClient/wiki/%E6%95%B0%E6%8D%AE%E5%8A%A0%E8%BD%BD%E6%96%B9%E5%BC%8F';
                        break;
                }
                this.$electron.shell.openExternal(url);
            }
        }
    };
</script>

<style lang="scss" scoped>
    @import '../style/params';

    .page {
        background-color: $bg-resource;
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


    .row-line {
        padding-top: 10px;
    }

    .save-btn {
        background: #FFFFFF;
    }

</style>
