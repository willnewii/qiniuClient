<style lang="scss">
    @import '../style/base';
</style>
<style lang="scss" scoped>
    .layout {
        height: 100%;
        background: #f5f7f9;
        position: relative;
        border-radius: 4px;
        overflow: hidden;

        .ivu-row-flex {
            height: 100%;
        }

        .layout-menu-left {
            background: #464c5b;
            display: flex;
            flex-direction: column;
            .ivu-menu-vertical {
                flex-grow: 1;
            }

            .navicon_btn {
                text-align: left;
                color: #c5c5c5;
            }
            .navicon_btn:hover {
                color: #57a3f3;
            }

            .ivu-menu-item {
                padding: 8px 24px;
                .layout-text {
                    margin-left: 0px;
                }
            }

            .version {
                padding: 10px 20px;
                color: #c5c5c5;
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
                <i-button type="text" @click="toggleClick" class="navicon_btn">
                    <Icon type="navicon" size="32"></Icon>
                </i-button>
                <Menu ref='menu' theme="dark" width="auto" v-if="buckets && buckets.length > 0"
                      @on-select="selectBuckets"
                      :active-name="bucketname">
                    <Menu-group title="存储空间">
                        <Menu-item v-for="(item,index) of buckets" :name="item">
                            <Icon :style="{width:iconSize + 'px'}" :type="privatebucket.indexOf(item) !==  -1 ? 'locked' : 'folder'" :size="iconSize"></Icon>
                            <span class="layout-text" :class="{'layout-hide-text': !menuState}">{{item}}</span>
                        </Menu-item>
                    </Menu-group>
                    <Menu-group title="设置">
                        <Menu-item name="__app__setup__">
                            <Icon :style="{width:iconSize + 'px'}" type="ios-gear" :size="iconSize"></Icon>
                            <span class="layout-text" :class="{'layout-hide-text': !menuState}">设置</span>
                        </Menu-item>
                        <Menu-item name="__app__logout__">
                            <Icon :style="{width:iconSize + 'px'}" type="android-exit" :size="iconSize"></Icon>
                            <span class="layout-text" :class="{'layout-hide-text': !menuState}">注销</span>
                        </Menu-item>
                    </Menu-group>
                </Menu>
                <div class="version" @click="open_Browser(0)">version:{{appVersion}} </div>
            </i-col>
            <i-col :span="spanRight" class="layout-menu-right">
                <router-view :bucketname="bucketname"></router-view>
            </i-col>
        </Row>
    </div>
</template>
<script>
    import {mapGetters, mapActions} from 'vuex'
    import * as cloudStorage from '../service/cloudStorage'
    import * as types from '../vuex/mutation-types'
    import storage from 'electron-json-storage'
    import pkg from '../../../package.json'

    import mixin_base from "../mixins/mixin-base";
    import RightContent from './bucketPage.vue'

    import {Constants}  from '../service/index'

    export default {
        mixins: [mixin_base],
        data() {
            return {
                search: '',
                bucketname: '',
                menuState: true,
                appVersion: pkg.version
            }
        },
        computed: {
            ...mapGetters({
                buckets: types.APP.app_buckets,
                privatebucket: types.APP.setup_privatebucket,
            }),
            iconSize() {
                //return this.menuState ? 25 : 25;
                return 25;
            },
            spanLeft() {
                return this.menuState ? 5 : 2;
            },
            spanRight() {
                return this.menuState ? 19 : 22;
            }
        },
        components: {RightContent},
        created: function () {
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
            toggleClick() {
                this.menuState = !this.menuState;
            },
            open_Browser(){
              this.openBrowser(Constants.URL.github)
            },
            initKEY(callback) {
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
            getBuckets() {
                this.doRequset(Constants.method.getBuckets, null, (response) => {
                    if(response.data){
                        this[types.APP.app_a_buckets](response.data);
                        this.bucketname = this.buckets[0];

                        this.selectBuckets(this.bucketname);
                    }else{
                        this.$Message.info('获取buckets信息失败. 请确认七牛密钥信息正确,且有至少一个存储空间');
                        this.$router.push({path: 'login'});
                    }
                });
            },
            selectBuckets(name) {
                this.bucketname = name;
                if (name === '__app__setup__') {
                    this.$router.push({path: '/setup'});
                } else if (name === '__app__logout__') {
                    this.$Modal.confirm({
                        title: '登出该账号?',
                        render: (h) => {
                            return h('div', {
                                style: {
                                    'padding-top': '10px'
                                }
                            }, [
                                '如果有不满意的地方,记得提个',
                                h('a', {
                                    on: {
                                        click: () => {
                                            this.openBrowser(Constants.URL.issue);
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
                    this.$router.push({path: '/bucketPage', query: {bucketname: name}});
                }
            },
        }
    }
</script>