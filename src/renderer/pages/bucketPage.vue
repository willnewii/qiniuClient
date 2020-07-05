<style lang="scss" scoped>
    @import '../style/params';

    .bucketpage {
        background-color: var(--bg-bucketpage);
        height: 100%;
        display: flex;
        flex-direction: column;
    }

    .dir-layout {
        display: flex;
        flex-direction: row;
        align-items: center;
        padding: 15px;
        flex-shrink: 0;

        .header-dir-view {
            flex-grow: 1;
            flex-shrink: 1;
            overflow-x: auto;
            margin-right: 10px;

            .ivu-breadcrumb {
                display: flex;
                flex-direction: row;
                color: var(--fontColor);

                .bread-sub {
                    flex-shrink: 0;

                    .ivu-breadcrumb-item-separator {
                        color: var(--fontColor);
                    }
                }
            }

            /*&:hover {
                overflow-x: scroll;
            }*/
        }

        .header-info-view {
            display: flex;
            flex-direction: row;
            align-items: center;
            flex-shrink: 0;
            margin-right: 10px;
            font-weight: 500;
            font-size: 12px;

            .count {
                margin-right: 5px;
                padding-left: 5px;
            }

            .size {
                padding-left: 5px;
            }
        }

        .header-button-view {
            display: flex;
            flex-direction: row;
            flex-shrink: 0;
            button {
                font-size: 12px;
                font-weight: 500;
            }

            .btn {
                margin-right: 10px;
            }
        }
    }

    .file-list {
        margin-top: 10px;
        max-height: 300px;
        overflow-y: scroll;
        overflow-x: hidden;
        word-break: break-all;
    }
</style>
<style lang="scss">
    @import '../style/params';

    .bread-sub {
        .ivu-breadcrumb-item-separator {
            color: var(--fontColor);
        }
    }
</style>
<template>
    <div class="bucketpage" v-if="bucket">
        <Header :bucket="bucket"></Header>

        <div class="dir-layout">
            <div class="header-dir-view horizontal">
                <Breadcrumb separator=">">
                    <div class="bread-sub" @click="changeFolderPath(-1)">
                        <BreadcrumbItem>
                            <Icon type="md-home" size="14"></Icon>
                        </BreadcrumbItem>
                    </div>
                    <template v-if="bucket.folderPath">
                        <div class="bread-sub" v-for="(item,index) in bucket.folderPath.split('/')"
                             @click="changeFolderPath(index)">
                            <BreadcrumbItem>{{item}}</BreadcrumbItem>
                        </div>
                    </template>
                </Breadcrumb>
            </div>

            <div class="header-info-view">
                <span class="icon iconfont icon-wenjian"></span>
                <span class="count">共{{totalCount}}个 文件</span>
                <span class="icon iconfont icon-fuwuqi"></span>
                <span class="count">共{{totalSize}} 存储量</span>
            </div>

            <div class="header-button-view">
                <template v-if="bucket.selection.length > 0">
                    <Button class="btn" size="small" @click="cleanSelection()">取消</Button>

                    <Button class="btn" size="small" @click="allSelection()">全选</Button>

                    <Button class="btn" size="small" @click="callRefreshUrls()" icon="md-sync" v-feature:refreshCDN="bucket.key">刷新缓存({{bucket.selection.length}})</Button>

                    <Button class="btn" size="small" @click="downloads()" icon="md-download">下载({{bucket.selection.length}})</Button>

                    <Button class="btn" size="small" @click="askRemove()" icon="md-trash" type="error">删除({{bucket.selection.length}})</Button>
                </template>

                <Button class="button-margin" style="margin-right: 10px" size="small" @click="showFilter" icon="md-funnel"></Button>

                <Button-group size="small">
                    <Button :type="showType === 0 ? 'primary' : 'default'" @click="changeShowType(0)" icon="md-list"></Button>
                    <Button :type="showType === 1 ? 'primary' : 'default'" @click="changeShowType(1)" icon="md-folder"></Button>
                </Button-group>

                <Button-group size="small" style="margin-left: 10px;" v-if="bucket.marker">
                    <Button @click="getResources({keyword:bucket.folderPath})" icon="ios-arrow-forward"></Button>
                </Button-group>
            </div>
        </div>

        <!--<resource-table v-if="showType === 0" :bucket="bucket" ></resource-table>-->
        <resource-list ref="resource-grid" :bucket="bucket" :type="showType" key="1"></resource-list>

        <resource-filter ref="resource-filter" :bucket="bucket"></resource-filter>

        <Modal v-model="modelDeleteAsk" title="确认删除文件？" class-name="vertical-center-modal" @on-ok="callRemove"
               @on-cancel="cleanSelection">
            <div class="file-list">
                <template>
                    <p v-for="file in bucket.selection">{{file.key}}</p>
                </template>
            </div>

        </Modal>
    </div>
</template>
<script>
    import Header from '@/components/Header';
    import ResourceList from "@/components/ResourceList.vue";
    import ResourceFilter from "@/components/ResourceFilter";

    import {mapGetters, mapActions} from 'vuex';
    import * as types from '../vuex/mutation-types';

    import {Constants, util, EventBus, mixins} from '../service/index';
    import dayjs from 'dayjs';

    export default {
        name: 'bucketPage',
        components: {
            Header, ResourceList, ResourceFilter,
        },
        mixins: [mixins.base],
        props: {
            bucketName: {
                type: String,
                default: ''
            }
        },
        data() {
            return {
                bucket: null,
                showType: -1, //0:列表 1:folder
                folderPath: null,
                modelDeleteAsk: false,
            };
        },
        computed: {
            ...mapGetters({
                buckets_info: types.app.buckets_info,
                privatebucket: types.setup.privatebucket,
                paging: types.setup.paging,
                setup_deleteNoAsk: types.setup.deleteNoAsk,
                setup_https: types.setup.https,
                setup_showType: types.setup.showType,
                setup_deadline: types.setup.deadline,
                customeDomains: types.setup.customedomain
            }),
            totalSize() {
                let totalSzie = 0;

                if (this.bucket.space) {
                    totalSzie = this.bucket.space;
                } else if (this.bucket && this.bucket.files) {
                    this.bucket.files.forEach((item) => {
                        totalSzie += item.fsize;
                    });
                }
                return util.formatFileSize(totalSzie);
            },
            totalCount() {
                let totalCount = 0;

                if (this.bucket.count) {
                    totalCount = this.bucket.count;
                } else if (this.bucket && this.bucket.files) {
                    totalCount = this.bucket.files.length;
                }
                return totalCount;
            }
        },
        watch: {
            bucketName: function (val, oldVal) {
                if (val && oldVal !== val) {
                    this.initBucket(val);
                }
            }
        },
        mounted() {
            if (this.$route.query && this.$route.query.bucketName) {
                this.initBucket(this.$route.query.bucketName);
            } else {
                console.log('mounted: error');
            }
        },
        methods: {
            ...mapActions([
                types.app.a_update_buckets_info,
                types.setup.a_showType
            ]),
            /**
             * 初始化空间信息
             */
            initBucket(bucketName) {
                if (this.$storage.cos) {
                    this.bucket = this.$storage.cos.generateBucket(bucketName);
                    this.bucket.bindPage(this);
                    this.showType = this.setup_showType;
                }
            },
            /**
             * 获取指定前缀文件列表
             */
            getResources(option) {
                this.bucket.getResources(option);
            },
            /**
             * 根据配置,是否弹出删除确认框
             */
            askRemove() {
                this.modelDeleteAsk = true;
            },
            callRemove() {
                EventBus.$emit(Constants.Event.resourceAction, this.bucket.selection, Constants.ActionType.remove);
                this.bucket.selection = [];
            },
            callRefreshUrls() {
                EventBus.$emit(Constants.Event.resourceAction, this.bucket.selection, Constants.ActionType.refreshUrls);
                this.bucket.selection = [];
            },
            //取消选择
            cleanSelection() {
                this.bucket.selection = [];
            },
            //全部选择
            allSelection() {
                this.$refs['resource-grid'].selection = [];
                this.bucket.selection = [];
                for (let i = 0; i < this.$refs['resource-grid'].files.length; i++) {
                    this.$refs['resource-grid'].selectFile(i);
                }
            },
            downloads() {
                EventBus.$emit(Constants.Event.resourceAction, this.bucket.selection, Constants.ActionType.download);
                this.bucket.selection = [];
            },
            /**
             * list/grid
             * @param type
             */
            changeShowType(type) {
                this.bucket.selection = [];
                this[types.setup.a_showType](type);

                this.showType = type;
            },
            changeFolderPath(index) {
                if (index === -1) {
                    this.bucket.folderPath = '';
                    return;
                }
                let arrays = this.bucket.folderPath.split('/');
                this.bucket.folderPath = arrays.slice(0, index + 1).join('/');
            },
            showFilter() {
                this.$refs['resource-filter'].toggle();
            },
            exportURL() {//导出URL
                let urls = [];
                this.bucket.files.forEach((item) => {
                    urls.push(this.$refs['resource-grid'].getResourceUrl(item));
                });

                this.$electron.ipcRenderer.send(Constants.Listener.exportUrl, {
                    name: `${this.$storage.name}-${this.bucket.name}-${dayjs().format('YYYYMMDDHHmmss')}.txt`,
                    urls,
                });
            },
        }

    };
</script>
