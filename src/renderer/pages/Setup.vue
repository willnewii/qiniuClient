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
            <i-switch v-model="setup_deleteNoAsk" size="small" @on-change="deleteNoAskChange"></i-switch>
        </div>
        <div class="item">
            复制到粘贴板格式：
            <Radio-group v-model="setup_copyType" @on-change="copyTypeChange">
                <Radio label="url"></Radio>
                <Radio label="markdown"></Radio>
            </Radio-group>
        </div>
        <div class="item">
            默认托盘上传位置：<br>
            <Row class="row-line">
                <Col span="10">
                <Select v-model="bucketname" size="small" style="width:30%" placeholder="空间名称">
                    <Option v-for="item in buckets" :value="item" :key="item">{{ item }}</Option>
                </Select>
                /
                <Input v-model="bucketdir" size="small" style="width:66%" placeholder="路径"/>
                </Col>
                <Col span="10" offset="1">
                <Button @click="saveDir" type="ghost" size="small" class="save-btn">保存</Button>
                </Col>
            </Row>
            <div v-if="setup_bucket_name">提示：默认文件将会被上传到 {{setup_bucket_name}}/{{setup_bucket_dir}}/ 目录下</div>
        </div>

        <div class="item">
            下载目录：<br>
            <Row class="row-line">
                <Col span="10">
                <Input v-model="downloaddir" size="small" placeholder="默认下载目录" style="width: 100%;"
                       disabled/>
                </Col>
                <Col span="12" offset="1">
                <Button @click="choiceDownloadolder" type="ghost" size="small" class="save-btn"
                        icon="ios-folder-outline"/>
                </Col>
            </Row>

        </div>

        <div class="item">
            预览图片样式：<br>
            <Row class="row-line">
                <Col span="10">
                <Input v-model="imagestyle" size="small" placeholder="七牛图片样式" style="width: 100%;"/>
                </Col>
                <Col span="12" offset="1">
                <Button @click="saveImagestyle" type="ghost" size="small" class="save-btn">保存</Button>
                <Button @click="openBrowser(0)" size="small">什么是图片样式</Button>
                </Col>
            </Row>
        </div>

        <div class="item">
            私有空间：
            <Button @click="openBrowser(1)" size="small">什么是私有空间</Button>
            <br>
            <CheckboxGroup v-model="privates" @on-change="privatesChange">
                <Checkbox v-for="item,index in buckets" :key="index" :label="item">
                    <span>{{item}}</span>
                </Checkbox>
            </CheckboxGroup>
            <Row class="row-line">
                <Col span="10" style="display: flex;align-items: center;">
                <Input v-model="deadline" size="small" placeholder="过期时间,单位分钟" style="width: 20%; margin-right: 10px"/>分钟
                </Col>
                <Col span="12" offset="1">
                <Button @click="saveDeadline" type="ghost" size="small" class="save-btn">保存</Button>
                </Col>
            </Row>
        </div>
    </div>
</template>

<script>
    import ClientHeader from '../components/Main/ClientHeader.vue'
    import {mapGetters, mapActions} from 'vuex'
    import * as types from '../vuex/mutation-types'

    let ipc;

    export default {
        name: 'setup-page',
        data() {
            return {
                bucketname: '',
                bucketdir: '',
                imagestyle: '',
                downloaddir: '',
                deadline: 0,
                privates: []
            }
        },
        computed: {
            ...mapGetters({
                buckets: types.APP.app_buckets,
                setup_copyType: types.APP.setup_copyType,
                setup_deleteNoAsk: types.APP.setup_deleteNoAsk,
                setup_bucket_name: types.APP.setup_bucket_name,
                setup_bucket_dir: types.APP.setup_bucket_dir,
                setup_imagestyle: types.APP.setup_imagestyle,
                setup_downloaddir: types.APP.setup_downloaddir,
                setup_privatebucket: types.APP.setup_privatebucket,
                setup_deadline: types.APP.setup_deadline
            })
        },
        components: {ClientHeader},
        created: function () {
            this.bucketname = this.setup_bucket_name;
            this.bucketdir = this.setup_bucket_dir;
            this.imagestyle = this.setup_imagestyle;
            this.downloaddir = this.setup_downloaddir;
            this.privates = this.setup_privatebucket;
            this.deadline = this.setup_deadline / 60;

            ipc = this.$electron.ipcRenderer;
            ipc.on('choiceFolder', (event, path) => {
                this.downloaddir = path[0];
                this.saveDownloadolder();
            });
        },
        methods: {
            ...mapActions([
                types.APP.setup_a_copyType,
                types.APP.setup_a_deleteNoAsk,
                types.APP.setup_a_savedir,
                types.APP.setup_a_imagestyle,
                types.APP.setup_a_downloaddir,
                types.APP.setup_a_privatebucket,
                types.APP.setup_a_deadline,
            ]),
            deleteNoAskChange: function (state) {
                this[types.APP.setup_a_deleteNoAsk](state);
            },
            copyTypeChange: function (model) {
                this[types.APP.setup_a_copyType](model);
            },
            privatesChange: function (privatebucket) {
                this[types.APP.setup_a_privatebucket](privatebucket);
            },
            saveDir: function () {
                this[types.APP.setup_a_savedir]([this.bucketname, this.bucketdir]);
                this.$Message.success('默认托盘路径修改成功');
            },
            saveImagestyle: function () {
                this[types.APP.setup_a_imagestyle]([this.imagestyle]);
                this.$Message.success('图片样式修改成功');
            },
            saveDeadline: function () {
                if (isNaN(this.deadline)) {
                    this.$Message.error('请检查过期时间值格式是否正确');
                } else {
                    this[types.APP.setup_a_deadline](this.deadline * 60);
                    this.$Message.success('私有空间过期时间已修改为' + this.deadline + '分钟');
                }
            },
            choiceDownloadolder() {
                ipc.send('choiceFolder', {properties: ['openDirectory']});
            },
            saveDownloadolder() {
                this[types.APP.setup_a_downloaddir](this.downloaddir);
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
    }
</script>

