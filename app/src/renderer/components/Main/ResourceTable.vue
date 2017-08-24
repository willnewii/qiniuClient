<style lang="scss" scoped>
    .layout-content {
        margin: 15px;
        overflow: scroll;
        background: #fff;
    }
</style>
<template>
    <div class="layout-content">
        <Table ref="table" border :columns="columns" :context="self"
               :height="tableHeight" :data="bucket.files" no-data-text="暂无数据"
               @on-selection-change="onSelectionChange"></Table>
        <Modal
                v-model="deleteNoAskModel"
                title="确认删除文件？"
                @on-ok="doRemove">
            <p>{{deleteKey}}</p>
        </Modal>
    </div>
</template>
<script>
    import {mapGetters} from 'vuex'
    import {Constants, EventBus} from '../../service/index'
    import * as types from '../../vuex/mutation-types'
    import mixin_resource from '../../mixins/mixin-resource'
    import moment from 'moment'

    let tempNum;

    export default {
        name: 'ResourceTable',
        mixins: [mixin_resource],
        data() {
            return {
                self: this,
                tableHeight: 100,
                tableWidth: 100,
                columns: [
                    {
                        type: 'selection',
                        width: 50,
                        align: 'center'
                    },
                    {title: '文件名', key: 'key', ellipsis: false},
                    {
                        title: '大小', key: 'fsize', sortable: true, width: 100,
                        render(h, item) {
                            let row = item.row;
                            if (row.fsize >= 1024 * 1024) {
                                return (row.fsize / 1024 / 1024).toFixed(2) + ' MB'
                            } else if (row.fsize >= 1024 && row.fsize < 1024 * 1024) {
                                return (row.fsize / 1024).toFixed(2) + ' KB'
                            } else {
                                return (row.fsize).toFixed(2) + ' B'
                            }
                        }
                    },
                    {title: '类型', key: 'mimeType', width: 100},
                    {
                        title: '上传日期', key: 'putTime', sortable: true, sortType: 'desc', width: 150,
                        render(h, item) {
                            return moment(item.row.putTime / 10000).format('YYYY-MM-DD HH:mm:ss');
                        }
                    },
                    {
                        title: '操作', key: 'action', width: 165,
                        render: (h, item) => {
                            return h('div', [
                                h('i-button', {
                                    props: {
                                        type: 'primary',
                                        size: 'small'
                                    },
                                    on: {
                                        click: () => {
                                            this.show(item.index)
                                        }
                                    }
                                }, '查看'),
                                h('span', {}, ' '),
                                h('i-button', {
                                    props: {
                                        type: 'primary',
                                        size: 'small'
                                    },
                                    on: {
                                        click: () => {
                                            this.copy(item.index)
                                        }
                                    }
                                }, '复制'),
                                h('span', {}, ' '),
                                h('i-button', {
                                    props: {
                                        type: 'error',
                                        size: 'small'
                                    },
                                    on: {
                                        click: () => {
                                            this.remove(item.index)
                                        }
                                    }
                                }, '删除')
                            ])
                        }
                    }],
            }
        },
        created() {
            EventBus.$off(Constants.Event.removes);
            EventBus.$on(Constants.Event.removes, () => {
                this.removes();
            });

            EventBus.$off(Constants.Event.download);
            EventBus.$on(Constants.Event.download, () => {
                this.downloadFiles();
            });

            this.$electron.ipcRenderer.removeAllListeners('updateDownloadProgress');
            this.$electron.ipcRenderer.on('updateDownloadProgress', (event, num) => {
                this.$Loading.update(num * 100);
                if (num === 1) {
                    this.$Loading.finish();
                    console.log(this.bucket.selection.length + ':' + this.bucket.name);
                    this.downloadFiles();
                }
            });
        },
        mounted() {
            this.setTableSize();
            window.onresize = () => {
                this.setTableSize();
            }
        },
        methods: {
            onSelectionChange(selection) {
                this.bucket.selection = selection;
            },
            setTableSize() {
                if (this.$parent) {
                    this.tableHeight = this.$parent.$el.clientHeight * 0.85 - 20;
                    //that.tableWidth = that.$parent.$el.getBoundingClientRect().width - 30;
                    //console.log(that.$parent.$el.getBoundingClientRect().width);

                    /*               this.columns[0].width = this.tableWidth * 0.5;
                     this.columns[1].width = this.tableWidth * 0.1;
                     this.columns[2].width = this.tableWidth * 0.2;
                     this.columns[3].width = this.tableWidth * 0.2;*/
                }
            },
        }
    };
</script>