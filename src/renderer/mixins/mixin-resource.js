import {mapGetters} from 'vuex';
import {Constants, EventBus, util} from '../service/index';
import * as types from '../vuex/mutation-types';

export default {
    computed: {
        ...mapGetters({
            setup_copyType: types.setup.setup_copyType,
            setup_deleteNoAsk: types.setup.setup_deleteNoAsk,
            setup_imagestyle: types.setup.setup_imagestyle,
            setup_downloaddir: types.setup.setup_downloaddir,
            setup_deadline: types.setup.setup_deadline,
        })
    },
    props: {
        bucket: {
            type: Object
        }
    },
    data() {
        return {};
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

        this.$electron.ipcRenderer.removeAllListeners(Constants.Listener.updateDownloadProgress);
        this.$electron.ipcRenderer.on(Constants.Listener.updateDownloadProgress, (event, num) => {
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
        getResoureUrl(file) {
            return this.bucket.generateUrl(file.key, this.setup_deadline);
        },
        show(file) {
            this.$electron.shell.openExternal(this.getResoureUrl(file));
        },
        copy(file, copyType) {
            let url = util.getClipboardText(copyType ? copyType : this.setup_copyType, this.getResoureUrl(file));
            this.$electron.clipboard.writeText(url);
            this.$Message.info('文件路径以复制到剪贴板');
        },
        downloadFiles() {
            if (this.bucket.selection.length > 0) {
                this.$Loading.start();
                let option = {};
                if (this.setup_downloaddir) {
                    option.directory = this.setup_downloaddir;
                }
                option.count = this.bucket.selection.length;
                //文件自带的虚拟路径
                option.folder = '/' + util.getFakeFolder(this.bucket.selection[0].key);

                this.$electron.ipcRenderer.send(Constants.Listener.downloadFile, this.getResoureUrl(this.bucket.selection[0]), option);
                this.bucket.selection.shift();
            } else {
                this.$refs['table'] && this.$refs['table'].selectAll(false);
                this.$Message.info('文件下载完成');
            }
        },
        resourceRename(files) {
            this.bucket.renameFile(files, () => {
                this.showMessage({
                    message: '文件修改成功'
                });
                this.$emit('on-update', null, 'change');
            });
        },
        /**
         *
         * item 删除按钮操作
         * @param file
         */
        resourceRemove(file) {
            this.bucket.selection = Array.isArray(file) ? file : [file];
            this.$parent.askRemove();
        },
        /**
         * 删除文件
         */
        removes() {
            this.bucket.removeFile(this.bucket.selection, (ret) => {
                this.$Message.info('移除成功');
                this.$emit('on-update', null, 'remove');

                this.bucket.selection = [];
            });

        },
    }
};