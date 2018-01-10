import {mapGetters} from 'vuex';
import {Constants, EventBus} from '../service/index';
import * as types from '../vuex/mutation-types';
import * as util from '../util/util';

export default {
    computed: {
        ...mapGetters({
            setup_copyType: types.APP.setup_copyType,
            setup_deleteNoAsk: types.APP.setup_deleteNoAsk,
            setup_imagestyle: types.APP.setup_imagestyle,
            setup_downloaddir: types.APP.setup_downloaddir,
            setup_deadline: types.APP.setup_deadline,
        })
    },
    props: {
        bucket: {
            type: Object
        }
    },
    data() {
        return {
            deleteItem: null
        };
    },
    created: function () {
        EventBus.$off(Constants.Event.remove);
        EventBus.$on(Constants.Event.remove, () => {
            this.remove();
        });

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
                this.downloadFiles();
            }
        });
    },
    methods: {
        /**
         * 获取资源链接
         */
        getResoureUrl(index, key) {
            return this.bucket.getResoureUrl(index, key, this.setup_deadline);
        },
        show(index) {
            this.$electron.shell.openExternal(this.getResoureUrl(index));
        },
        copy(index) {
            util.setClipboardText(this, this.setup_copyType, this.getResoureUrl(index));

            this.$Message.info('文件路径以复制到剪贴板');
        },
        downloadFiles() {
            if (this.bucket.selection.length > 0) {
                this.$Loading.start();
                let option = {};
                if (this.setup_downloaddir) {
                    option.directory = this.setup_downloaddir;
                }

                this.$electron.ipcRenderer.send('downloadFile', this.getResoureUrl(null, this.bucket.selection[0].key), option);
                this.bucket.selection.shift();
            } else {
                this.$refs['table'] && this.$refs['table'].selectAll(false);

                this.$Message.info('文件下载完成');
            }
        },
        removeMsg(item) {
            this.$Message.info('移除成功');

            this.$emit('on-update', null, 'remove');
        },
        resourceRemove(index) {
            this.deleteItem = this.bucket.files[index];
            this.$parent.remove(this.deleteItem.key);
        },
        /**
         * 删除单个文件
         */
        remove() {
            if (this.deleteItem) {
                let item = this.deleteItem;
                this.deleteItem = null;
                this.doRemove(item, () => {
                    this.removeMsg(item);
                });
            }
        },
        /**
         * 批量删除
         */
        removes() {
            let item = this.bucket.selection[0];

            this.doRemove(item, () => {
                this.bucket.selection.shift();
                if (this.bucket.selection.length > 0) {
                    this.removes();
                } else {
                    this.removeMsg(item);
                }
            });
        },
        /**
         * 删除操作
         * @param item
         * @param callback
         */
        doRemove(item, callback) {
            this.bucket.removeFile({key: item.key}, (ret) => {
                callback && callback(ret);
            });
        }
    }
};