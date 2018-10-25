<style scoped>
    .item {
        padding: 30px 0 0 30px;
    }

    .row-line {
        padding-top: 10px;
    }

    .save-btn {
        background: #FFFFFF;
    }

</style>
<template>
    <div>
        <div class="item">
            直接删除,不需要确认：
            <i-switch :value="setup_deleteNoAsk" size="small" @on-change="deleteNoAskChange"></i-switch>
        </div>
        <div class="item">
            如果文件已存在,是否覆盖上传：
            <i-switch :value="setup_isOverwrite" size="small" @on-change="isOverwriteChange"></i-switch>
        </div>
        <div class="item">
            复制到粘贴板格式：
            <Radio-group :value="setup_copyType" @on-change="copyTypeChange">
                <Radio label="url"></Radio>
                <Radio label="markdown"></Radio>
            </Radio-group>
        </div>
        <div class="item">
            托盘上传位置：<br>
            <Row class="row-line">
                <Col span="12">
                    <!-- <Select v-model="brand" size="small" style="width:20%" placeholder="服务商">
                         <Option :value="brands.qiniu.key">{{ brands.qiniu.name }}</Option>
                         <Option :value="brands.tencent.key">{{ brands.tencent.name }}</Option>
                     </Select>-->
                    <Select v-model="bucketname" size="small" style="width:30%" placeholder="空间名称">
                        <Option v-for="item in buckets" :value="item" :key="item">{{ item }}</Option>
                    </Select>
                    /
                    <Input v-model="bucketdir" size="small" style="width:66%" placeholder="路径"/>
                </Col>
                <Col span="10" offset="1">
                    <Button @click="saveDir" size="small" class="save-btn">保存</Button>
                </Col>
            </Row>

            <div v-if="setup_bucket_name">提示：文件将会被上传至
                {{brands[brand].name}}：{{setup_bucket_name}}/{{setup_bucket_dir ? setup_bucket_dir + '/' : ''}}
                目录下
            </div>
        </div>

        <div class="item">
            下载目录：<br>
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

        <div class="item">
            私有空间：
            <Button @click="openBrowser(1)" size="small">什么是私有空间?</Button>
            <br>
            <CheckboxGroup v-model="privates" @on-change="privatesChange">
                <Checkbox v-for="item,index in buckets" :key="index" :label="item">
                    <span>{{item}}</span>
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
        <div class="item">
            主题：
            <br>
            <Radio-group :value="theme" @on-change="themesChange">
                <Radio label="auto">自动</Radio>
                <Radio label="light"></Radio>
                <Radio label="dark"></Radio>
            </Radio-group>
        </div>
    </div>
</template>

<script>
    import {mapGetters, mapActions} from 'vuex';
    import {Constants, util} from '../service';
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
                brands: brands
            };
        },
        computed: {
            ...mapGetters({
                buckets: types.app.buckets,
                setup_copyType: types.setup.setup_copyType,
                setup_deleteNoAsk: types.setup.setup_deleteNoAsk,
                setup_isOverwrite: types.setup.setup_isOverwrite,
                setup_brand: types.setup.setup_brand,
                setup_bucket_name: types.setup.setup_bucket_name,
                setup_bucket_dir: types.setup.setup_bucket_dir,
                setup_imagestyle: types.setup.setup_imagestyle,
                setup_downloaddir: types.setup.setup_downloaddir,
                setup_privatebucket: types.setup.setup_privatebucket,
                setup_theme: types.setup.setup_theme,
                setup_deadline: types.setup.setup_deadline
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

            console.log(this.brand);

            this.$electron.ipcRenderer.on(Constants.Listener.choiceDownloadFolder, (event, path) => {
                this.downloaddir = path[0];
                this.saveDownloadolder();
            });

            this.$electron.ipcRenderer.on(Constants.Listener.darkMode, (event, arg) => {
                util.loadTheme(arg ? 'dark' : 'light');
                this[types.setup.setup_a_theme]('auto');
            });
        },
        methods: {
            ...mapActions([
                types.setup.setup_a_copyType,
                types.setup.setup_a_deleteNoAsk,
                types.setup.setup_a_savedir,
                types.setup.setup_a_imagestyle,
                types.setup.setup_a_downloaddir,
                types.setup.setup_a_privatebucket,
                types.setup.setup_a_deadline,
                types.setup.setup_a_isOverwrite,
                types.setup.setup_a_theme,
            ]),
            deleteNoAskChange: function (state) {
                this[types.setup.setup_a_deleteNoAsk](state);
            },
            isOverwriteChange: function (state) {
                this[types.setup.setup_a_isOverwrite](state);
            },
            copyTypeChange: function (model) {
                this[types.setup.setup_a_copyType](model);
            },
            privatesChange: function (privatebucket) {
                this[types.setup.setup_a_privatebucket](privatebucket);
            },
            themesChange(item) {
                if (item === 'auto') {
                    this.$electron.ipcRenderer.send(Constants.Listener.darkMode);
                } else {
                    util.loadTheme(item);
                    this[types.setup.setup_a_theme](item);
                }
            },
            saveDir: function () {
                this.$electron.ipcRenderer.send(Constants.Listener.setBrand, {
                    key: this.$storage.name
                });
                this.brand = this.$storage.name;
                this[types.setup.setup_a_savedir]([this.bucketname, this.bucketdir, this.$storage.name]);
                this.$Message.success('托盘保存路径修改成功');
            },
            saveImagestyle: function () {
                this[types.setup.setup_a_imagestyle]([this.imagestyle]);
                this.$Message.success('图片样式修改成功');
            },
            saveDeadline: function () {
                if (isNaN(this.deadline)) {
                    this.$Message.error('请检查过期时间值格式是否正确');
                } else {
                    this[types.setup.setup_a_deadline](this.deadline * 60);
                    this.$Message.success('私有空间过期时间已修改为' + this.deadline + '分钟');
                }
            },
            choiceDownloadolder() {
                this.$electron.ipcRenderer.send(Constants.Listener.choiceDownloadFolder, {properties: ['openDirectory']});
            },
            saveDownloadolder() {
                this[types.setup.setup_a_downloaddir](this.downloaddir);
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
                }
                this.$electron.shell.openExternal(url);
            }
        }
    };
</script>

