<style scoped>
    .title {
        padding: 10px 0;
        font-size: 16px;
    }

    .item {
        padding: 30px 0 0 30px;
    }

    .bucketdir {
        width: 200px;
        margin-right: 20px;
    }
</style>
<template>
    <div>
        <div class="item">
            直接删除,不需要确认：
            <i-switch v-model="setup_deleteNoAsk" size="small" @on-change="deleteNoAskChange"></i-switch>
        </div>
        <div class="item">
            默认复制格式：
            <Radio-group v-model="setup_copyType" @on-change="copyTypeChange">
                <Radio label="url"></Radio>
                <Radio label="markdown"></Radio>
            </Radio-group>
        </div>
        <div class="item">
            默认托盘上传位置：<br>
            <Select v-model="bucketname" size="small" style="width:100px" placeholder="空间名称">
                <Option v-for="item in buckets" :value="item" :key="item">{{ item }}</Option>
            </Select>
            /
            <Input class='bucketdir' v-model="bucketdir" size="small" placeholder="路径"></Input>
            <Button @click="saveDir" size="small">保存</Button>
            <br>提示：默认文件将会被上传到 {{setup_bucket_name}}/{{setup_bucket_dir}}/ 目录下
        </div>

        <div class="item">
            下载目录：<br>
            <Input class='bucketdir' v-model="downloaddir" size="small" placeholder="默认下载目录" style="width: 40%;"
                   disabled></Input>
            <Button @click="choiceDownloadolder" size="small" icon="ios-folder-outline"></Button>
        </div>

        <div class="item">
            预览图片样式：<br>
            <Input class='bucketdir' v-model="imagestyle" size="small" placeholder="七牛图片样式" style="width: 40%;"></Input>
            <Button @click="saveImagestyle" size="small">保存</Button>
            <Button @click="openBrowser" size="small">关于图片样式</Button>
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
                downloaddir: ''
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
                setup_downloaddir: types.APP.setup_downloaddir
            })
        },
        components: {ClientHeader},
        created: function () {
            this.bucketname = this.setup_bucket_name;
            this.bucketdir = this.setup_bucket_dir;
            this.imagestyle = this.setup_imagestyle;
            this.downloaddir = this.setup_downloaddir;

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
            ]),
            deleteNoAskChange: function (state) {
                this[types.APP.setup_a_deleteNoAsk](state);
            },
            copyTypeChange: function (model) {
                this[types.APP.setup_a_copyType](model);
            },
            saveDir: function () {
                this[types.APP.setup_a_savedir]([this.bucketname, this.bucketdir]);
                this.$Message.success('默认托盘路径修改成功');
            },
            saveImagestyle: function () {
                this[types.APP.setup_a_imagestyle]([this.imagestyle]);
                this.$Message.success('图片样式修改成功');
            },
            choiceDownloadolder() {
                ipc.send('choiceFolder', {properties: ['openDirectory']});
            },
            saveDownloadolder() {
                this[types.APP.setup_a_downloaddir](this.downloaddir);
            },
            openBrowser() {
                this.$electron.shell.openExternal('https://developer.qiniu.com/dora/manual/1279/basic-processing-images-imageview2');
            }
        }
    }
</script>

