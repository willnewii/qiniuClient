<style lang="scss" scoped>
    .layout-header {
        background: #fff;
        box-shadow: 0 1px 1px rgba(0, 0, 0, .1);
        display: flex;
        align-items: center;
        padding-right: 15px;

        .full {
            flex-grow: 1;
        }

        .input-search {
            width: 300px;
        }
    }

    .modal-filekey {
        padding: 10px 0;
        font-size: 14px;
    }

    .modal-url {
        margin: 0 0 20px 0;
    }
</style>
<template>
    <div class="layout-header">
        <i-button type="text" @click="toggleClick">
            <Icon :type="icon" size="32"></Icon>
        </i-button>
        <div class="full">
            <Tag type="border" v-for="item of bucket.domains" v-if="bucket.name">{{item}}</Tag>
        </div>
        <i-button type="text" @click="actionBtn(0)" v-if="bucket.name">
            <Icon type="ios-plus-outline" size="32"/>
        </i-button>
        <i-button type="text" @click="actionBtn(1)" v-if="bucket.name">
            <Icon type="arrow-swap" size="32"/>
        </i-button>
        <Input class="input-search" v-model="search" placeholder="搜索" @on-enter="doSearch(search)"
               v-if="bucket.name"></Input>
        <Modal v-model="uploadModal.isShow" class-name='vertical-center-modal' title="上传对话框" @on-ok="doQiniuUploadFile">

            <Input class='modal-url' v-if="uploadModal.type == 'fetch'" v-model="uploadModal.path"
                   placeholder="请输入你要上传的文件链接" @on-change="handlePath"></Input>

            <Input v-model="uploadModal.input">
            <Select v-model="uploadModal.prepend" slot="prepend" style="width: 80px">
                <Option value="">无</Option>
                <Option v-for="item of dirArray" :value="item">{{item}}</Option>
            </Select>
            <Button slot="append">{{uploadModal.fileName}}</Button>
            </Input>
            <div class="modal-filekey">
                文件名：{{uploadModal.prepend}}{{uploadModal.input ? uploadModal.input + '/' : ''}}{{uploadModal.fileName}}
            </div>
        </Modal>
    </div>
</template>
<script>
    import * as cloudStorage from '../../util/cloudStorage'

    let ipc;
    export default {
        name: 'ClientHeader',
        data() {
            return {
                uploadModal: {
                    isShow: false,
                    prepend: '',
                    input: '',
                    path: '',
                    fileName: '',
                },
                search: ''
            }
        },
        computed: {
            dirArray() {
                return this.bucket.dirs.slice(2);
            },
            icon() {
                return this.bucket.name ? 'ios-box' : 'ios-cog';
            },
        },
        props: {
            bucket: {
                type: Object
            }
        },
        created() {
            ipc = this.$electron.ipcRenderer;
            ipc.on('selected-directory', (event, path) => {
                this.handleFile(path);
            });

            let that = this;
            window.ondrop = function (e) {
                e.preventDefault();
                if (e.dataTransfer.files.length > 0) {
                    that.handleFile([e.dataTransfer.files[0].path]);
                }
                return false
            };
        },
        methods: {
            handleFile(path) {
                this.uploadModal.isShow = true;
                this.uploadModal.type = 'upload';
                //默认选择当前目录
                if (this.bucket.currentDir == '__withoutDelimiter__') {
                    this.uploadModal.prepend = '';
                } else {
                    this.uploadModal.prepend = this.bucket.currentDir;
                }

                //仅处理单个文件
                let currentPath = path[0];
                this.uploadModal.path = currentPath;
                this.uploadModal.fileName = currentPath;
                if (currentPath.lastIndexOf('/') !== -1) {
                    this.uploadModal.fileName = currentPath.substring(currentPath.lastIndexOf('/') + 1, currentPath.length);
                }
            },
            toggleClick() {
                this.$emit('on-navicon', event);
            },
            actionBtn(index, event) {
                switch (index) {
                    case 0:
                        ipc.send('open-file-dialog', {properties: ['openFile']});
                        break;
                    case 1:
                        //抓取文件
                        this.uploadModal.type = 'fetch';
                        this.uploadModal.isShow = true;
                        break;
                }
                //this.$emit('on-ActionBtn', index, event);
            },
            doSearch(search) {
                this.$emit('on-search', search, event);
            },
            handlePath() {
                let currentPath = this.uploadModal.path;

                this.uploadModal.fileName = currentPath;
                if (currentPath.lastIndexOf('/') !== -1) {
                    this.uploadModal.fileName = currentPath.substring(currentPath.lastIndexOf('/') + 1, currentPath.length);
                }
            },
            doQiniuUploadFile() {
                if (this.uploadModal.input)
                    this.uploadModal.input = this.uploadModal.input + '/';

                this.qiniuUploadFile();
            },
            qiniuUploadFile() {
                let that = this;
                let key = this.uploadModal.prepend + this.uploadModal.input + this.uploadModal.fileName;

                this.$Notice.info({
                    title: '文件上传中...',
                    desc: this.uploadModal.path,
                });

                let param = {
                    bucket: this.bucket.name,
                    key: key,
                    path: this.uploadModal.path,
                    progressCallback: (progress) => {
                        this.$Loading.update(progress);
                    }
                };

                let callback = (err, ret) => {
                    this.$Loading.finish();
                    that.uploadResult(err, ret);
                };

                if (this.uploadModal.type === 'fetch') {
                    cloudStorage.fetch(param, callback)
                } else {
                    cloudStorage.upload(param, callback);
                }
            },
            uploadResult(err, ret) {
                this.uploadModal.input = '';
                this.uploadModal.prepend = '';
                this.uploadModal.fileName = '';
                this.uploadModal.path = '';

                if (!err) {
                    this.$Notice.success({
                        title: '上传成功',
                        desc: ret.key,
                    });
                    this.$emit('on-update', ret, 'upload', event);
                } else {
                    // 上传失败， 处理返回代码
                    console.log(err);
                }
            }
        }
    };
</script>