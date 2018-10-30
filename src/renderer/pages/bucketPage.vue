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
            overflow-x: scroll;
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
        <Header :bucket="bucket" @on-update="onFilesUpdate" @on-search="doSearch"></Header>

        <div class="dir-layout">
            <div class="header-dir-view">
                <Breadcrumb separator=">">
                    <div class="bread-sub" @click="changeFolderPath(-1)">
                        <BreadcrumbItem>
                            <Icon type="md-home" size="14"></Icon>
                        </BreadcrumbItem>
                    </div>
                    <template v-if="bucket.folderPath">
                        <div class="bread-sub" v-for="(item,index) in bucket.folderPath.split('/')"
                             @click="changeFolderPath(index)">
                            <BreadcrumbItem>
                                {{item}}
                            </BreadcrumbItem>
                        </div>
                    </template>
                </Breadcrumb>
            </div>

            <div class="header-info-view">
                <span class="icon iconfont icon-wenjian"></span>
                <span class="count">共{{bucket.files.length}}个 文件</span>
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
                    <Button @click="getResources()" icon="ios-arrow-forward"></Button>
                </Button-group>
            </div>
        </div>

        <!--<resource-table v-if="showType === 0" :bucket="bucket"
                        @on-update="onFilesUpdate"></resource-table>-->
        <resource-grid :bucket="bucket" :type="showType" key="1"
                       @on-update="onFilesUpdate" :keyWord="folderKeyWord"></resource-grid>

        <resource-filter ref="resource-filter" :bucket="bucket"></resource-filter>

        <Modal v-model="model_DeleteAsk" title="确认删除文件？" class-name="vertical-center-modal"
               @on-ok="callRemove" @on-cancel="cleanSelection">
            <template>
                <p v-for="file in bucket.selection">{{file.key}}</p>
            </template>
        </Modal>

    </div>
</template>
<script>
    import Header from '../components/Header';
    import ResourceTable from '../components/ResourceTable.vue';
    import ResourceGrid from "../components/ResourceGrid.vue";

    import {mapGetters} from 'vuex';
    import * as types from '../vuex/mutation-types';

    import {Constants, util, EventBus, mixins} from '../service/index';
    import ResourceFilter from "@/components/ResourceFilter";

    export default {
        name: 'bucketPage',
        components: {
            ResourceFilter,
            Header, ResourceGrid, ResourceTable
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
                showType: 1, //0:列表 1:folder
                folderPath: null,
                folderKeyWord: null,
                model_DeleteAsk: false,
                model_query_show: false
            };
        },
        computed: {
            ...mapGetters({
                buckets_info: types.app.buckets_info,
                privatebucket: types.setup.setup_privatebucket,
                setup_deleteNoAsk: types.setup.setup_deleteNoAsk,
                customeDomains: types.setup.setup_customedomain
            }),
            totalSize() {
                let totalSzie = 0;
                if (this.bucket && this.bucket.files) {
                    this.bucket.files.forEach((item) => {
                        totalSzie += item.fsize;
                    });
                }
                return util.formatFileSize(totalSzie);
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
                if (!this.bucket || this.$route.query.bucketName !== this.bucket.name) {
                    this.initBucket(this.$route.query.bucketName);
                } else {
                    console.log('mounted: error');
                }
            }
        },
        methods: {
            /**
             * 初始化空间信息
             */
            initBucket(bucketName) {
                this.bucket = this.$storage.cos.generateBucket(bucketName);
                this.bucket.bindPage(this);
            },
            /**
             * 获取指定前缀文件列表
             */
            getResources(keyword) {
                this.bucket.getResources(keyword);
            },
            /**
             *  dir：目录
             *  search：关键字
             */
            doSearch: function (search) {
                this.folderKeyWord = search;
            },
            /**
             * 根据配置,是否弹出确认框
             */
            askRemove() {
                if (this.setup_deleteNoAsk) {
                    this.callRemove();
                } else {
                    this.model_DeleteAsk = true;
                }
            },
            callRemove() {
                EventBus.$emit(Constants.Event.removes);
            },
            cleanSelection() {
                this.bucket.selection = [];
            },
            downloads() {
                EventBus.$emit(Constants.Event.download);
            },
            /**
             * 表单模式/图片模式
             * @param type
             */
            changeShowType(type) {
                this.bucket.selection = [];
                this.showType = type;
            },
            /**
             * table数据项更新回调
             * @param ret 变更的资源
             * @param action 触发的动作,upload/remove
             */
            onFilesUpdate(ret, action) {
                this.getResources();
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
        }

    };
</script>