<template>
    <div class="layout">
        <Row type="flex">
            <i-col :span="menuSpace.left" class="layout-menu-left">
                <i-button type="text" class="navicon_btn" @click="toggleMenu">
                    <Icon type="navicon" size="32"></Icon>
                </i-button>
                <Menu ref='menu' theme="dark" width="auto" v-if="buckets && buckets.length > 0"
                      @on-select="onMenuSelect" :active-name="bucketName">
                    <Menu-group title="存储空间">
                        <Menu-item v-for="(item,index) of buckets" :key="index" :name="item">
                            <Icon :style="iconStyle" :size="parseInt(iconStyle.width)"
                                  :type="privatebucket.indexOf(item) !==  -1 ? 'android-lock' : 'folder'"></Icon>
                            <span class="layout-text" :class="{'layout-hide-text': !menuState}">{{item}}</span>
                        </Menu-item>
                    </Menu-group>
                    <Menu-group title="设置">
                        <Menu-item v-for="(item,index) of menus " :name="item.name" :key="item.name">
                            <Icon :style="iconStyle" :size="parseInt(iconStyle.width)"
                                  :type="item.icon"></Icon>
                            <span class="layout-text" :class="{'layout-hide-text': !menuState}">{{item.title}}</span>
                        </Menu-item>
                    </Menu-group>
                </Menu>
                <div class="version">
                    <span @click="openBrowser(version.github)">v{{appVersion}}</span>
                    <Poptip trigger="hover" v-if="version.url" placement="top-start" :title="version.version">
                        <pre slot="content" class="version-new-info">{{version.info}}</pre>
                        <span class="version-new" @click="openBrowser(version.url)">有新版啦~</span>
                    </Poptip>
                </div>
            </i-col>
            <i-col :span="menuSpace.right">
                <router-view :bucketName="bucketName"></router-view>
            </i-col>
        </Row>
    </div>
</template>
<script>
    import {mapGetters, mapActions} from 'vuex';
    import * as types from '../vuex/mutation-types';
    import pkg from '../../../package.json';

    import {Constants, mixins} from '../service/index';
    import brand from "@/cos/brand";

    export default {
        mixins: [mixins.base],
        data() {
            return {
                bucketName: '',
                menuState: true,
                iconStyle: {
                    width: '25px'
                },
                appVersion: pkg.version,
                version: {
                    github: Constants.URL.github,
                    url: '',
                    version: '',
                    info: ''
                },
                menus: [{
                    name: Constants.Key.app_setup,
                    icon: 'ios-gear',
                    title: '设置'
                }, {
                    name: Constants.Key.app_logout,
                    icon: 'android-exit',
                    title: '注销'
                }]
            };
        },
        computed: {
            ...mapGetters({
                buckets: types.app.buckets,
                privatebucket: types.setup.setup_privatebucket,
            }),
            menuSpace() {
                return {
                    left: this.menuState ? 5 : 2,
                    right: this.menuState ? 19 : 22
                };
            }
        },
        /**
         * 初始化COSkey
         * 初始化设置项
         * 检查是否有新版本
         */
        created: function () {
            this.initCOS();

            this[types.setup.setup_init]();

            this.checkVersion();
        },
        methods: {
            ...mapActions([
                types.app.a_buckets,
                types.app.a_buckets_info,
                types.setup.setup_init,
            ]),
            initCOS() {
                this.$storage.initCOS((result) => {
                    if (result) {
                        this.getBuckets();
                    } else {
                        this.$router.push({path: Constants.PageName.login});
                    }
                });
            },
            getBuckets() {
                this.$storage.getBuckets((error, data) => {
                    if (error) {
                        this.$Message.info('获取buckets信息失败. 请确认七牛密钥信息正确,且已创建至少一个存储空间');
                        this.$router.push({path: Constants.PageName.login});
                    } else {
                        switch (this.$storage.name) {
                            case brand.qiniu:
                                this[types.app.a_buckets](data);
                                break;
                            case brand.tencent:
                                let buckets = [];
                                data.forEach((value) => {
                                    buckets.push(value.Name);
                                });

                                this[types.app.a_buckets](buckets);
                                this[types.app.a_buckets_info](data);
                                break;
                        }

                        this.onMenuSelect(this.buckets[0]);
                    }
                });
            },
            checkVersion() {
                this.doRequset(Constants.URL.releases, null, (response) => {
                    let result = response.data;
                    if (result.tag_name > pkg.version) {
                        this.version.url = result.html_url;
                        this.version.version = result.tag_name;
                        this.version.info = result.body;
                    }
                });
            },
            toggleMenu() {
                this.menuState = !this.menuState;
            },
            onMenuSelect(name) {
                switch (name) {
                    default:
                        this.bucketName = name;
                        this.$router.push({name: Constants.PageName.bucketPage, query: {bucketName: name}});
                        break;
                    case Constants.Key.app_logout:
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
                                ]);
                            },
                            onOk: () => {
                                this.$storage.cleanCosKey(() => {
                                    this.$router.push({path: Constants.PageName.login});
                                });
                            }
                        });
                        break;
                    case Constants.Key.app_setup:
                        this.$router.push({name: Constants.PageName.setup});
                        break;
                }
            },
        }
    };
</script>
<style lang="scss" scoped>
    .layout {
        height: 100%;
        background: #f5f7f9;
        position: relative;
        border-radius: 4px;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        .ivu-row-flex {
            height: 100%;
        }

        .layout-menu-left {
            background: #464c5b;
            display: flex;
            flex-direction: column;

            .navicon_btn {
                text-align: left;
                color: #c5c5c5;
                &:hover {
                    color: #57a3f3;
                }
            }

            .ivu-menu-vertical {
                flex-grow: 1;
            }

            .ivu-menu-item {
                padding: 8px 24px;
                display: flex;
                align-items: center;
                .layout-text {
                    margin-left: 0px;
                }
            }

            .layout-hide-text {
                display: none;
            }

            .version {
                padding: 10px 20px;
                color: #c5c5c5;
                &-new {
                    color: #ff3605;
                    cursor: pointer;
                }
                &-new-info {
                    color: #555;
                }
            }
        }
    }

</style>