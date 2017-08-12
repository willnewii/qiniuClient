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
            border-bottom: 1px #CCC solid;
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
            <Menu-item name="1">
                上传记录
            </Menu-item>
        </Menu>
        <div class="list">
            <div class='item' v-for="item of logs">
                <img v-if="isImg(item.key)" class='image' :src="'http://' + domains[0]+'/'+item.key" alt="">
                <div v-if="item.code == 0">
                    <div>{{item.key}}</div>
                    <div>
                        <i-button class='btn' type="primary" size="small" @click="show(item.key)">查看</i-button>
                        <i-button class='btn' type="primary" size="small" @click="copy(item.key)">复制路径</i-button>
                        <i-button class='btn' type="primary" size="small" @click="openInFolder(item.path)">源文件
                        </i-button>
                    </div>
                </div>
                <div v-else>
                    {{item.error}}
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import {mapGetters, mapActions} from 'vuex'
    import * as types from '../vuex/mutation-types'
    import * as util from '../util/util'
    import * as cloudStorage from '../service/cloudStorage'
    import storage from 'electron-json-storage'
    import api from '../api/API'

    let API, ipc;

    export default {
        name: 'tray-page',
        data() {
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
        created() {
            document.getElementById('title').remove();

            this[types.APP.app_a_setup_init]();
            ipc = this.$electron.ipcRenderer;

            API = new api(this);

            let that = this;
            storage.get(types.APP.qiniu_key, (error, data) => {
                if (!error) {
                    if (data.access_key && data.secret_key) {
                        cloudStorage.init({access_key: data.access_key, secret_key: data.secret_key});

                        API.get(API.method.getDomains, {tbl: this.bucket_name}).then((response) => {
                            that.domains = response.data;
                        });
                    } else {
                    }
                }
            });

            ipc.on('upload-Files', (event, files) => {
                this.files = files;

                storage.get('app_setup', (error, app) => {

                    if(!app.bucket_name || !app.bucket_dir){
                        ipc.send('show-Notifier', {
                            title: 'qiniu-client',
                            message: '请先设置上传空间',
                        });
                        this.updateStatus('');
                        return ;
                    }

                    if (!error) {
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
            updateStatus(title) {
                console.log('title:', title);
                ipc.send('upload-tray-title', title);
            },
            sendNotify() {
                ipc.send('show-Notifier', {
                    title: '上传完成',
                    message: '上传完成  (＾－＾)V',
                    icon: 'notify-success.png'
                });
            },
            doUploadFile() {
                if (this.current > this.files.length) {
                    this.updateStatus('');
                    this.current = 1;
                    this.sendNotify();
                } else {
                    this.uploadFile(this.files[this.current - 1]);
                }
            },
            uploadFile(filePath) {
                let key = this.config.bucket_dir + '/' + util.getName(filePath);

                let log = {
                    path: filePath,
                    key: key
                };
                try {
                    cloudStorage.upload({
                        bucket: this.config.bucket_name,
                        key: key,
                        path: filePath,
                        progressCallback: (progress) => {
                            if (progress !== 100) {
                                this.updateStatus(`(${progress}%)${this.current}/${this.files.length}`);
                            }
                        }
                    }, (err, ret) => {
                        this.handleResult(log, err);
                    });
                } catch (err) {
                    this.handleResult(log, err);
                }
            },
            handleResult(log, err) {
                if (!err) {//ret.key
                    log.code = 0;
                } else {
                    log.code = err.status;
                    log.error = err.error;
                }

                this.logs.unshift(log);
                this.current = this.current + 1;
                this.doUploadFile();
            },
            show(key) {
                let url = util.getQiniuUrl(this.domains[0], key);
                this.$electron.shell.openExternal(url);
            },
            copy(key) {
                let url = util.getQiniuUrl(this.domains[0], key);
                util.setClipboardText(this, this.config.copyType, url);
            },
            openInFolder(path) {
                this.$electron.shell.showItemInFolder(path);
            },
            isImg(file) {
                return new RegExp(/\.(png|jpe?g|gif|svg)(\?.*)?$/).test(file);
            }
        }
    }
</script>

