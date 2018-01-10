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
            <DirTag :bucket="bucket" @on-click="changeDir"></DirTag>

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
        <!-- 多选-->
        <Modal
                v-model="Model_DeleteAsk"
                title="确认删除文件？"
                @on-ok="doRemoves">
            <p v-for="file in bucket.selection">{{file.key}}</p>
        </Modal>
        <!-- 单选-->
        <Modal
                v-model="Model_DeleteAsk2"
                title="确认删除文件？"
                @on-ok="doRemove"
                @on-cancel="cancelModal">
            <p>{{Model_DeleteAskKey}}</p>
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

    import * as CloudStorage from "../bean/CloudStorage";

    export default {
        name: 'bucketPage',
        components: {
            ResourceGrid,
            DirTag, ClientHeader, ResourceTable
        },
        mixins: [mixin_base],
        props: {
            bucketName: {
                type: String,
                default: ''
            }
        },
        data() {
            return {
                bucket: null,
                //控制显示时机,不然resource-table/grid 组件在初始化时会出现高度计算错误.
                isLoaded: false,
                Model_DeleteAsk: false,
                Model_DeleteAsk2: false,
                Model_DeleteAskKey: ''
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
                this.bucket = CloudStorage.generateBucket(bucketName);
                this.bucket.init(this);
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
            doSearch: function (dir, search) {
                this.bucket.search(dir, search);
            },
            /**
             * 切换目录
             * @param dir
             */
            changeDir: function (dir) {
                this.bucket.setCurrentDir(dir);
            },
            removes() {
                if (this.setup_deleteNoAsk) {
                    this.doRemoves();
                } else {
                    this.Model_DeleteAsk = true;
                }
            },
            doRemoves() {
                EventBus.$emit(Constants.Event.removes);
            },
            remove(key) {
                if (this.setup_deleteNoAsk) {
                    this.doRemove();
                } else {
                    this.Model_DeleteAskKey = key;
                    this.Model_DeleteAsk2 = true;
                }
            },
            doRemove() {
                this.Model_DeleteAskKey = '';
                EventBus.$emit(Constants.Event.remove);
            },
            cancelModal() {
                this.Model_DeleteAskKey = '';
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
                if (action === 'remove') {//如果是删除操作,直接更新当前目录
                    this.getResources(this.bucket.currentDir);
                } else {
                    let dir = '';
                    if (ret && ret.key) {
                        dir = util.getPrefix(ret.key);
                        this.bucket.setCurrentDir(dir);
                    } else {
                        this.getResources();
                    }
                }
            }
        }

    };
</script>