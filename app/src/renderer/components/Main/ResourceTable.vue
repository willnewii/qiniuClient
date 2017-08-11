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
               :height="tableHeight" :data="bucket.files" no-data-text="暂无数据"></Table>
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
    import * as types from '../../vuex/mutation-types'
    import * as util from '../../util/util'
    import * as cloudStorage from '../../service/cloudStorage'

    import moment from 'moment'

    export default {
        name: 'ResourceTable',
        data() {
            return {
                self: this,
                tableHeight: 100,
                tableWidth: 100,
                deleteKey: '',
                deleteNoAskModel: false,
                columns: [
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
        computed: {
            ...mapGetters({
                menuState: types.APP.menu_state,
                setup_copyType: types.APP.setup_copyType,
                setup_deleteNoAsk: types.APP.setup_deleteNoAsk,
            })
        },
        props: {
            bucket: {
                type: Object
            }
        },
        created() {
        },
        mounted() {
            this.setTableSize();
            window.onresize = () => {
                this.setTableSize();
            }
        },
        methods: {
            show(index) {
                this.$electron.shell.openExternal(util.getQiniuUrl(this.bucket.domains[0], this.bucket.files[index].key))
            },
            copy(index) {
                let url = util.getQiniuUrl(this.bucket.domains[0], this.bucket.files[index].key);
                util.setClipboardText(this, this.setup_copyType, url);

                this.$Message.info('文件路径以复制到剪贴板');
            },
            remove(index) {
                this.deleteKey = this.bucket.files[index].key;
                if (this.setup_deleteNoAsk) {
                    this.deleteNoAskModel = true;
                } else {
                    this.doRemove();
                }
            },
            doRemove() {
                cloudStorage.remove({
                    bucket: this.bucket.name,
                    key: this.deleteKey
                }, (ret) => {
                    this.$Message.info('移除成功');
                    if (!ret) {
                        ret = {
                            key: this.deleteKey
                        }
                    }
                    this.$emit('on-update', ret, 'remove', event);
                })
            },
            setTableSize() {
                if (this.$parent) {
                    let that = this;
                    that.tableHeight = that.$parent.$el.clientHeight * 0.85 - 20;
                    //that.tableWidth = that.$parent.$el.getBoundingClientRect().width - 30;
                    //console.log(that.$parent.$el.getBoundingClientRect().width);

                    /*               this.columns[0].width = this.tableWidth * 0.5;
                     this.columns[1].width = this.tableWidth * 0.1;
                     this.columns[2].width = this.tableWidth * 0.2;
                     this.columns[3].width = this.tableWidth * 0.2;*/
                }
                /*

                 */
            },
        }
    };
</script>