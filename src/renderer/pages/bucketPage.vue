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
        <Header :bucket="bucket" @on-update="onTableUpdate" @on-search="doSearch"></Header>

        <div class="dir-layout">
            <div style="flex-grow: 1">
                <Breadcrumb v-if="showType === 2">
                    <span @click="changeFolderPath(-1)">
                        <BreadcrumbItem>
                            <Icon type="android-home"></Icon>
                        </BreadcrumbItem>
                    </span>
                    <template v-if="folderPath">
                         <span v-for="(item,index) in folderPath.split('/')" @click="changeFolderPath(index)">
                        <BreadcrumbItem>
                            {{item}}
                        </BreadcrumbItem>
                    </span>
                    </template>
                </Breadcrumb>
                <Directory v-if="showType !== 2" :bucket="bucket" @on-click="changeDir"></Directory>
            </div>
            <Button type="ghost" size="small" @click="query()" icon="funnel"
                    style="margin-right: 10px;background: #FFFFFF;">
            </Button>

            <Button type="ghost" size="small" @click="downloads()" icon="ios-download"
                    style="margin-right: 10px;background: #FFFFFF;"
                    v-if="bucket.selection.length > 0">下载({{bucket.selection.length}})
            </Button>

            <Button type="error" size="small" @click="askRemove()" icon="trash-b" style="margin-right: 10px;"
                    v-if="bucket.selection.length > 0">删除({{bucket.selection.length}})
            </Button>

            <Button-group size="small" style="background: #FFF;margin-right: 10px;display: flex;">
                <Button :type="showType === 0 ? 'primary' : 'ghost'" @click="changeShowType(0)"
                        icon="navicon-round"></Button>
                <Button :type="showType === 1 ? 'primary' : 'ghost'" @click="changeShowType(1)" icon="images"></Button>
                <Button :type="showType === 2 ? 'primary' : 'ghost'" @click="changeShowType(2)" icon="folder"></Button>
            </Button-group>

            <Button-group size="small" style="background: #FFF" v-if="bucket.marker">
                <Button type="ghost" @click="getResources()" icon="chevron-right"></Button>
            </Button-group>
        </div>

        <resource-table v-if="showType === 0" :bucket="bucket"
                        @on-update="onTableUpdate"></resource-table>
        <resource-grid v-else-if="showType === 1" :bucket="bucket"
                       @on-update="onTableUpdate"></resource-grid>
        <resource-grid v-else-if="showType === 2" :bucket="bucket" :type="1" key="1"
                       @on-update="onTableUpdate" @onPathUpdate="onPathUpdate"
                       :_folderPath="folderPath"></resource-grid>
        <Modal
                v-model="model_DeleteAsk"
                title="确认删除文件？"
                @on-ok="callRemove"
                @on-cancel="cancelModal">
            <p v-if="model_DeleteAskKey">{{model_DeleteAskKey}}</p>
            <template v-else>
                <p v-for="file in bucket.selection">{{file.key}}</p>
            </template>
        </Modal>
        <!-- 筛选文件-->
        <Modal v-model="model_Query.show" title="请选择你要筛选的范围" @on-ok="filter">
            <span>按文件大小：</span>
            {{tipFormatSize(model_Query.fileSize[0])}} ~ {{tipFormatSize(model_Query.fileSize[1])}}
            <Slider v-model="model_Query.fileSize" range :min='0' :max="model_Query.sizeArray.length -1"
                    show-tip="never"></Slider>
            <span>按文件日期：</span>
            {{tipFormatDate(model_Query.fileDate[0])}} ~ {{tipFormatDate(model_Query.fileDate[1])}}
            <Slider v-model="model_Query.fileDate" range :min="0" :max="model_Query.dateArray.length -1"
                    show-tip="never"></Slider>
        </Modal>
    </div>
</template>
<script>
    import Directory from '../components/Directory';
    import Header from '../components/Header';
    import ResourceTable from '../components/ResourceTable.vue';
    import ResourceGrid from "../components/ResourceGrid.vue";

    import {mapGetters} from 'vuex';
    import * as types from '../vuex/mutation-types';

    import {Constants, util, EventBus, mixins} from '../service/index';

    export default {
        name: 'bucketPage',
        components: {
            Header, Directory,
            ResourceGrid, ResourceTable
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
                showType: 0, //0:列表 1:grid 2:folder
                folderPath: null,
                model_DeleteAsk_Multiple: false,
                model_DeleteAsk: false,
                model_DeleteAskKey: '',
                model_Query: {
                    show: false,
                    fileSize: [0, 0],
                    sizeArray: [],
                    fileDate: [0, 0],
                    dateArray: []
                }
            };
        },
        computed: {
            ...mapGetters({
                buckets_info: types.app.buckets_info,
                privatebucket: types.setup.setup_privatebucket,
                setup_deleteNoAsk: types.setup.setup_deleteNoAsk,
                customeDomains: types.setup.setup_customedomain
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
            /**
             * 根据配置,是否弹出确认框
             */
            askRemove(key) {
                this.model_DeleteAskKey = key;
                if (this.setup_deleteNoAsk) {
                    this.callRemove();
                } else {
                    this.model_DeleteAsk = true;
                }
            },
            callRemove() {
                if (this.model_DeleteAskKey) {
                    this.model_DeleteAskKey = '';
                    EventBus.$emit(Constants.Event.remove);
                } else {
                    EventBus.$emit(Constants.Event.removes);
                }
            },
            cancelModal() {
                this.model_DeleteAskKey = '';
            },
            query() {
                this.model_Query.show = true;

                this.model_Query.sizeArray = [].concat(this.bucket.files);
                this.model_Query.dateArray = [].concat(this.bucket.files);

                this.model_Query.sizeArray = util.quickSort(this.model_Query.sizeArray, 'fsize');
                this.model_Query.dateArray = util.quickSort(this.model_Query.dateArray, 'putTime');

                this.model_Query.fileSize = [0, this.bucket.files.length - 1];
                this.model_Query.fileDate = [0, this.bucket.files.length - 1];
            },
            filter() {
                let result = [];

                let sizeMin = this.model_Query.sizeArray[this.model_Query.fileSize[0]].fsize;
                let sizeMax = this.model_Query.sizeArray[this.model_Query.fileSize[1]].fsize;

                let dateMin = this.model_Query.dateArray[this.model_Query.fileDate[0]].putTime;
                let dateMax = this.model_Query.dateArray[this.model_Query.fileDate[1]].putTime;

                this.model_Query.sizeArray.forEach((item) => {
                    if (item.fsize >= sizeMin && item.fsize <= sizeMax && item.putTime >= dateMin && item.putTime <= dateMax) {
                        result.push(item);
                    }
                });

                this.bucket.currentDir = '__filter__';
                this.bucket.files = result;
            },
            tipFormatSize(value) {
                if (this.model_Query.sizeArray && this.model_Query.sizeArray.length > 0) {
                    return util.formatFileSize(this.model_Query.sizeArray[value].fsize);
                } else {
                    return '';
                }
            },
            tipFormatDate(value) {
                if (this.model_Query.dateArray && this.model_Query.dateArray.length > 0) {
                    return util.formatDate(this.model_Query.dateArray[value].putTime);
                } else {
                    return '';
                }
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

                if (type === 2) {
                    this.changeDir('');
                }
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
            },
            /**
             * 文件夹模式下路径变更的处理
             * @param path
             */
            onPathUpdate(path) {
                this.folderPath = path;
            },
            changeFolderPath(index) {

                if (index === -1) {
                    this.folderPath = undefined;
                    return;
                }

                let arrays = this.folderPath.split('/');
                this.folderPath = arrays.slice(0, index + 1).join('/');
            },
        }

    };
</script>