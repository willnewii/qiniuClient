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
                    <Col span="16">
                    <Tag type="border" v-for="item of domains">{{item}}</Tag>
                    </Col>
                    <Col span="6">
                    <Input v-model="search" placeholder="搜索" @on-enter="doSearch(search)"></Input></Col>
                </Row>
                <div class="layout-tag">
                    <Tag type="border" v-for="item of dirs"><p v-on:click="doSearch(item)">{{item}}</p></Tag>
                </div>
                <div class="layout-content">
                    <Table border :columns="columns" v-if="files.length > 0" :content="this" :height="tableHeight"
                           :data="files"></Table>
                </div>
                <div class="layout-copy">
                    2011-2016 &copy; TalkingData
                </div>
            </i-col>
        </Row>
    </div>
</template>
<script>
    import qiniu from 'qiniu'
    import moment from 'moment'
    import * as types from '../vuex/mutation-types'
    const storage = require('electron-json-storage');

    import api from '../api/API'
    const API = new api();

    export default {
        data () {
            return {
                buckets: [],
                activeName: 'blog',
                tableHeight: 100,
                tableWidth: 100,
                dirs: [],
                files: [],
                columns: [
                    {title: '文件名', key: 'key'},
                    {title: '大小', key: 'fsize'},
                    {title: '类型', key: 'mimeType'},
                    {title: '创建日期', key: 'putTime'},
                    {title: '操作', key: 'a',render () {
                        return `<i-button type="text" size="small">查看</i-button><i-button type="text" size="small">编辑</i-button>`;
                    }}],
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

                    for (let i = 0; i < response.data.items.length; i++) {//使用render 报错

                        if (response.data.items[i].fsize >= 1024 * 1024) {
                            response.data.items[i].fsize = (response.data.items[i].fsize / 1024 / 1024).toFixed(2) + ' MB'
                        } else if (response.data.items[i].fsize >= 1024 && response.data.items[i].fsize < 1024 * 1024) {
                            response.data.items[i].fsize = (response.data.items[i].fsize / 1024).toFixed(2) + ' KB'
                        } else {
                            response.data.items[i].fsize = (response.data.items[i].fsize).toFixed(2) + ' B'
                        }
                        response.data.items[i].putTime = moment(response.data.items[i].putTime / 1000).format('YYYY-MM-DD HH:mm:ss');
//                        moment.
                        response.data.items[i].a = '<i-button type="text" size="small">查看</i-button><i-button type="text" size="small">编辑</i-button>';
                    }

                    this.files = response.data.items
                    //{"key":"aaa.png","hash":"FjGiz4rvUSew7g4Wl2rDn_h8uzxj","fsize":480665,"mimeType":"image/png","putTime":14805851214418833}
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