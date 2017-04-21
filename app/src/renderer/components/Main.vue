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
            }
            .layout-text {
                margin-left: 10px;
            }
        }

        .layout-menu-right {
        }
    }

    .layout-hide-text {
        display: none;
    }

    .ivu-menu-item {
        display: flex;
        align-items: center;
    }

    .ivu-col {
        //will-change: transition;
        //transition: width .2s ease-in-out;
    }
</style>
<template>
    <div class="layout">
        <Row type="flex">
            <i-col :span="spanLeft" class="layout-menu-left">
                <Menu ref='menu' theme="dark" width="auto" v-if="buckets && buckets.length > 0"
                      @on-select="selectBuckets"
                      :active-name="bucketname">
                    <i-button type="text" @click="toggleClick">
                        <Icon type="navicon" size="32"></Icon>
                    </i-button>
                    <Menu-item v-for="(item,index) of buckets" :name="item">
                        <Icon type="ios-box" :size="iconSize"></Icon>
                        <span class="layout-text" :class="{'layout-hide-text': spanLeft < 4}">{{item}}</span>
                    </Menu-item>
                    <Menu-item name="__app__setup__">
                        <Icon type="gear-a" :size="iconSize"></Icon>
                        <span class="layout-text" :class="{'layout-hide-text': spanLeft < 4}">设置</span>
                    </Menu-item>
                </Menu>
            </i-col>
            <i-col :span="spanRight" class="layout-menu-right">
                <router-view :bucketname="bucketname"></router-view>
            </i-col>
        </Row>
    </div>
</template>
<script>
    import {mapGetters, mapActions} from 'vuex'
    import qiniu from 'qiniu'
    import * as types from '../vuex/mutation-types'
    const storage = require('electron-json-storage');

    import RightContent from './Main/RightContent.vue'

    import api from '../api/API'
    let API = null;

    export default {
        data () {
            return {
                search: '',
                bucketname: '',
                menuState: true,
            }
        },
        computed: {
            ...mapGetters({
                buckets: types.APP.app_buckets,
            }),
            iconSize () {
                return this.menuState ? 24 : 18;
            },
            spanLeft () {
                return this.menuState ? 4 : 1;
            },
            spanRight () {
                return this.menuState ? 20 : 23;
            }
        },
        components: {RightContent},
        created: function () {
            API = new api(this);
            this.initKEY(() => {
                this.getBuckets();
            });
            //this.$router.push({path: '/setup'});

            this[types.APP.app_a_setup_init]();
        },
        methods: {
            ...mapActions([
                types.APP.app_a_buckets,
                types.APP.app_a_setup_init,
            ]),
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
                    this[types.APP.app_a_buckets](response.data);
                    this.bucketname = this.buckets[1];
                });
            },
            selectBuckets(name){
                this.bucketname = name;
                if (name === '__app__setup__') {
                    this.$router.push({path: '/setup'});
                } else {
                    this.$router.push({path: '/table', query: {bucketname: name}});
                }
            },
            toggleClick(){
                this.menuState = !this.menuState;
            }
        }
    }
</script>