<style lang="scss" scoped>
    .ivu-menu-horizontal {
        height: 40px;
        line-height: 40px;
    }

    .list {
        height: 260px;
        overflow: scroll;
        .item {
            padding: 10px;
            border-bottom: 1px #CCC solid;
            .image {
                width: 50px;
                height: 50px;
            }
        }
    }

</style>
<template>
    <div>
        <Menu mode="horizontal" active-name="1">
            <Menu-item name="1">
                上传记录
            </Menu-item>
        </Menu>
        <div class="list">
            <div class='item' v-for="item of logs">
                <img class='image' :src="'http://' + domains[0]+'/'+item.key" alt="">
                <i-button type="primary" size="small" @click="open(item.key)">查看</i-button>
                <i-button type="primary" size="small" @click="copy(item.key)">复制路径</i-button>
                <i-button type="primary" size="small" @click="openInFolder(item.path)">源文件</i-button>
            </div>
        </div>

    </div>
</template>

<script>
    import {mapGetters, mapActions} from 'vuex'
    import * as types from '../vuex/mutation-types'
    import * as util from '../util/util'
    import qiniu from 'qiniu'
    import storage from 'electron-json-storage'
    import api from '../api/API'
    let API, ipc;

    export default {
        name: 'tray-page',
        data(){
            return {
                domains: [],
                files: [],
                logs: [],
                current: 1,
                config: {}
            }
        },
        computed: {
            ...mapGetters({
                bucket_name: types.APP.setup_bucket_name,
                bucket_dir: types.APP.setup_bucket_dir,
                setup_copyType: types.APP.setup_copyType,
            })
        },
        created(){
            this[types.APP.app_a_setup_init]();
            ipc = this.$electron.ipcRenderer;

            API = new api(this);

            let that = this;
            storage.get(types.APP.qiniu_key, (error, data) => {
                if (!error) {
                    if (data.access_key && data.secret_key) {
                        qiniu.conf.ACCESS_KEY = data.access_key;
                        qiniu.conf.SECRET_KEY = data.secret_key;

                        API.get(API.method.getDomains, {tbl: this.bucket_name}).then((response) => {
                            that.domains = response.data;
                        });
                    } else {
                    }
                }
            });

            ipc.on('upload-Files', (event, files) => {
                console.log(files);
                this.files = files;

                storage.get('app_setup', (error, app) => {
                    if (!error) {
                        console.log(app);
                        this.config = app;
                        this.doUploadFile();
                    }
                });
            });

            ipc.on('log', (event, log) => {
                console.log(log);
            })
        },
        methods: {
            ...mapActions([
                types.APP.app_a_setup_init,
            ]),
            updateStatus(title){
                ipc.send('upload-tray-title', title);
            },
            sendNotify(){
                ipc.send('show-Notifier', {
                    title: 'qiniu-client',
                    message: '上传完成  (＾－＾)V',
                    icon: 'notify-success.png'
                });
            },
            doUploadFile(){
                if (this.current > this.files.length) {
                    this.updateStatus('');
                    this.current = 1;
                    this.sendNotify();
                } else {
                    this.updateStatus(`${this.current}/${this.files.length}`);
                    this.uploadFile(this.files[this.current - 1]);
                }
            },
            uploadFile(filePath){
                let key = this.config.bucket_dir + '/' + util.getName(filePath);
                let uptoken = new qiniu.rs.PutPolicy(this.config.bucket_name + ":" + key).token();
                let extra = new qiniu.io.PutExtra();

                let log = {
                    path: filePath,
                    key: key
                };
                try {
                    qiniu.io.putFile(uptoken, key, filePath, extra, (err, ret, res) => {
                        this.handleResult(log, err);
                    });
                } catch (err) {
                    this.handleResult(log, err);
                }
            },
            handleResult(log, err){
                window.error = err;
                if (!err) {//ret.key
                    log.code = 0;
                } else {
                    console.log(err);
                    log.code = err.statusCode;
                    log.error = err.body;
                }
                this.logs.unshift(log);
                this.current = this.current + 1;
                this.doUploadFile();
            },
            show(key){
                let url = util.getQiniuUrl(this.domains[0], key);
                this.$electron.shell.openExternal(url);
            },
            copy(key){
                let url = util.getQiniuUrl(this.domains[0], key);
                util.setClipboardText(this, this.config.setup_copyType, url);
            },
            openInFolder(path){
                this.$electron.shell.showItemInFolder(path);
            }
        }
    }
</script>

