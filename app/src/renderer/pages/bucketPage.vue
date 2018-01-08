<style lang="scss" scoped>
    .layout-copy {
        text-align: center;
        padding: 10px 0 20px;
        color: #9ea7b4;
    }

    .dir-layout {
        display: flex;
        flex-direction: row;
        align-items: center;
        padding: 15px 15px 0 15px;
    }
</style>
<template>
    <div class="layout" v-if="bucket">
        <ClientHeader :bucket="bucket" @on-update="onTableUpdate" @on-search="doSearch"></ClientHeader>

        <div class="dir-layout">
            <DirTag :bucket="bucket" @on-click="doDirTag"></DirTag>

            <Button type="ghost" size="small" @click="downloads()" icon="ios-download"
                    style="margin-right: 10px;background: #FFFFFF;"
                    v-if="bucket.selection.length > 0">下载({{bucket.selection.length}})
            </Button>

            <Button type="error" size="small" @click="removes()" icon="trash-b" style="margin-right: 10px;"
                    v-if="bucket.selection.length > 0">删除({{bucket.selection.length}})
            </Button>

            <Button-group size="small" style="background: #FFF;margin-right: 10px;display: flex;">
                <Button :type="bucket.showType === 0 ? 'primary' : 'ghost'" @click="showType(0)"
                        icon="navicon-round"></Button>
                <Button :type="bucket.showType === 1 ? 'primary' : 'ghost'" @click="showType(1)" icon="images"></Button>
            </Button-group>

            <Button-group size="small" style="background: #FFF" v-if="bucket.marker">
                <Button type="ghost" @click="getResources" icon="chevron-right"></Button>
            </Button-group>
        </div>

        <resource-table v-if="isLoaded && bucket.showType === 0" :bucket="bucket"
                        @on-update="onTableUpdate"></resource-table>
        <resource-grid v-else-if="isLoaded && bucket.showType === 1" :bucket="bucket"
                       @on-update="onTableUpdate"></resource-grid>
        <Modal
                v-model="Model_DeleteAsk"
                title="确认删除文件？"
                @on-ok="doRemove">
            <p v-for="file in bucket.selection">{{file.key}}</p>
        </Modal>
    </div>
</template>
<script>
    import DirTag from '../components/Main/DirTag.vue';
    import ClientHeader from '../components/Main/ClientHeader.vue';
    import ResourceTable from '../components/Main/ResourceTable.vue';
    import ResourceGrid from "../components/Main/ResourceGrid.vue";

    import {mapGetters} from 'vuex';
    import * as types from '../vuex/mutation-types';

    import mixin_base from "../mixins/mixin-base";
    import {Constants, util, EventBus} from '../service/index';

    import Bucket from "../bean/Bucket";

    export default {
        name: 'bucketPage',
        components: {
            ResourceGrid,
            DirTag, ClientHeader, ResourceTable
        },
        mixins: [mixin_base],
        props: {
            bucketname: {
                type: String,
                default: ''
            }
        },
        data() {
            return {
                bucket: null,
                //控制显示时机,不然resource-table/grid 组件在初始化时会出现高度计算错误.
                isLoaded: false,
                Model_DeleteAsk: false
            };
        },
        computed: {
            ...mapGetters({
                privatebucket: types.APP.setup_privatebucket,
                setup_deleteNoAsk: types.APP.setup_deleteNoAsk,
                customeDomains: types.APP.setup_customedomain
            })
        },
        watch: {
            bucketname: function (val, oldVal) {
                if (val && oldVal !== val) {
                    this.initBucket(val);
                }
            }
        },
        mounted() {
            if (this.$route.query && this.$route.query.bucketname) {
                if (this.bucket && this.$route.query.bucketname !== this.bucket.name) {
                    this.initBucket(this.$route.query.bucketname);
                }
            }
        },
        methods: {
            /**
             * 初始化空间信息
             */
            initBucket(bucketname) {
                this.bucket = new Bucket(bucketname);
                this.bucket.checkPrivate(this.privatebucket);

                this.getDomains();
                this.getDir();
                this.getResources();
            },
            getDomains() {
                this.doRequsetGet(Constants.method.getDomains, {tbl: this.bucket.name}, (response) => {
                    if (!response)
                        return;

                    this.bucket.setDomains(response.data, this.customeDomains);
                });
            },
            /**
             * 获取该bucket下的目录
             * @param marker 上一次列举返回的位置标记，作为本次列举的起点标记
             */
            getDir(marker) {//获取目录
                let data = {
                    bucket: this.bucket.name,
                    delimiter: '/',
                    limit: 1000
                };
                if (marker) {
                    data.marker = marker;
                }

                this.doRequset(Constants.method.getResources, data, (response) => {
                    if (!response)
                        return;

                    this.bucket.setDirs(response.data);

                    response.data.marker && this.getDir(response.data.marker);
                });
            },
            /**
             * 获取指定前缀文件列表
             */
            getResources(keyword) {
                this.bucket.selection = [];

                let data = {
                    bucket: this.bucket.name,
                    limit: 30
                };

                if (keyword) {
                    data.prefix = keyword;
                }

                if (this.bucket.marker) {
                    data.marker = this.bucket.marker;
                }
                this.doRequset(Constants.method.getResources, data, (response) => {
                    if (!response)
                        return;

                    this.bucket.setResources(response.data);
                    this.isLoaded = true;
                });
            },
            /**
             *  dir：目录
             *  search：关键字
             */
            doSearch: function (dir, search) {
                this.bucket.marker = '';
                this.getResources(search ? dir + search : dir);
            },
            /**
             * Dir 组件 搜索
             * @param search
             */
            doDirTag: function (search) {
                this.bucket.currentDir = search;
                this.bucket.marker = '';

                if (search === Constants.Key.withoutDelimiter) {
                    this.bucket.files = this.bucket.withoutDelimiterFiles;
                } else {
                    this.doSearch(this.bucket.currentDir);
                }
            },
            removes() {
                if (this.setup_deleteNoAsk) {
                    this.doRemove();
                } else {
                    this.Model_DeleteAsk = true;
                }
            },
            doRemove() {
                EventBus.$emit(Constants.Event.removes);
            },
            downloads() {
                EventBus.$emit(Constants.Event.download);
            },
            /**
             * 表单模式/图片模式
             * @param type
             */
            showType(type) {
                this.bucket.selection = [];
                this.bucket.showType = type;
            },
            /**
             * table数据项更新回调
             * @param ret 变更的资源
             * @param action 触发的动作,upload/remove
             */
            onTableUpdate(ret, action) {
                let keyword = '';
                if (ret && ret.key) {
                    keyword = util.getPrefix(ret.key);
                    this.bucket.currentDir = keyword;
                }
                this.getResources(keyword);
            }
        }

    };
</script>