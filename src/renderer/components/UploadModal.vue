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
                   icon="trash-b" @on-click="uploadModal.path = ''"/>

            <div class="modal-input">
                <Select v-model="uploadModal.prepend" style="width: 100px">
                    <Option value="">无</Option>
                    <Option v-for="item of bucket.getDirArray()" :key="item" :value="item">{{item}}</Option>
                </Select>
                <Input v-model="uploadModal.input"/>
            </div>

            <div class="file-list">
                <div class="modal-filekey" v-for="_path of filePaths">
                    文件名:{{uploadModal.prepend}}{{uploadModal.input ? uploadModal.input + '/' : ''}}{{_path.key}}
                </div>
            </div>
        </Modal>
        <div class="status-view" v-bind:class="{'status-view-none' : !status.show}">
            <div>{{status.message}}</div>
            <div>{{status.path}}</div>
        </div>
    </div>
</template>
<script>
    import {mapGetters} from 'vuex';
    import * as types from '../vuex/mutation-types';
    import {Constants, util} from '../service/index';

    const path = require('path');

    export default {
        name: 'UploadModal',
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
                    type: ''
                },
                //文件拖拽提示框标记位
                messageFlag: false,
                filePaths: [],
                status: {
                    show: false,
                    path: '',
                    message: '',
                    total: 0,
                    count: 0
                }
            };
        },
        computed: {
            ...mapGetters({
                setup_isOverwrite: types.setup.setup_isOverwrite,
            })
        },
        created() {
            this.$electron.ipcRenderer.on(Constants.Listener.readDirectory, (event, files) => {
                if (files && files.length > 0) {
                    files.forEach((item, index) => {
                        if (item.dir) {
                            let temp = item.dir.substring(0, item.dir.lastIndexOf('/') + 1);
                            files[index].key = item.path.replace(temp, '');
                        } else {
                            files[index].key = util.getPostfix(item.path);
                        }
                    });
                    this.uploadModal.prepend = this.bucket.getCurrentDir();
                    this.handleFile(files);
                } else {
                    this.$Message.info('未检测到文件');
                }
            });

            window.ondragover = (e) => {
                e.preventDefault();
            };

            window.ondragenter = (e) => {
                e.preventDefault();
                if (!this.messageFlag) {
                    this.messageFlag = true;
                    this.$Message.info('我已经感受到你传来的文件啦 😎');
                    setTimeout(() => {
                        this.messageFlag = false;
                    }, 2000);
                }
            };

            window.ondrop = (e) => {
                e.preventDefault();
                if (e.dataTransfer.files.length > 0) {
                    let path = [];
                    Array.from(e.dataTransfer.files).forEach((file) => {
                        path.push(file.path);
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
                    case 1://抓取文件
                        this.filePaths = [];

                        if (this.$electron.clipboard.readText()) {
                            this.uploadModal.path = this.$electron.clipboard.readText();
                            this.filePaths[0] = {
                                path: this.uploadModal.path,
                                key: util.getPostfix(this.uploadModal.path)
                            };
                        } else {
                            this.uploadModal.path = '';
                        }
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
                this.filePaths[0] = {
                    path: this.uploadModal.path,
                    key: util.getPostfix(this.uploadModal.path)
                };
            },
            handleFile(paths) {//通过文件对话框选择的文件
                this.filePaths = paths;

                this.uploadModal.type = Constants.UploadType.UPLOAD;
                this.uploadModal.isShow = true;
            },
            preUploadFile() {//上传文件前处理
                this.status.show = true;
                this.status.message = `文件上传中...`;
                this.status.total = this.filePaths.length;

                this.uploadFile();
            },
            uploadFile() {
                let file = this.filePaths[0];

                //处理路径
                let key = (this.uploadModal.prepend ? this.uploadModal.prepend : '') + (this.uploadModal.input ? this.uploadModal.input + '/' : '') +
                    file.key;

                this.status.count += 1;
                this.status.message = `文件上传中(${this.status.count}/${this.status.total})...0%`;
                this.status.path = file.path;
                let param = {
                    path: file.path,
                    key: key,
                    isOverwrite: this.setup_isOverwrite,
                    progressCallback: (progress) => {
                        this.status.message = `文件上传中(${this.status.count}/${this.status.total})...${progress}%`;
                    }
                };

                this.bucket.createFile(param, this.uploadModal.type, this.handleResult);
            },
            handleResult(err, ret) {
                if (!err) {
                    this.$Notice.success({
                        title: '上传成功',
                        desc: ret.key,
                    });
                } else {
                    this.$Notice.error({
                        title: '上传失败',
                        desc: err.error,
                    });
                }

                this.filePaths.shift();
                if (this.filePaths.length > 0) {
                    this.uploadFile();
                } else {
                    this.status.message = '上传完成';
                    this.status.path = '';
                    this.status.show = false;
                    this.status.total = 0;
                    this.status.count = 0;

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
        padding-top: 10px;
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

    .status-view {
        opacity: 1;
        position: fixed;
        bottom: 0;
        width: 100%;
        left: 0;
        text-align: left;
        background-color: rgba(0, 0, 0, 0.51);
        color: #FFFFFF;
        padding: 10px;
        font-size: 12px;
        z-index: 901;
        transition: opacity 1s;
    }

    .status-view-none {
        opacity: 0;
        transition: opacity 2s;
    }
</style>
<style lang="scss">
    .upload-modal {
        .ivu-modal-body {
            padding-bottom: 0;
        }
    }
</style>
