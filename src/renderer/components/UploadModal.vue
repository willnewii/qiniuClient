<template>
    <Modal v-model="uploadModal.isShow" title="上传文件" @on-ok="preUploadFile"
           @on-cancel="initModal">

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

        <div class="modal-filekey" v-for="_path of filePaths">
            文件名:{{uploadModal.prepend}}{{uploadModal.input ? uploadModal.input + '/' : ''}}{{_path | getfileNameByPath}}
        </div>
    </Modal>
</template>
<script>
    import {Constants, util} from '../service/index';

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
                },
                filePaths: [],
                messageFlag: false
            };
        },
        computed: {},
        created() {
            this.$electron.ipcRenderer.on('selected-directory', (event, path) => {
                this.handleFile(path);
            });

            window.ondrop = (e) => {
                e.preventDefault();
                if (e.dataTransfer.files.length > 0) {
                    this.uploadModal.prepend = this.bucket.getCurrentDirStr();

                    let paths = [];
                    Array.from(e.dataTransfer.files).forEach((item) => {
                        paths.push(item.path);
                    });
                    this.handleFile(paths);
                }
                return false;
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
        },
        methods: {
            uploadAction(index) {
                this.uploadModal.prepend = this.bucket.getCurrentDirStr();
                switch (index) {
                    case 0://调用文件选取对话框
                        this.filePaths = [];
                        this.$electron.ipcRenderer.send(Constants.Listener.openFileDialog, {properties: ['openFile', 'multiSelections']});
                        break;
                    case 1://抓取文件
                        this.filePaths = [];

                        if (this.$electron.clipboard.readText()) {
                            this.uploadModal.path = this.$electron.clipboard.readText();
                            this.filePaths[0] = this.uploadModal.path;
                        } else {
                            this.uploadModal.path = '';
                        }
                        this.uploadModal.type = 'fetch';
                        this.uploadModal.isShow = true;
                        break;
                }
            },
            initModal() {
                this.uploadModal.input = '';
                this.uploadModal.path = '';
            },
            handleURLPath() {//处理URL上传的路径
                this.filePaths[0] = this.uploadModal.path;
            },
            handleFile(paths) {
                //多文件上传
                this.filePaths = paths;

                this.uploadModal.type = 'upload';
                this.uploadModal.isShow = true;
            },
            preUploadFile() {
                if (this.uploadModal.input)
                    this.uploadModal.input = this.uploadModal.input + '/';

                this.uploadFile();
            },
            uploadFile() {
                let filePath = this.filePaths[0];
                let key = this.uploadModal.prepend + this.uploadModal.input + util.getPostfix(filePath);

                this.$Notice.info({
                    title: '文件上传中...',
                    desc: filePath,
                });

                let param = {
                    path: filePath,
                    key: key,
                    progressCallback: (progress) => {
                        this.$Loading.update(progress);
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
                    this.$Loading.finish();
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

    .modal-filekey {
        padding: 5px 0 0 0;
        line-height: 1;
        font-size: 12px;
    }

    .modal-url {
        margin: 0 0 20px 0;
    }
</style>