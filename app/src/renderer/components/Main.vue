<style lang="scss" scoped>
    .layout {
        height: 100%;
        border: 1px solid #d7dde4;
        background: #f5f7f9;
        position: relative;
        border-radius: 4px;
        overflow: hidden;
    }

    .layout-breadcrumb {
        padding: 10px 15px 0;
    }

    .layout-content {
        margin: 15px;
        overflow: scroll;
        background: #fff;
    }

    .layout-content-main {
        padding: 10px;
    }

    .layout-menu-left {
        background: #464c5b;
    }

    .layout-menu-right {
        .layout-header {
            background: #fff;
            box-shadow: 0 1px 1px rgba(0, 0, 0, .1);
            display: flex;
            align-items: center;
            padding-right: 15px;
        }

        .layout-tag {
            padding: 15px 15px 0 15px;
        }

        .layout-copy {
            text-align: center;
            padding: 10px 0 20px;
            color: #9ea7b4;
        }
    }

    .layout-logo-left {
        width: 90%;
        height: 30px;
        background: #5b6270;
        border-radius: 3px;
        margin: 15px auto;
    }

    .layout-ceiling-main a {
        color: #9ba7b5;
    }

    .layout-hide-text .layout-text {
        display: none;
    }

    .ivu-col {
        transition: width .2s ease-in-out;
    }

    .ivu-row-flex {
        height: 100%;
    }
</style>
<template>
    <div class="layout" :class="{'layout-hide-text': spanLeft < 5}">
        <Row type="flex">
            <i-col :span="spanLeft" class="layout-menu-left">
                <Menu ref='menu' theme="dark" width="auto" v-if="buckets.length > 0" @on-select="selectBuckets"
                      :active-name="activeName">
                    <div class="layout-logo-left"></div>
                    <Menu-item v-for="(item,index) of buckets" :name="item">
                        <Icon type="ios-navigate" :size="iconSize"></Icon>
                        <span class="layout-text">{{item}}</span>
                    </Menu-item>
                </Menu>
            </i-col>
            <i-col :span="spanRight" class="layout-menu-right" ref="spanRight">
                <Row class="layout-header">
                    <Col span="2">
                    <i-button type="text" @click="toggleClick">
                        <Icon type="navicon" size="32"></Icon>
                    </i-button>
                    </Col>
                    <Col span="14">
                    <Tag type="border" v-for="item of domains">{{item}}</Tag>
                    </Col>
                    <Col span="2">
                    <i-button type="text" @click="uploadFile">
                        <Icon type="ios-plus-outline" size="32"/>
                    </i-button>
                    </Col>
                    <Col span="6">
                    <Input v-model="search" placeholder="搜索" @on-enter="doSearch(search)"></Input>
                    </Col>
                </Row>
                <div class="layout-tag">
                    <Tag type="border" v-for="item of dirs"><p v-on:click="doSearch(item)">{{item}}</p></Tag>
                </div>
                <div class="layout-content">
                    <Table border :columns="columns" v-if="files.length > 0" :context="self" :height="tableHeight"
                           :data="files"></Table>
                </div>
                <div class="layout-copy">
                    2011-2016 &copy; TalkingData
                </div>
            </i-col>
        </Row>
        <Modal v-model="uploadModal" title="上传对话框" @on-ok="doQiniuUploadFile">
            <p>对话框内容</p>
            <p>对话框内容</p>
            <p>对话框内容</p>
        </Modal>
    </div>
</template>
<script>
    import qiniu from 'qiniu'
    import moment from 'moment'
    import * as types from '../vuex/mutation-types'
    const storage = require('electron-json-storage');

    import api from '../api/API'
    const API = new api();

    let ipc = null;

    export default {
        data () {
            return {
                self: this,
                buckets: [],
                activeName: 'blog',
                tableHeight: 100,
                tableWidth: 100,
                dirs: [],
                files: [],
                columns: [
                    {title: '文件名', key: 'key'},
                    {
                        title: '大小', key: 'fsize',
                        render (row, column, index) {
                            if (row.fsize >= 1024 * 1024) {
                                return (row.fsize / 1024 / 1024).toFixed(2) + ' MB'
                            } else if (row.fsize >= 1024 && row.fsize < 1024 * 1024) {
                                return (row.fsize / 1024).toFixed(2) + ' KB'
                            } else {
                                return (row.fsize).toFixed(2) + ' B'
                            }
                        }
                    },
                    {title: '类型', key: 'mimeType'},
                    {
                        title: '创建日期', key: 'putTime',
                        render (row, column, index) {
                            return moment(row.putTime / 10000).format('YYYY-MM-DD HH:mm:ss');
                        }
                    },
                    {
                        title: '操作', key: 'action',
                        render (row, column, index) {
                            return `<i-button type="primary" size="small" @click="show(${index})">查看</i-button> <i-button type="error" size="small" @click="remove(${index})">删除</i-button>`;
                        }
                    }],
                uploadModal: false,
                domains: [],
                search: '',
                spanLeft: 5,
                spanRight: 19
            }
        },
        computed: {
            iconSize () {
                return this.spanLeft === 5 ? 14 : 24;
            }
        },
        created: function () {
            this.initKEY((data) => {
                this.getBuckets();
            });
            window.onresize = () => {
                this.setTableSize();
            }

            ipc = this.$electron.ipcRenderer;
            ipc.on('selected-directory', (event, path) => {
                this.uploadModal = true;
            })
        },
        methods: {
            initKEY(callback){
                storage.get(types.APP.qiniu_key, (error, data) => {
                    if (!error) {
                        if (data.access_key && data.secret_key) {
                            if (callback) {
                                qiniu.conf.ACCESS_KEY = data.access_key;
                                qiniu.conf.SECRET_KEY = data.secret_key;

                                callback(data);
                            }
                        } else {
                            this.$router.push({path: 'login'});
                        }
                    }
                })
            },
            getBuckets(){
                API.get(API.method.getBuckets).then((response) => {
                    this.buckets = response.data;

                    this.activeName = this.buckets[1];

                    this.setTableSize();
                    this.getDomains();
                    this.getDir();
                    //this.getResources();
                });
            },
            getDomains(){
                API.get(API.method.domains, {tbl: this.activeName}).then((response) => {
                    this.domains = response.data;
                });
            },
            getResources(keyword){
                let data = {
                    bucket: this.activeName,
                    limit: 100
                }

                if (keyword) {
                    data.prefix = keyword;
                }

                API.post(API.method.getResources, data).then((response) => {
                    this.files = response.data.items
                });
            },
            getDir(marker){//获取目录
                let data = {
                    bucket: this.activeName,
                    delimiter: '/',
                    limit: 1000
                }
                if (marker) {
                    data.marker = marker;
                }

                API.post(API.method.getResources, data).then((response) => {
                    this.dirs = this.dirs.concat(response.data.commonPrefixes);
                    if (response.data.marker) {
                        this.getDir(response.data.marker);
                    }
                });
            },
            selectBuckets(name){
                this.activeName = name;
                this.getDomains();
                this.getResources();
            },
            doSearch: function (search) {
                console.log(search);
                this.getResources(search)
            },
            show(index) {
                let url = this.domains[0] + '/' + this.files[index].key;
                this.$electron.shell.openExternal('http://' + url)
            },
            uploadFile(){
                ipc.send('open-file-dialog', {properties: ['openFile']});
            },
            doQiniuUploadFile(){

            },
            qiniuUploadFile(dir, path){
                let key = path;
                if (path.lastIndexOf('/') !== -1) {
                    key = path.substring(path.lastIndexOf('/') + 1, path.length - 1);
                }
                let uptoken = new qiniu.rs.PutPolicy(this.activeName + ":" + key).token();
                let extra = new qiniu.io.PutExtra();

                qiniu.io.putFile(uptoken, key, path, extra, function (err, ret, res) {
                    console.log(res);
                    if (!err) {
                        console.log(ret);
                        console.log(ret.hash, ret.key);
                    } else {
                        // 上传失败， 处理返回代码
                        console.log(err);
                    }
                });
            },
            setTableSize(){
                this.tableHeight = this.$refs.spanRight.$el.clientHeight * 0.80 - 30;
                /*                this.tableWidth = this.$refs.spanRight.$el.clientWidth - 30;

                 this.columns[0].width = this.tableWidth * 0.5;
                 this.columns[1].width = this.tableWidth * 0.1;
                 this.columns[2].width = this.tableWidth * 0.2;
                 this.columns[3].width = this.tableWidth * 0.2;*/
            },
            toggleClick () {
                if (this.spanLeft === 5) {
                    this.spanLeft = 2;
                    this.spanRight = 22;
                } else {
                    this.spanLeft = 5;
                    this.spanRight = 19;
                }
            }
        }
    }
</script>