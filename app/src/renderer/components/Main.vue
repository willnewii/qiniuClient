<style lang="scss" scoped>
    .layout {
        height: 100%;
        border: 1px solid #d7dde4;
        background: #f5f7f9;
        position: relative;
        border-radius: 4px;
        overflow: hidden;

        .ivu-row-flex {
            height: 100%;
        }

        .layout-menu-left {
            background: #464c5b;

            .layout-logo-left {
                width: 90%;
                height: 30px;
                background: #5b6270;
                border-radius: 3px;
                margin: 15px auto;

                .layout-hide-text .layout-text {
                    display: none;
                }
            }
        }

        .layout-menu-right {

        }
    }

    .layout-hide-text {
        display: none;
    }

    .ivu-col {
        transition: width .2s ease-in-out;
    }
</style>
<template>
    <div class="layout" >
        <Row type="flex">
            <i-col :span="spanLeft" class="layout-menu-left">
                <Menu ref='menu' theme="dark" width="auto" v-if="buckets.length > 0" @on-select="selectBuckets"
                      :active-name="bucketname">
                    <div class="layout-logo-left"></div>
                    <Menu-item v-for="(item,index) of buckets" :name="item">
                        <Icon type="ios-navigate" :size="iconSize"></Icon>
                        <span class="layout-text" :class="{'layout-hide-text': spanLeft < 5}">{{item}}</span>
                    </Menu-item>
                </Menu>
            </i-col>
            <i-col :span="spanRight" class="layout-menu-right">
                <RightContent :bucketname="bucketname" @on-spanLeft="onSpanLeft"></RightContent>
            </i-col>
        </Row>
    </div>
</template>
<script>
    import qiniu from 'qiniu'
    import * as types from '../vuex/mutation-types'
    const storage = require('electron-json-storage');

    import RightContent from './Main/RightContent.vue'

    import api from '../api/API'
    let API = null;

    export default {
        data () {
            return {
                spanLeft: 5,
                spanRight: 19,
                search: '',
                buckets: [],
                bucketname: ''
            }
        },
        components: {RightContent},
        computed: {
            iconSize () {
                return this.spanLeft === 5 ? 14 : 24;
            }
        },
        created: function () {
            this.initKEY((data) => {
                this.getBuckets();
            });

            API = new api(this);
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

                    this.bucketname = this.buckets[1];
                });
            },
            selectBuckets(name){
                this.bucketname = name;
            },
            onSpanLeft(){
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