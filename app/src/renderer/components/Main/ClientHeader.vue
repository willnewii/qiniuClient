<style lang="scss" scoped>
    .layout-header {
        background: #fff;
        box-shadow: 0 1px 1px rgba(0, 0, 0, .1);
        display: flex;
        align-items: center;
        padding-right: 15px;
        -webkit-app-region: drag;

        .full {
            flex-grow: 1;
            margin-left: 16px;
        }

        .input-search {
            width: 165px;
            margin: 8px 0;
        }
    }

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
<template>
    <div class="layout-header">
        <div class="full">
            <Select v-model="bucket.domain" style="width:250px"
                    v-if="bucket.name && bucket.domains && bucket.domains.length > 0">
                <Option v-for="item of bucket.domains" :value="item" :key="item">{{ item }}</Option>
            </Select>
            <Input v-if="bucket.domains.length == 0" v-model="bucket.domain" placeholder="请填入空间域名"
                   style="width:250px"></Input>
        </div>

        <div @mouseenter="toggleShow($event)" @mouseleave="toggleShow($event)">
            <i-button type="text" @click="actionBtn(0)" v-if="bucket.name">
                <Tooltip content="文件上传(支持多选)" placement="bottom">
                    <Icon type="ios-plus-outline" size="24"/>
                </Tooltip>
            </i-button>
        </div>

        <div @mouseenter="toggleShow($event)" @mouseleave="toggleShow($event)">
            <i-button type="text" @click="actionBtn(1)" v-if="bucket.name">
                <Tooltip content="通过url直接上传文件" placement="bottom">
                    <Icon type="ios-cloud-upload-outline" size="24"/>
                </Tooltip>
            </i-button>
        </div>

        <Input class="input-search" v-model="search" :placeholder="placeholder" @on-enter="actionBtn(2)"
               v-if="bucket.name"></Input>

        <Modal v-model="uploadModal.isShow" class-name='vertical-center-modal' title="上传对话框" @on-ok="preUploadFile"
               @on-cancel="initModal">

            <Input class='modal-url' v-if="uploadModal.type == 'fetch'" v-model="uploadModal.path"
                   placeholder="请输入你要上传的文件链接" @on-change="handleURLPath"></Input>

            <div class="modal-input">
                <Select v-model="uploadModal.prepend" style="width: 100px">
                    <Option value="">无</Option>
                    <Option v-for="item of dirs" :key="item" :value="item">{{item}}</Option>
                </Select>
                <Input v-model="uploadModal.input"></Input>
            </div>

            <div class="modal-filekey" v-for="_path of filePaths">
                文件名:{{uploadModal.prepend}}{{uploadModal.input ? uploadModal.input + '/' : ''}}{{_path | getfileNameByPath}}
            </div>
        </Modal>
    </div>
</template>
<script>
    import {util, cloudStorage, Constants} from '../../service/index';
    import {mapGetters, mapActions} from 'vuex';
    import * as types from '../../vuex/mutation-types';

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
                search: '',
                filePaths: [],
                messageFlag: false
            };
        },
        computed: {
            dirs() {
                return this.bucket.dirs.slice(2);
            },
            icon() {
                return this.bucket.name ? 'ios-at' : 'ios-cog';
            },
            placeholder() {
                if (this.currentDir) {
                    return '搜索' + this.currentDir + '目录下文件';
                } else {
                    return '搜索';
                }
            },
            currentDir() {
                if (this.bucket.currentDir == '__withoutDelimiter__') {
                    return '';
                } else {
                    return this.bucket.currentDir;
                }
            }
        },
        watch: {
            'bucket.domain': function (val, oldVal) {
                //在domains为空时,保存 bucket.domain
                if (this.bucket && this.bucket.domains.length === 0) {
                    let obj = {};
                    obj[this.bucket.name] = val;
                    this[types.APP.setup_a_customedomain](obj);
                }
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

            window.ondrop = (e) => {
                e.preventDefault();
                if (e.dataTransfer.files.length > 0) {
                    this.uploadModal.prepend = this.currentDir;

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
            ...mapActions([
                types.APP.setup_a_customedomain,
            ]),
            toggleShow($event) {
                let target = $event.target.getElementsByClassName('ivu-tooltip-rel')[0];
                let className = target.className;

                let animationIn = 'animated _rotateIn';
                let animationOut = 'animated _rotateOut';

                if (className.indexOf(animationIn) !== -1) {
                    target.className = target.className.replace(animationIn, animationOut);
                } else if (className.indexOf(animationOut) !== -1) {
                    target.className = target.className.replace(animationOut, animationIn);
                } else {
                    target.className += ' ' + animationIn;
                }
            },
            actionBtn(index) {
                this.uploadModal.prepend = this.currentDir;
                switch (index) {
                    case 0://调用文件选取对话框
                        this.filePaths = [];
                        ipc.send('open-file-dialog', {properties: ['openFile', 'multiSelections']});
                        break;
                    case 1://抓取文件
                        this.filePaths = [];
                        this.uploadModal.type = 'fetch';
                        this.uploadModal.isShow = true;
                        break;
                    case 2://搜索事件
                        this.$emit('on-search', this.currentDir, this.search, event);
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
                    bucket: this.bucket.name,
                    key: key,
                    path: filePath,
                    progressCallback: (progress) => {
                        this.$Loading.update(progress);
                    }
                };

                if (this.uploadModal.type === 'fetch') {
                    cloudStorage.fetch(param, this.handleResult);
                } else {
                    cloudStorage.upload(param, this.handleResult);
                }
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

                    this.$emit('on-update', ret, 'upload', event);
                }
            }
        }
    };
</script>