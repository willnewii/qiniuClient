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
                        <Icon :style="{width:iconSize + 'px'}" type="ios-box" :size="iconSize"></Icon>
                        <span class="layout-text" :class="{'layout-hide-text': spanLeft < 4}">{{item}}</span>
                    </Menu-item>
                    <Menu-item name="__app__setup__">
                        <Icon :style="{width:iconSize + 'px'}" type="ios-gear" :size="iconSize"></Icon>
                        <span class="layout-text" :class="{'layout-hide-text': spanLeft < 4}">设置</span>
                    </Menu-item>
                    <Menu-item name="__app__logout__">
                        <Icon :style="{width:iconSize + 'px'}" type="android-exit" :size="iconSize"></Icon>
                        <span class="layout-text" :class="{'layout-hide-text': spanLeft < 4}">注销</span>
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
    import * as cloudStorage from '../util/cloudStorage'
    import * as types from '../vuex/mutation-types'
    import storage from 'electron-json-storage'

    import RightContent from '../components/Main/RightContent.vue'

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
                return this.menuState ? 25 : 20;
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
                                cloudStorage.init({access_key: data.access_key, secret_key: data.secret_key});
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
                    this.bucketname = this.buckets[0];

                    this.selectBuckets(this.bucketname);
                });
            },
            selectBuckets(name){
                this.bucketname = name;
                if (name === '__app__setup__') {
                    this.$router.push({path: '/setup'});
                } else if (name === '__app__logout__') {
                    console.log(storage);
                    this.$Modal.confirm({
                        title: '登出该账号?',
                        content: `如果有不满意的地方,记得提个<span @click="openIssues">issue</span>`,
                        render: (h) => {
                            return h('div', {
                                style:{
                                    'padding-top':'10px'
                                }
                            }, [
                                '如果有不满意的地方,记得提个',
                                h('a', {
                                    on: {
                                        click: () => {
                                            this.openIssues();
                                        }
                                    }
                                }, ' issues')
                            ])
                        },
                        onOk: () => {
                            storage.clear(() => {
                                this.$router.push({path: '/login'});
                            });
                        }
                    });
                } else {
                    this.$router.push({path: '/table', query: {bucketname: name}});
                }
            },
            toggleClick(){
                this.menuState = !this.menuState;
            },
            openIssues(){
                this.$electron.shell.openExternal('https://github.com/willnewii/qiniuClient/issues')
            }
        }
    }
</script>