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
    <div class="layout">
        <ClientHeader v-if="endable" :bucket="bucket" @on-update="onUpdate" @on-navicon="toggleClick"
                      @on-search="doSearch"></ClientHeader>

        <div class="dir-layout">
            <DirTag v-if="endable" :bucket="bucket" @on-click="doDirSearch"></DirTag>
            <Button-group size="small" style="background: #FFF" v-if="bucket.marker">
                <!--<Button type="ghost" icon="chevron-left"></Button>-->
                <Button type="ghost" @click="getResources" icon="chevron-right"></Button>
            </Button-group>
        </div>

        <ResourceTable v-if="endable" :bucketname="bucket.name" :files="bucket.files" :domains="bucket.domains"
                       @on-update="onUpdate"></ResourceTable>

    </div>
</template>
<script>
    import * as types from '../vuex/mutation-types'
    import DirTag from '../components/Main/DirTag.vue'
    import ClientHeader from '../components/Main/ClientHeader.vue'
    import ResourceTable from '../components/Main/ResourceTable.vue'
    import * as util from '../util/util'
    import api from '../api/API'

    let API;

    export default {
        name: 'RightContent',
        components: {DirTag, ClientHeader, ResourceTable},
        props: {
            bucketname: {
                type: String,
                default: ''
            }
        },
        data() {
            return {
                bucket: {
                    name: '',
                    domains: [],
                    dirs: [],
                    currentDir: '',
                    marker: '',
                    files: [],
                    withoutDelimiterFiles: []
                },
                endable: true
            }
        },
        watch: {
            bucketname: function (val, oldVal) {
                if (val && oldVal !== val) {
                    this.initBucket(val);
                }
            }
        },
        mounted() {
            API = new api(this);

            if (this.$route.query && this.$route.query.bucketname) {
                if (this.$route.query.bucketname !== this.bucket.name) {
                    this.initBucket(this.$route.query.bucketname);
                }
            }
        },
        methods: {
            initBucket(bucketname) {
                this.bucket.name = bucketname;
                this.bucket.currentDir = '';

                this.bucket.dirs = [];
                this.endable = false;
                if (this.bucket.name.indexOf('__app__') !== 0) {
                    this.getDomains();
                    this.bucket.dirs.push('');
                    this.bucket.dirs.push('__withoutDelimiter__');
                    this.bucket.withoutDelimiterFiles = [];
                    this.getDir();
                    this.getResources();

                    this.endable = true;
                }
            },
            getDomains() {
                API.get(API.method.getDomains, {tbl: this.bucket.name}).then((response) => {
                    this.bucket.domains = response.data;
                });
            },
            getResources(keyword) {
                let data = {
                    bucket: this.bucket.name,
                    limit: 100
                };

                if (keyword) {
                    data.prefix = this.bucket.currentDir;
                }

                if (this.bucket.marker) {
                    data.marker = this.bucket.marker;
                }

                API.post(API.method.getResources, data).then((response) => {

                    if(this.bucket.marker){
                        this.bucket.files = this.bucket.files.concat(response.data.items);
                    }else{
                        this.bucket.files = response.data.items;
                    }
                    if (response.data.marker) {
                        this.bucket.marker = response.data.marker
                    } else {
                        this.bucket.marker = '';
                    }
                });
            },
            /**
             * 获取该bucket下的目录
             * @param marker 上一次列举返回的位置标记，作为本次列举的起点信息。
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

                API.post(API.method.getResources, data).then((response) => {
                    if (response.data.commonPrefixes) {
                        this.bucket.dirs = this.bucket.dirs.concat(response.data.commonPrefixes);
                    }

                    if (response.data.items) {//不包含公共前缀的文件列表
                        this.bucket.withoutDelimiterFiles = this.bucket.withoutDelimiterFiles.concat(response.data.items);
                    }

                    if (response.data.marker) {
                        this.getDir(response.data.marker);
                    }
                });
            },
            /**
             * Dir 组件 搜索
             * @param search
             */
            doDirSearch: function (search) {
                this.bucket.currentDir = search;
                this.bucket.marker = '';

                if (search === '__withoutDelimiter__') {
                    this.bucket.files = this.bucket.withoutDelimiterFiles;
                } else {
                    this.doSearch(search);
                }
            },
            doSearch: function (search) {
                this.getResources(search)
            },
            toggleClick() {
                //this.$emit('on-spanLeft', event);
            },
            onUpdate(ret, action) {
                let keyword = '';
                if (ret && ret.key) {
                    keyword = util.getPrefix(ret.key)
                    this.bucket.currentDir = keyword;
                }
                this.getResources(keyword);
            }
        }

    };
</script>