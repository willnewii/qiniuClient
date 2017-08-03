<style lang="scss" scoped>
    .layout-copy {
        text-align: center;
        padding: 10px 0 20px;
        color: #9ea7b4;
    }
</style>
<template>
    <div class="layout">
        <ClientHeader :bucket="bucket" @on-update="onUpdate" @on-navicon="toggleClick"
                      @on-search="doSearch"></ClientHeader>

        <DirTag :bucket="bucket" @on-click="doDirSearch"></DirTag>

        <ResourceTable :bucketname="bucket.name" :files="bucket.files" :domains="bucket.domains"
                       @on-update="onUpdate"></ResourceTable>

        <div class="layout-copy">
            2011-2016 &copy; TalkingData
        </div>
    </div>
</template>
<script>
    import * as types from '../../vuex/mutation-types'
    import DirTag from './DirTag.vue'
    import ClientHeader from './ClientHeader.vue'
    import ResourceTable from './ResourceTable.vue'
    import * as util from '../../util/util'
    import api from '../../api/API'

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
                    files: [],
                    withoutDelimiterFiles: []
                }
            }
        },
        watch: {
            bucketname: function (val, oldVal) {
                if (val && oldVal !== val) {
                    this.bucket.name = val;
                    this.initBucket();
                }
            }
        },
        mounted() {
            API = new api(this);

            console.log(this.$route.query.bucketname);
            if (this.$route.query && this.$route.query.bucketname) {
                if (this.$route.query.bucketname !== this.bucket.name) {
                    this.bucket.name = this.$route.query.bucketname;
                    this.initBucket();
                }
            }
        },
        methods: {
            initBucket() {
                this.getDomains();
                this.bucket.dirs = [];
                this.bucket.dirs.push('');
                this.bucket.dirs.push('__withoutDelimiter__');
                this.bucket.withoutDelimiterFiles = [];
                this.getDir();
                this.getResources();
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
                }

                if (keyword) {
                    data.prefix = keyword;
                }

                API.post(API.method.getResources, data).then((response) => {
                    this.bucket.files = response.data.items
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
                }
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
                console.log(ret, action);
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