<style lang="scss" scoped>
    @import '../style/params';

    .bucketpage {
        background-color: $bg-bucketpage;
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
                color: $fontColor;

                .bread-sub {
                    flex-shrink: 0;

                    .ivu-breadcrumb-item-separator {
                        color: $fontColor;
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

            .icon {
                font-size: 14px;
            }

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
            color: $fontColor;
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
                <span class="size">共{{totalSize}} 存储量</span>
            </div>

            <div class="header-button-view">
                <Button size="small" @click="showFilter" icon="md-funnel"
                        style="margin-right: 10px;background: #FFFFFF;">
                </Button>

                <Button size="small" @click="cleanSelection()"
                        style="margin-right: 10px;"
                        v-if="bucket.selection.length > 0">取消
                </Button>

                <Button size="small" @click="allSelection()"
                        style="margin-right: 10px;"
                        v-if="bucket.selection.length > 0">全选
                </Button>

                <Button size="small" @click="downloads()" icon="md-download"
                        style="margin-right: 10px;"
                        v-if="bucket.selection.length > 0">下载({{bucket.selection.length}})
                </Button>

                <Button type="error" size="small" @click="askRemove()" icon="md-trash"
                        style="margin-right: 10px;"
                        v-if="bucket.selection.length > 0">删除({{bucket.selection.length}})
                </Button>

                <Button-group size="small">
                    <Button :type="showType === 0 ? 'primary' : 'default'" @click="changeShowType(0)"
                            icon="md-list"></Button>
                    <!--<Button :type="showType === 1 ? 'primary' : 'ghost'" @click="changeShowType(1)" icon="images"></Button>-->
                    <Button :type="showType === 1 ? 'primary' : 'default'" @click="changeShowType(1)"
                            icon="md-folder"></Button>
                </Button-group>
                <Button-group size="small" style="margin-left: 10px;" v-if="bucket.marker">
                    <Button @click="getResources({keyword:bucket.folderPath})" icon="ios-arrow-forward"></Button>
                </Button-group>
            </div>
        </div>

        <!--<resource-table v-if="showType === 0" :bucket="bucket" ></resource-table>-->
        <resource-grid ref="resource-grid" :bucket="bucket" :type="showType" key="1"></resource-grid>

        <resource-filter ref="resource-filter" :bucket="bucket"></resource-filter>

        <Modal v-model="model_DeleteAsk" title="确认删除文件？" class-name="vertical-center-modal" @on-ok="callRemove"
               @on-cancel="cleanSelection">
            <div class="file-list">
                <template>
                    <p v-for="file in bucket.selection">{{file.key}}</p>
                </template>
            </div>

        </Modal>

        <Modal v-model="model_merge.show" title="请选择同步方式" class-name="vertical-center-modal"
               @on-ok="syncFolder">
            <template>
                <RadioGroup v-model="model_merge.mode" vertical>
                    <Radio :label="0">
                        <span>合并</span>
                    </Radio>
                    <Radio :label="1">
                        <span>覆盖云盘(以本地文件为基准,云盘未对应的文件会被删除)</span>
                    </Radio>
                    <Radio :label="2">
                        <span>覆盖本地(以云盘文件为基准,本地未对应的文件会被删除)</span>
                    </Radio>
                </RadioGroup>
            </template>
        </Modal>
    </div>
</template>
<script>
    import Header from '@/components/Header';
    import ResourceGrid from "@/components/ResourceGrid.vue";
    import ResourceFilter from "@/components/ResourceFilter";

    import {mapGetters, mapActions} from 'vuex';
    import * as types from '../vuex/mutation-types';

    import {Constants, util, EventBus, mixins} from '../service/index';
    import dayjs from 'dayjs';

    export default {
        name: 'bucketPage',
        components: {
            Header, ResourceGrid, ResourceFilter,
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
                model_DeleteAsk: false,
                model_query_show: false,
                model_merge: {
                    show: false,
                    mode: 0
                }
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
                this.model_DeleteAsk = true;
            },
            callRemove() {
                EventBus.$emit(Constants.Event.resourceAction, this.bucket.selection, Constants.ActionType.remove);
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
            showSyncFolder() {
                this.model_merge.show = true;
                this.model_merge.mode = 0;
            },
            syncFolder() {
                let files = this.bucket.files;
                files.forEach((item, index) => {
                    files[index].url = this.$refs['resource-grid'].getResourceUrl(item);
                });

                this.$electron.ipcRenderer.send(Constants.Listener.syncDirectory, {
                    properties: ['openDirectory'],
                    files,
                    type: this.$storage.key,
                    mergeType: this.model_merge.mode,
                });
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
