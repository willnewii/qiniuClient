<!--
三种上传方式
1.通过URL 2.选择文件 3.拖拽
-->
<template>
    <div>
        <Modal v-model="uploadModal.isShow" title="上传文件" @on-ok="preUploadFile"
               @on-cancel="initModal" class-name="upload-modal">

            <Input class='modal-url' v-if="uploadModal.type == 'fetch'" v-model="uploadModal.path"
                   placeholder="请输入你要上传的文件链接" @on-change="handleURLPath"
                   icon="trash-b" @on-click="uploadModal.path = '';filePaths=[]"/>

            <div class="modal-input">
                <!--<Select v-model="uploadModal.prepend" style="width: 100px">
                    <Option value="">无</Option>
                    <Option v-for="item of bucket.getDirArray()" :key="item" :value="item">{{item}}</Option>
                </Select>-->
                <Input v-model="uploadModal.input"/>
            </div>

            <div class="file-list">
                <div class="modal-filekey" v-for="_path of filePaths">
                    文件名:{{uploadModal.prepend}}{{uploadModal.input ? uploadModal.input + '/' : ''}}{{_path.key}}
                </div>
            </div>
        </Modal>
    </div>
</template>
<script>
    import {mapGetters} from 'vuex';
    import * as types from '../vuex/mutation-types';
    import {Constants, util, EventBus, mixins} from '../service/index';

    export default {
        name: 'UploadModal',
        mixins: [mixins.base, mixins.resource],
        props: {
            bucket: {
                type: Object
            }
        },
        data() {
            return {
                uploadModal: {
                    isShow: false,
                    prepend: '',
                    input: '',
                    path: '',
                    fileName: '',
                    type: '',
                },
                status_count: 0,
                status_total: 0,
                //文件拖拽提示框标记位
                messageFlag: false,
                filePaths: [],
            };
        },
        computed: {
            ...mapGetters({
                setup_isOverwrite: types.setup.setup_isOverwrite,
            })
        },
        created() {
            this.$electron.ipcRenderer.removeAllListeners(Constants.Listener.readDirectory);
            this.$electron.ipcRenderer.on(Constants.Listener.readDirectory, (event, files) => {
                EventBus.$emit(Constants.Event.loading, {
                    show: false,
                });
                if (files && files.length > 0) {
                    files.forEach((item, index) => {
                        if (item.dir) {
                            let temp = item.dir.substring(0, item.dir.lastIndexOf('/') + 1);
                            files[index].key = item.path.replace(temp, '');
                        } else {
                            files[index].key = util.getPostfix(item.path);
                        }
                    });

                    if (this.setup_uploadNoAsk) {//直接上传
                        this.filePaths = files;
                        this.uploadModal.type = Constants.UploadType.UPLOAD;
                        this.preUploadFile();
                    } else {
                        this.uploadModal.input = this.bucket.folderPath;
                        this.handleFile(files);
                    }
                } else {
                    this.$Message.info('未检测到文件');
                }
            });

            window.ondragover = (e) => {
                e.preventDefault();
            };

            window.ondragleave = (e) => {
                e.preventDefault();
                if (e.screenY === e.screenX && e.screenX === 0) {
                    EventBus.$emit(Constants.Event.dropview, {
                        show: false,
                    });
                }
            };

            window.ondragenter = (e) => {
                e.preventDefault();
                if (!this.messageFlag) {
                    this.messageFlag = true;
                    EventBus.$emit(Constants.Event.dropview, {
                        show: true,
                        message: `文件将会被上传至 ${this.bucket.name} 存储桶下的: ${this.bucket.folderPath }/`,
                    });
                    setTimeout(() => {
                        this.messageFlag = false;
                    }, 1000);
                }
            };

            window.ondrop = (e) => {
                e.preventDefault();
                if (e.dataTransfer.files.length > 0) {
                    let path = [];
                    Array.from(e.dataTransfer.files).forEach((file) => {
                        path.push(file.path);
                    });

                    EventBus.$emit(Constants.Event.dropview, {
                        show: false,
                    });
                    EventBus.$emit(Constants.Event.loading, {
                        show: true,
                        message: '文件读取中...',
                    });
                    this.$electron.ipcRenderer.send(Constants.Listener.readDirectory, {files: path});
                }
                return false;
            };
        },
        methods: {
            uploadAction(index) {
                this.uploadModal.prepend = this.bucket.getCurrentDir();
                switch (index) {
                    case 0://调用文件选取对话框
                        this.filePaths = [];
                        this.$electron.ipcRenderer.send(Constants.Listener.openFileDialog, {properties: ['openFile', 'openDirectory', 'multiSelections']});
                        break;
                    case 3://windows 不支持 openFile 和 openDirectory 同时调用
                        this.filePaths = [];
                        this.$electron.ipcRenderer.send(Constants.Listener.openFileDialog, {properties: ['openFile', 'multiSelections']});
                        break;
                    case 4:
                        this.filePaths = [];
                        this.$electron.ipcRenderer.send(Constants.Listener.openFileDialog, {properties: ['openDirectory', 'multiSelections']});
                        break;
                    case 1://抓取文件
                        this.filePaths = [];

                        if (this.$electron.clipboard.readText()) {
                            this.uploadModal.path = this.$electron.clipboard.readText();

                            let urls = this.uploadModal.path.split('\n');

                            urls.forEach((url) => {
                                url = url.trim();
                                this.filePaths.push({
                                    path: url,
                                    key: util.getPostfix(url)
                                });
                            });
                        } else {
                            this.uploadModal.path = '';
                        }
                        this.uploadModal.input = this.bucket.folderPath;
                        this.uploadModal.type = Constants.UploadType.FETCH;
                        this.uploadModal.isShow = true;
                        break;
                }
            },
            initModal() {
                this.uploadModal.input = '';
                this.uploadModal.path = '';
            },
            handleURLPath() {//处理URL上传的路径
                this.filePaths = [];
                //录入input后,换行符会变成空格
                let urls = this.uploadModal.path.split(' ');
                urls.forEach((url) => {
                    url = url.trim();
                    this.filePaths.push({
                        path: url,
                        key: util.getPostfix(url)
                    });
                });
            },
            handleFile(paths) {//通过文件对话框选择的文件
                this.filePaths = paths;

                this.uploadModal.type = Constants.UploadType.UPLOAD;
                this.uploadModal.isShow = true;
            },
            preUploadFile() {//上传文件前处理
                this.status_count = 0;
                this.status_total = this.filePaths.length;
                EventBus.$emit(Constants.Event.statusview, {
                    show: true,
                    message: `文件上传中...`,
                });

                this.uploadFile();
            },
            uploadFile() {
                let file = this.filePaths[0];
                //处理文件的虚拟路径
                file.key = (this.uploadModal.prepend ? this.uploadModal.prepend : '') + (this.uploadModal.input ? this.uploadModal.input + '/' : '') + file.key;

                this.status_count += 1;

                EventBus.$emit(Constants.Event.statusview, {
                    message: `文件上传中(${this.status_count}/${this.status_total})...0%`,
                    path: file.path
                });

                this.resourceCreate(file, {
                    isOverwrite: this.setup_isOverwrite,
                    uploadType: this.uploadModal.type,
                    progressCallback: (progress) => {
                        EventBus.$emit(Constants.Event.statusview, {
                            message: `文件上传中(${this.status_count}/${this.status_total})...${progress}%`,
                        });
                    },
                    callback: this.handleResult
                });
            },
            handleResult(err, ret) {
                if (!err) {
                    util.notification({
                        title: '上传成功',
                        icon: this.bucket.generateUrl(ret.key, this.setup_deadline),
                        body: ret.key,
                    });
                } else {
                    util.notification({
                        title: '上传失败',
                        body: err.error,
                    });
                }

                this.filePaths.shift();
                if (this.filePaths.length > 0) {
                    this.uploadFile();
                } else {
                    EventBus.$emit(Constants.Event.statusview, {
                        message: '上传完成',
                        path: '',
                        show: false,
                    });

                    this.uploadModal.path = '';
                    this.uploadModal.input = '';

                    this.$parent.$emit('on-update', ret, 'upload', event);
                }
            }
        }
    };
</script>
<style lang="scss" scoped>
    .modal-input {
        display: flex;
        flex-direction: row;
    }

    .file-list {
        margin-top: 10px;
        overflow: scroll;
        max-height: 300px;
    }

    .modal-filekey {
        padding: 5px 0 0 0;
        line-height: 1;
        font-size: 12px;
    }

    .modal-url {
        margin: 0 0 20px 0;
    }
</style>
