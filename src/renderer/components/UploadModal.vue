<!--
三种上传方式
1.通过URL 2.选择文件 3.拖拽
-->
<template>
    <div>
        <Modal v-model="uploadModal.isShow" title="上传文件" :mask-closable="false"
               @on-ok="preUploadFile" @on-cancel="initModal" class-name="upload-modal">

            <Input class='modal-url' v-if="uploadModal.type == 'fetch'" v-model="uploadModal.path"
                   placeholder="请输入你要上传的文件链接" @on-change="handleURLPath"
                   icon="trash-b" @on-click="uploadModal.path = '';filePaths=[]"/>

            <div class="modal-input">
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
    import {Constants, util, EventBus} from '../service';
    import {resource, base} from '../mixins/index';

    export default {
        name: 'UploadModal',
        mixins: [base],
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
        props: {
            bucket: {
                type: Object
            }
        },
        computed: {
            ...mapGetters({
                setup_isOverwrite: types.setup.isOverwrite,
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
                        this.uploadModal.input = this.bucket.folderPath;
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
                    EventBus.$emit(Constants.Event.dropView, {
                        show: false,
                    });
                }
            };

            window.ondragenter = (e) => {
                e.preventDefault();
                if (!this.messageFlag) {
                    this.messageFlag = true;
                    EventBus.$emit(Constants.Event.dropView, {
                        show: true,
                        message: `文件将会被上传至 ${this.bucket.name} 存储桶下的: ${this.bucket.folderPath}/`,
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

                    EventBus.$emit(Constants.Event.dropView, {
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
                //this.uploadModal.prepend = this.bucket.getCurrentDir();
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
                let list = this.filePaths.map((item) => {
                    item.key = (this.uploadModal.prepend ? this.uploadModal.prepend : '') + (this.uploadModal.input ? this.uploadModal.input + '/' : '') + item.key;
                    return item;
                });
                EventBus.$emit(Constants.Event.resourceAction, list, Constants.ActionType.upload);
                /*this.resourceAction(this.filePaths.map((item) => {
                    item.key = (this.uploadModal.prepend ? this.uploadModal.prepend : '') + (this.uploadModal.input ? this.uploadModal.input + '/' : '') + item.key;
                    return item;
                }), Constants.ActionType.upload);*/

                this.uploadModal.path = '';
                this.uploadModal.input = '';
            },
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
