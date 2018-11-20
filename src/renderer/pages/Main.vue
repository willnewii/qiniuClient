<template>
    <div class="layout">
        <!--<v-contextmenu ref="bucketMenu" @contextmenu="handleBucketMenu">
            <v-contextmenu-item @click="handleBucketMenuClick(0)">同步</v-contextmenu-item>
            <v-contextmenu-item divider></v-contextmenu-item>
            <v-contextmenu-item @click="handleBucketMenuClick(1)">批量导出URL</v-contextmenu-item>
        </v-contextmenu>-->
        <Row type="flex">
            <i-col :span="menuSpace.left" class="layout-menu-left">
                <i-button type="text" class="navicon_btn" @click="toggleMenu">
                    <!--<Icon class="icon iconfont" :class="'icon-' + cos_key" size="24"></Icon>-->
                    {{menuState ? cos_name : ''}}
                </i-button>
                <Menu width="auto" v-if="buckets_info && buckets_info.length > 0"
                      @on-select="onMenuSelect" :active-name="bucketName">
                    <Menu-group class="buckets-menu" title="存储空间">
                        <Menu-item v-for="(item,index) of buckets_info" :key="index" :name="item.name"
                                   :index="index">
                            <template v-if="menuState">
                                <Icon :size="item.size ? item.icon : 25"
                                      :type="item.permission === 1 ? 'md-lock' : 'md-folder'"></Icon>
                                <span class="layout-text">{{item.name}}</span>
                            </template>
                            <template v-else>
                                <span class="layout-icon">{{item.name.substring(0,1)}}</span>
                            </template>
                        </Menu-item>
                    </Menu-group>
                    <Menu-group title="设置">
                        <Menu-item v-for="(item,index) of menus " :name="item.name" :key="item.name">
                            <Icon :size="item.size ? item.icon : 25" :type="item.icon"></Icon>
                            <span class="layout-text" v-if="menuState">{{item.title}}</span>
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
                <router-view ref="bucketPage" :bucketName="bucketName"></router-view>
            </i-col>
        </Row>
        <!-- cos选择框-->
        <Modal v-model="cosChoiceModel" class-name="cosModel vertical-center-modal" :closable="true"
               :mask-closable="true">
            <div class="choice-cos">
                <Card :bordered="false" style="flex-grow: 1;margin: 10px" v-for="item in coss" :key="item.key">
                    <div class="choice-view" @click="selectCOS(item)">
                        <Icon class="iconfont" :class="`icon-${item.key}`" size="32"></Icon>
                        <span class="name">{{item.name}}</span>
                    </div>
                </Card>
                <Card :bordered="false" style="flex-grow: 1;margin: 10px" v-if="coss.length < 3">
                    <div class="choice-view" @click="selectCOS()">
                        <Icon type="md-add-circle" size="32"></Icon>
                        <span class="name">登陆其它</span>
                    </div>
                </Card>
            </div>
            <div slot="footer"></div>
        </Modal>
        <!-- 数据加载框-->
        <Spin size="large" fix v-if="loading.show">
            <Icon type="ios-loading" size=20 class="spin-icon-load"></Icon>
            <span>{{loading.message}}</span>
        </Spin>
        <!-- 上传/下载进度提示框-->
        <div class="status-view" v-bind:class="{'status-view-none' : !status.show}">
            <div>{{status.message}}</div>
            <div>{{status.path}}</div>
        </div>
        <!-- 文件拖拽提示框-->
        <div class="drop-view" v-if="drop.show">
            <div class="drop-sub">
                <span>{{drop.message}}</span>
            </div>
        </div>
    </div>
</template>
<script>
    import {mapGetters, mapActions} from 'vuex';
    import * as types from '../vuex/mutation-types';
    import pkg from '../../../package.json';

    import {Constants, mixins, EventBus, util} from '../service/index';

    export default {
        mixins: [mixins.base],
        data() {
            return {
                coss: [],//已登录的cos列表
                cos: {name: ''},
                cosChoiceModel: false,
                bucketName: '',
                menuState: true,
                appVersion: pkg.version,
                version: {
                    github: Constants.URL.github,
                    url: '',
                    version: '',
                    info: ''
                },
                menus: [{
                    name: Constants.Key.app_setup,
                    icon: 'md-cog',
                    title: '设置'
                }, {
                    name: Constants.Key.app_logout,
                    icon: 'md-exit',
                    title: '注销'
                }],
                status: {
                    show: false,
                    path: '',
                    message: '',
                },
                loading: {
                    show: false,
                    message: '',
                    flag: '' //可以用作统计计时的标记
                },
                drop: {
                    show: false,
                    message: ''
                },
                // contextBucketMenuIndex: 0
            };
        },
        computed: {
            ...mapGetters({
                buckets_info: types.app.buckets_info,
                privatebucket: types.setup.setup_privatebucket,
                setup_recentname: types.setup.setup_recentname,
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

            //this.checkVersion();

            EventBus.$on(Constants.Event.statusview, (option) => {
                this.status = Object.assign(this.status, option);
            });
            EventBus.$on(Constants.Event.dropview, (option) => {
                this.drop = Object.assign(this.drop, option);
            });
            EventBus.$on(Constants.Event.loading, (option) => {
                this.loading = Object.assign(this.loading, option);
            });
        },
        methods: {
            ...mapActions([
                types.app.a_buckets_info,
                types.setup.setup_a_recentname,
            ]),
            initCOS() {
                this.$storage.getCOS(({cos, _cos}) => {
                    if (_cos.length === 0) {
                        this.$router.push({path: Constants.PageName.login});
                    } else if (_cos.length === 1) {
                        this.selectCOS(_cos[0]);
                    } else {
                        this.coss = _cos;
                        this.cosChoiceModel = true;
                    }
                });
            },
            selectCOS(item) {
                this.cos_name = pkg.cnname;
                document.getElementById("title") && (document.getElementById("title").innerText = item.name + "COS客户端");
                this.cos_key = item.key;
                this.$storage.setName(item.key);
                this.$storage.initCOS((result) => {
                    this.cosChoiceModel = false;
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
                        util.notification({
                            body: `获取buckets信息失败. 请确认${this.$storage.name}密钥信息是否正确,且已创建至少一个存储空间`
                        });
                        this.$router.push({path: Constants.PageName.login});
                    } else {
                        let defaultIndex = 0;

                        data.datas.forEach((item, index) => {
                            data.datas[index].permission = 0;
                            if (this.setup_recentname === item.name) {
                                defaultIndex = index;
                            }
                        });
                        this[types.app.a_buckets_info](data.datas);
                        this.onMenuSelect(this[types.app.buckets_info][defaultIndex].name);
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
                        this.setup_a_recentname(name);
                        this.$router.push({name: Constants.PageName.bucketPage, query: {bucketName: name}});
                        break;
                    case Constants.Key.app_switch:
                        this.$storage.getCOS(({_cos}) => {
                            this.coss = _cos;
                            this.cosChoiceModel = true;
                        });
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
            /*handleBucketMenu(ref) {
                this.contextBucketMenuIndex = ref.data.attrs.index;
            },
            handleBucketMenuClick(action) {
                switch (action) {
                    case 0://同步操作
                        if(this.$refs['bucketPage']){
                            this.$refs['bucketPage'].showSyncFolder();
                        }
                        break;
                    case 1://批量导出
                        console.log(this.$refs['bucketPage']);
                        break;
                }
            },*/
        }
    };
</script>
<style lang="scss" scoped>
    @import "../style/params";

    .layout {
        height: 100%;
        .ivu-row-flex {
            height: 100%;
        }

        .layout-menu-left {
            background: $menu-bg;
            color: $menu-color;
            display: flex;
            flex-direction: column;
            border-bottom-right-radius: 4px;
            padding-top: 20px;
            z-index: 1;
            box-shadow: 1px 0 3px 0 rgba(0, 0, 0, 0.1);
            -webkit-app-region: drag;

            .navicon_btn {
                font-weight: bold;
                text-align: left;
                padding-left: 22px;
                color: $menu-color;
                &:hover {
                    color: $primary;
                }
                & > span {
                    display: flex;
                    flex-direction: row;
                    align-items: center;
                }
            }

            .buckets-menu {
                overflow-y: scroll;
                max-height: 400px;
            }

            .ivu-menu-vertical {
                flex-grow: 1;
                .ivu-menu-item {
                    padding: 8px 24px;
                    display: flex;
                    align-items: center;
                    .layout-text {
                        margin-left: 0;
                        line-height: 25px;
                        white-space: nowrap;
                        text-overflow: ellipsis;
                        overflow: hidden;
                    }
                    .layout-icon {
                        margin-left: 0;
                        line-height: 25px;
                        background: rgba(255, 255, 255, .7);
                        width: 25px;
                        color: $fontColor;
                        text-align: center;
                        text-transform: capitalize;
                    }
                }
            }

            .version {
                padding: 10px 20px;
                /*color: #c5c5c5;*/
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

    .choice-cos {
        display: flex;
        flex-direction: row;
        justify-content: space-around;
        .choice-view {
            text-align: center;
            display: flex;
            flex-direction: column;
            .name {
                font-size: 13px;
                margin-top: 5px;
            }
        }
    }

    .status-view {
        opacity: 1;
        position: fixed;
        bottom: 0;
        width: 100%;
        left: 0;
        text-align: left;
        background-color: rgba(0, 0, 0, 0.51);
        color: #FFFFFF;
        padding: 10px;
        font-size: 12px;
        z-index: 901;
        transition: opacity 1s;
    }

    .status-view-none {
        opacity: 0;
        transition: opacity .5s;
    }

    .drop-view {
        position: fixed;
        background-color: rgba(0, 0, 0, 0.1);
        left: 0;
        bottom: 0;
        width: 100%;
        height: 100%;
        z-index: 1;
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        font-size: 16px;
        .drop-sub {
            border: 2px dashed;
            border-radius: 10px;
            width: 90%;
            height: 90%;
            display: flex;
            flex-direction: row;
            justify-content: center;
            align-items: center;
        }
    }
</style>
<style lang="scss">
    @import "../style/params";

    .navicon_btn {
        & > span {
            display: flex;
            flex-direction: row;
            align-items: center;
            & > span {
                margin-left: 6px;
            }
        }
    }

    .vertical-center-modal {
        display: flex;
        align-items: center;
        justify-content: center;

        .ivu-modal {
            top: 0;
        }
    }

    .ivu-modal-footer {
        border-top: 0;
        /*padding: 0;*/
    }

    .cosModel {
        .ivu-modal-footer {
            padding: 0;
            border-top: 0;
        }
    }
</style>