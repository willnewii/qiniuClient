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
            <Icon type="navicon" size="32"></Icon>
        </i-button>
        <div class="full">
            <Tag type="border" v-for="item of domains">{{item}}</Tag>
        </div>
        <i-button type="text" @click="actionBtn(0)">
            <Icon type="ios-plus-outline" size="32"/>
        </i-button>
        <i-button type="text" @click="actionBtn(1)">
            <Icon type="arrow-swap" size="32"/>
        </i-button>
        <Input class="input-search" v-model="search" placeholder="搜索" @on-enter="doSearch(search)"></Input>
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
            <div class="modal-filekey">文件KEY：{{uploadModal.prepend}}{{uploadModal.input ? uploadModal.input + '/' : ''}}{{uploadModal.fileName}}</div>
        </Modal>
    </div>
</template>
<script>
    import qiniu from 'qiniu'

    let ipc;
    export default {
        name: 'ClientHeader',
        data(){
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
            dirArray () {
                return this.dirs.slice(2);
            },
        },
        props: {
            domains: {
                type: Array,
                default: []
            },
            dirs: {
                type: Array,
                default: []
            },
            bucketname: {
                type: String,
                default: ''
            }
        },
        created(){
            ipc = this.$electron.ipcRenderer;
            ipc.on('selected-directory', (event, path) => {
                this.uploadModal.isShow = true;
                this.uploadModal.type = 'upload';
                //仅处理单个文件
                let currentPath = path[0];
                this.uploadModal.path = currentPath;
                this.uploadModal.fileName = currentPath;
                if (currentPath.lastIndexOf('/') !== -1) {
                    this.uploadModal.fileName = currentPath.substring(currentPath.lastIndexOf('/') + 1, currentPath.length);
                }
            })
        },
        methods: {
            toggleClick (){
                this.$emit('on-Navicon', event);

            },
            actionBtn (index, event) {
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
            doSearch(search){
                this.$emit('on-search', search, event);
            },
            handlePath(){
                let currentPath = this.uploadModal.path;

                this.uploadModal.fileName = currentPath;
                if (currentPath.lastIndexOf('/') !== -1) {
                    this.uploadModal.fileName = currentPath.substring(currentPath.lastIndexOf('/') + 1, currentPath.length);
                }
            },
            doQiniuUploadFile(){
                if (this.uploadModal.input)
                    this.uploadModal.input = this.uploadModal.input + '/';

                this.qiniuUploadFile();
            },
            qiniuUploadFile(){
                let that = this;
                let key = this.uploadModal.prepend + this.uploadModal.input + this.uploadModal.fileName;

                if (this.uploadModal.type === 'fetch') {
                    new qiniu.rs.Client().fetch(this.uploadModal.path, this.bucketname, key, (err, ret, res) => {
                        that.uploadResult(err, ret, res);
                    });
                } else {
                    let uptoken = new qiniu.rs.PutPolicy(this.bucketname + ":" + key).token();
                    let extra = new qiniu.io.PutExtra();
                    qiniu.io.putFile(uptoken, key, this.uploadModal.path, extra, function (err, ret, res) {
                        that.uploadResult(err, ret, res);
                    });
                }
            },
            uploadResult(err, ret, res){
                let key = this.uploadModal.prepend + this.uploadModal.input + this.uploadModal.fileName;

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