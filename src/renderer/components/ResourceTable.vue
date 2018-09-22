<style lang="scss" scoped>
    .layout-content {
        margin: 15px;
        flex-grow: 1;
        background: #fff;
    }

</style>
<template>
    <div class="layout-content">
        <Table ref="table" border :columns="columns" :context="self"
               :height="tableHeight" :data="bucket.files" no-data-text="暂无数据"
               @on-selection-change="onSelectionChange"></Table>
    </div>
</template>
<script>
    import {Constants, EventBus, util} from '../service/index';
    import mixin_resource from '../mixins/mixin-resource';

    export default {
        name: 'ResourceTable',
        mixins: [mixin_resource],
        data() {
            return {
                self: this,
                tableHeight: 100,
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
                            return h('span', {}, util.formatFileSize(item.row.fsize));
                        }
                    },
                    {title: '类型', key: 'mimeType', width: 100},
                    {
                        title: '上传日期', key: 'putTime', sortable: true, sortType: 'desc', width: 150,
                        render(h, item) {
                            return h('span', {}, util.formatDate(item.row.putTime));
                        }
                    },
                    {
                        title: '操作', key: 'action', width: 165,
                        render: (h, item) => {
                            return h('div', [
                                h('i-button', {
                                    class: 'primary-line-btn',
                                    props: {
                                        type: 'primary',
                                        size: 'small'
                                    },
                                    on: {
                                        click: () => {
                                            this.show(item.row);
                                        }
                                    }
                                }, '查看'),
                                h('span', {}, ' '),
                                h('i-button', {
                                    class: 'primary-line-btn',
                                    props: {
                                        type: 'primary',
                                        size: 'small'
                                    },
                                    on: {
                                        click: () => {
                                            this.copy(item.row);
                                        }
                                    }
                                }, '复制'),
                                h('span', {}, ' '),
                                h('i-button', {
                                    class: 'error-line-btn',
                                    props: {
                                        type: 'error',
                                        size: 'small'
                                    },
                                    on: {
                                        click: () => {
                                            this.resourceRemove(item.row);
                                        }
                                    }
                                }, '删除')
                            ]);
                        }
                    }],
            };
        },
        created() {
        },
        mounted() {
            this.updateTableSize();
            window.onresize = () => {
                this.updateTableSize();
            };
        },
        methods: {
            onSelectionChange(selection) {
                this.bucket.selection = selection;
            },
            updateTableSize() {
                this.tableHeight = this.$el.clientHeight;
            },
        }
    };
</script>
