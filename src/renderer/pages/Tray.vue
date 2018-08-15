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
    import {mapGetters, mapActions} from 'vuex';
    import * as types from '../vuex/mutation-types';
    import {util, Constants, storagePromise, mixins} from '../service';
    import storage from 'electron-json-storage';

    let ipc;

    export default {
        name: 'tray-page',
        mixins: [mixins.base],
        data() {
            return {
                domains: [],
                files: [],
                logs: [],
                current: 1,
                config: {}
            };
        },
        computed: {
            ...mapGetters({
                bucket_name: types.setup.setup_bucket_name
            })
        },
        async created() {
            document.getElementById('title') && document.getElementById('title').remove();

            let app = await storagePromise.get(Constants.Key.configuration);
            if (app && app.bucket_name) {
                this.$storage.setName('qiniu');
                this.$storage.initCOS((result) => {
                    if (result) {
                        this.doRequsetGet(this.$storage.cos.methods.domains, {tbl: app.bucket_name}, (response) => {
                            this.domains = response.data;
                        });
                    } else {
                        console.log('key 注册失败');
                    }
                });
            } else {
                console.error('未设置bucket_name');
            }

            ipc = this.$electron.ipcRenderer;
            ipc.removeAllListeners(Constants.Listener.uploadFile);
            ipc.on(Constants.Listener.uploadFile, (event, files) => {
                this.files = files;
                storage.get(Constants.Key.configuration, (error, app) => {
                    if (app && app.bucket_name) {
                        this.config = app;
                        this.doUploadFile();
                    } else {
                        ipc.send(Constants.Listener.showNotifier, {
                            title: 'qiniu-client',
                            message: '请先设置上传空间',
                        });
                        this.updateStatus('');
                    }
                });
            });
        },
        methods: {
            ...mapActions([
                types.setup.setup_init,
            ]),
            updateStatus(title) {
                console.log('title:', title);
                ipc.send(Constants.Listener.updateTrayTitle, title);
            },
            sendNotify() {
                ipc.send(Constants.Listener.showNotifier, {
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
                let key = (this.config.bucket_dir ? this.config.bucket_dir + '/' : '') + util.getName(filePath);

                let log = {
                    path: filePath,
                    key: key
                };
                try {
                    this.$storage.cos.upload({
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
                let url = this.$storage.cos.generateUrl(this.domains[0], key);
                this.$electron.shell.openExternal(url);
            },
            copy(key) {
                let url = this.$storage.cos.generateUrl(this.domains[0], key);
                util.setClipboardText(this, this.config.copyType, url);
            },
            openInFolder(path) {
                this.$electron.shell.showItemInFolder(path);
            },
            isImg(file) {
                return new RegExp(/\.(png|jpe?g|gif|svg)(\?.*)?$/).test(file);
            }
        }
    };
</script>

