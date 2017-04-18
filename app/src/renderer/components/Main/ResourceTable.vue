<style lang="scss" scoped>
    .layout-content {
        margin: 15px;
        overflow: scroll;
        background: #fff;
    }
</style>
<template>
    <div class="layout-content">
        <Table border :columns="columns" :context="self"
               :height="tableHeight" :data="files" no-data-text="没有数据呀~"></Table>
    </div>
</template>
<script>
    import qiniu from 'qiniu'
    import moment from 'moment'

    export default {
        name: 'ResourceTable',
        data(){
            return {
                self: this,
                tableHeight: 100,
                tableWidth: 100,
                columns: [
                    {title: '文件名', key: 'key'},
                    {
                        title: '大小', key: 'fsize',
                        render (row, column, index) {
                            if (row.fsize >= 1024 * 1024) {
                                return (row.fsize / 1024 / 1024).toFixed(2) + ' MB'
                            } else if (row.fsize >= 1024 && row.fsize < 1024 * 1024) {
                                return (row.fsize / 1024).toFixed(2) + ' KB'
                            } else {
                                return (row.fsize).toFixed(2) + ' B'
                            }
                        }
                    },
                    {title: '类型', key: 'mimeType'},
                    {
                        title: '创建日期', key: 'putTime',
                        render (row, column, index) {
                            return moment(row.putTime / 10000).format('YYYY-MM-DD HH:mm:ss');
                        }
                    },
                    {
                        title: '操作', key: 'action',
                        render (row, column, index) {
                            return `<i-button type="primary" size="small" @click="show(${index})">查看</i-button> <i-button type="primary" size="small" @click="copy(${index})">复制</i-button> <i-button type="error" size="small" @click="remove(${index})">💀删除</i-button>`;
                        }
                    }],
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
        props: {
            files: {
                type: Array,
                default: []
            },
            domains: {
                type: Array,
                default: []
            },
            bucketname: {
                type: String,
                default: ''
            }
        },
        created(){
        },
        mounted(){
            this.setTableSize();
            window.onresize = () => {
                this.setTableSize();
            }
        },
        methods: {
            show(index) {
                let url = this.domains[0] + '/' + this.files[index].key;
                this.$electron.shell.openExternal('http://' + url)
            },
            copy(index){
                let url = this.domains[0] + '/' + this.files[index].key;
                this.$electron.clipboard.writeText('http://' + url);
            },
            remove(index) {
                new qiniu.rs.Client().remove(this.bucketname, this.files[index].key, (err, ret) => {
                    if (!err) {
                        this.$Message.info('移除成功');
                        if (!ret) {
                            ret = {
                                key: this.files[index].key
                            }
                        }
                        this.$emit('on-update', ret, 'remove', event);
                    } else {
                        console.log(err);
                    }
                });
            },
            setTableSize(){
                if (this.$parent) {
                    this.tableHeight = this.$parent.$el.clientHeight * 0.85 - 30;
                }
                /*                this.tableWidth = this.$refs.spanRight.$el.clientWidth - 30;

                 this.columns[0].width = this.tableWidth * 0.5;
                 this.columns[1].width = this.tableWidth * 0.1;
                 this.columns[2].width = this.tableWidth * 0.2;
                 this.columns[3].width = this.tableWidth * 0.2;*/
            },
        }
    };
</script>