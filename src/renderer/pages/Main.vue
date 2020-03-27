<template>
    <div class="layout">
        <div class="content">
            <div class="layout-menu">
                <i-button type="text" class="navicon_btn">
                    <Icon @click="toggleMenu" class="icon iconfont" :class="'icon-' + cos.key" size="20"></Icon>
                    <span @click="showChangeAlias">{{menuState ? cos.name : ''}}</span>
                </i-button>
                <Menu ref="menu" width="auto" @on-select="onMenuSelect" :active-name="bucketName">
                    <Menu-group class="buckets-menu" title="存储空间">
                        <Menu-item v-for="(item,index) of buckets_info" :key="index" :name="item.name" :index="index">
                            <template v-if="menuState">
                                <Icon :size="item.size ? item.icon : 25"
                                      :type="item.permission === 1 ? 'md-lock' : (bucketName === item.name ? 'md-folder-open' : 'md-folder')"></Icon>
                                <span class="layout-text">{{item.name}}</span>
                            </template>
                            <template v-else>
                                <span class="layout-icon">{{item.name.substring(0,1)}}</span>
                            </template>
                        </Menu-item>
                    </Menu-group>
                    <Menu-group title="设置">
                        <Menu-item v-for="(item,index) of menus " :index="index" :key="item.name" :name="item.name">
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
            </div>
            <div class="layout-content">
                <keep-alive>
                    <router-view ref="bucketPage" :bucketName="bucketName"></router-view>
                </keep-alive>
            </div>
        </div>
        <!-- cos选择框-->
        <Modal v-model="cosChoiceModel" class-name="cosModel vertical-center-modal" :closable="true"
               :mask-closable="false" width="auto">
            <div class="choice-cos">
                <Card :bordered="false" style="margin: 10px;min-width: 80px;" v-for="(item,index) in coses"
                      :key="index">
                    <div class="choice-view" @click="selectCOS(item)">
                        <Icon class="iconfont" :class="`icon-${item.key}`" size="32"></Icon>
                        <span class="name">{{item.name}}</span>
                    </div>
                </Card>
                <Card :bordered="false" style="flex-grow: 1;margin: 10px">
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
        <!-- 分页加载提示框-->
        <Modal v-model="paging.show" class-name="vertical-center-modal"
               ok-text="开启" :closable="true" :mask-closable="false">
            <div class="paging-view">
                <p>当前bucket数据量过大,加载时间过久.是否开启分页加载? </p>

                <p class="client-link"
                   @click="openBrowser('https://github.com/willnewii/qiniuClient/wiki/%E6%95%B0%E6%8D%AE%E5%8A%A0%E8%BD%BD%E6%96%B9%E5%BC%8F')">
                    数据加载方式区别</p>
            </div>
        </Modal>
        <!-- 上传/下载进度提示框-->
        <status-view></status-view>
        <!-- 文件拖拽提示框-->
        <div class="drop-view" v-show="drop.show">
            <div class="drop-sub">
                <span>{{drop.message}}</span>
            </div>
        </div>
        <!-- 别名修改提示框-->
        <Modal v-model="changeAliasDialog.show" class-name="vertical-center-modal"
               ok-text="修改" :closable="true" :mask-closable="false" @on-ok="changeAlias">
            <p>请输入你要修改的别名</p>
            <Input class='modal-url' v-model="changeAliasDialog.name"></Input>
        </Modal>
    </div>
</template>
<script>
    import {mapGetters, mapActions} from 'vuex';
    import * as types from '../vuex/mutation-types';
    import pkg from '../../../package.json';
    import StatusView from '@/components/StatusView';

    import {Constants, mixins, EventBus, util} from '../service/index';

    export default {
        mixins: [mixins.base, mixins.request],
        components: {StatusView},
        data() {
            return {
                coses: [],//已登录的cos列表
                cos: {name: ''},
                cosChoiceModel: false,
                bucketName: '',
                menuState: true,            //menu是否折叠
                appVersion: pkg.version,
                version: {
                    github: Constants.URL.github,
                    url: '',
                    version: '',
                    info: ''
                },
                menus: [{
                    name: Constants.Key.app_switch,
                    icon: 'md-switch',
                    title: '切换'
                }, {
                    name: Constants.Key.app_setup,
                    icon: 'md-cog',
                    title: '设置'
                }, {
                    name: Constants.Key.app_logout,
                    icon: 'md-exit',
                    title: '注销'
                }],
                loading: {
                    show: false,
                    message: '',
                    flag: '' //可以用作统计计时的标记
                },
                paging: {
                    show: false,
                },
                drop: {
                    show: false,
                    message: ''
                },
                changeAliasDialog: {
                    show: false
                }
                // contextBucketMenuIndex: 0
            };
        },
        computed: {
            ...mapGetters({
                buckets_info: types.app.buckets_info,
                recent: types.setup.recent,
            }),
        },
        /**
         * 检查是否有新版本
         * 初始化设置项
         * 初始化COSkey
         */
        created: function () {
            this.checkVersion();

            EventBus.$on(Constants.Event.dropView, (option) => {
                this.drop = Object.assign(this.drop, option);
            });
            EventBus.$on(Constants.Event.loading, (option) => {
                this.loading = Object.assign(this.loading, option);
                /*if (this.loading.show) {
                    console.time(option.flag);
                } else {
                    console.timeEnd(option.flag);
                }*/
            });

            let cos = this.$route.params.cos;
            if (cos) {
                this.selectCOS(cos);
            } else {
                this.initCOS();
            }
        },
        methods: {
            ...mapActions([
                types.app.a_buckets_info,
                types.setup.a_recent,
            ]),
            initCOS() {
                this.$storage.getBindCoses(({coses}) => {
                    if (coses.length === 0) {
                        this.$router.push({path: Constants.PageName.login});
                    } else {
                        let recentCOS = null;
                        for (let i = 0; i < coses.length; i++) {
                            if (coses[i].uuid === this.recent.uuid) {
                                recentCOS = coses[i];
                                break;
                            }
                        }

                        if (recentCOS) {
                            this.selectCOS(recentCOS);
                        } else if (coses.length === 1) {
                            this.selectCOS(coses[0]);
                        } else {
                            this.coses = coses;
                            this.cosChoiceModel = true;
                        }
                    }
                });
            },
            selectCOS(item) {
                if (item === undefined) {
                    this.$router.push({path: Constants.PageName.login});
                    return;
                }

                document.getElementById("title") && (document.getElementById("title").innerText = item.name);
                this.cos = item;
                this.changeAliasDialog.name = this.cos.name ;
                this.$storage.initCOS(item, (result) => {
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
                            item.permission = 0;
                            if (this.recent.bucket === item.name) {
                                defaultIndex = index;
                            }
                        });
                        this[types.app.a_buckets_info](data.datas);

                        this.onMenuSelect(this[types.app.buckets_info][defaultIndex].name);
                        this.$nextTick(() => {// COS切换后,menu没有active样式,手动调用一下
                            this.$refs['menu'].updateActiveName();
                        });
                    }
                });
            },
            checkVersion() {
                this.doRequset(Constants.URL.releases, null, (result) => {
                    if (result.tag_name > pkg.version) {
                        this.version.url = result.html_url;
                        this.version.version = result.tag_name;
                        this.version.info = result.body;
                    }
                });
            },
            showChangeAlias(){
                this.changeAliasDialog.show = true;
            },
            changeAlias() {
                this.cos.name = this.changeAliasDialog.name ;
                this.$storage.updateCosKey(this.cos);
            },
            toggleMenu() {
                this.menuState = !this.menuState;
            },
            onMenuSelect(name) {
                switch (name) {
                    default:
                        this.bucketName = name;
                        this[types.setup.a_recent]({
                            uuid: this.cos.uuid,
                            bucket: name
                        });
                        this.$router.push({name: Constants.PageName.bucketPage, query: {bucketName: name}});
                        break;
                    case Constants.Key.app_switch:
                        this.$storage.getBindCoses(({coses}) => {
                            this.coses = coses;
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
                                this.$storage.cleanCosKey(this.$storage.info, () => {
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
    @import "../style/params";

    .layout {
        height: 100%;

        .content {
            height: 100%;
            display: flex;
            flex-direction: row;

            .layout-menu {
                background: $menu-bg;
                color: $menu-color;
                display: flex;
                flex-direction: column;
                border-bottom-right-radius: 4px;
                padding-top: 20px;
                z-index: 1;
                box-shadow: 1px 0 3px 0 rgba(0, 0, 0, 0.1);
                -webkit-app-region: drag;
                max-width: 180px;

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
                    overflow-y: auto;
                    max-height: 400px;

                    /*
                    overflow-y: auto;

                    &:hover {//鼠标放上去的时候才显示滚动条.但是由于滚动条的显示与消失,会产生页面的抖动
                        overflow-y: scroll;
                    }*/
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

            .layout-content {
                flex-grow: 1;
                overflow-x: auto;
            }
        }

    }

    .paging-view {
        //display: flex;
        //flex-direction: row;
        //justify-content: space-around;
        font-size: 14px;
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
