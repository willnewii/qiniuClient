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
    import brand from "@/cos/brand";

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
            ipc = this.$electron.ipcRenderer;

            let app = await storagePromise.get(Constants.Key.configuration);
            if (app && app.brand && app.bucket_name) {
                this.$storage.setName(app.brand);
                this.$storage.initCOS((result) => {
                    if (result) {
                        ipc.send(Constants.Listener.setBrand, {
                            key: app.brand
                        });
                        this.doRequset(this.$storage.cos.methods.domains, {tbl: app.bucket_name}, (response) => {
                            this.domains = response.data;
                        });
                    } else {
                        console.log('key 注册失败');
                    }
                });
            } else {
                console.error('未设置托盘默认信息');
            }

            ipc.removeAllListeners(Constants.Listener.uploadFile);
            ipc.on(Constants.Listener.uploadFile, (event, files) => {
                storage.get(Constants.Key.configuration, (error, app) => {
                    if (app && app.brand && app.bucket_name) {
                        this.files = files;
                        this.config = app;
                        this.doUploadFile();
                    } else {
                        ipc.send(Constants.Listener.showNotifier, {
                            message: '请先设置上传空间[设置->托盘上传位置]',
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
                    message: '上传完成',
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
            uploadFile(item) {
                this.updateStatus(`${this.current}/${this.files.length}`);
                let key = '';
                key = (this.config.bucket_dir ? this.config.bucket_dir + '/' : '') + util.getFileNameWithFolder(item);
                let log = {
                    path: item.path,
                    key
                };
                try {
                    this.$storage.cos.upload({
                        bucket: this.config.bucket_name,
                        key,
                        path: item.path,
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
                util.getClipboardText(this.config.copyType, url);
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

