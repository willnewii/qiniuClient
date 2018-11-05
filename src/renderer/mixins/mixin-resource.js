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
        return {
            status_total: 0,
            status_count: 0,
            //同步文件时,缓存文件父路径
            baseDir: '',
            //上传,下载,删除任务完成数
            finishCount: 0
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
            this.status_total = this.bucket.selection.length;
            this.status_count = 0;
            EventBus.$emit(Constants.Event.statusview, {
                show: true,
                message: '文件下载中',
            });

            this.bucket.downloads = this.bucket.selection;
            this.bucket.selection = [];
            this.resourceDownload();
        });

        this.$electron.ipcRenderer.removeAllListeners(Constants.Listener.updateDownloadProgress);
        this.$electron.ipcRenderer.removeAllListeners(Constants.Listener.syncDirectory);

        this.$electron.ipcRenderer.on(Constants.Listener.updateDownloadProgress, (event, num) => {
            this.$Loading.update(num * 100);
            EventBus.$emit(Constants.Event.statusview, {
                message: `文件下载中(${this.status_count}/${this.status_total})...${parseFloat(num * 100).toFixed(2)}%`,
            });
            if (num === 1) {
                this.$Loading.finish();
                this.bucket.downloads.shift();
                this.resourceDownload();
            }
        });

        this.$electron.ipcRenderer.on(Constants.Listener.syncDirectory, (event, results) => {
            //  下载任务
            if (results.downloads && results.downloads.length > 0) {
                this.status_total = this.bucket.downloads.length;
                this.status_count = 0;
                EventBus.$emit(Constants.Event.statusview, {
                    show: true,
                    message: '文件下载中',
                });

                this.bucket.downloads = results.downloads;
                this.baseDir = results.baseDir;
                this.resourceDownload();
            } else {
                this.syncFinish();
            }

            //  上传任务
            if (results.uploads && results.uploads.length > 0) {
                this.bucket.uploads = results.uploads;
                console.log(this.bucket.uploads);
                this.syncUpload();
            } else {
                this.syncFinish();
            }

            //  删除任务
            if (results.deletes && results.deletes.length > 0) {
                this.bucket.deletes = results.deletes;
                this.bucket.removeFile(this.bucket.deletes, (ret) => {
                    if (ret.error) {
                        this.$Message.error('移除失败：' + ret.error);
                    } else {
                        this.$Message.info('文件移除成功');
                        this.$emit('on-update', null, 'remove');
                    }
                    this.syncFinish();
                });
            } else {
                this.syncFinish();
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
        syncUpload() {
            let file = this.bucket.uploads[0];
            file.key = file.path.replace(file.dir + '/', '');

            this.resourceCreate(file, {
                isOverwrite: true,
                uploadType: Constants.UploadType.UPLOAD,
                progressCallback: (progress) => {
                },
                callback: (err, ret) => {
                    if (!err) {
                        this.$Notice.success({
                            title: '上传成功',
                            desc: ret.key,
                        });
                    } else {
                        this.$Notice.error({
                            title: '上传失败',
                            desc: err.error,
                        });
                    }

                    this.bucket.uploads.shift();
                    if (this.bucket.uploads.length > 0) {
                        this.syncUpload();
                    } else {
                        EventBus.$emit(Constants.Event.statusview, {
                            message: '上传完成',
                            path: '',
                            show: false,
                        });
                        // 更新数据
                        this.$emit('on-update', ret, 'upload', event);
                        this.syncFinish();
                    }
                }
            });
        },
        syncFinish() {
            this.finishCount++;

            if (this.finishCount === 3) {
                this.finishCount = 0;
                this.$Message.info('同步完成');
            }
        },
        resourceDownload() {
            if (this.bucket.downloads.length > 0) {
                this.$Loading.start();

                this.status_count += 1;
                EventBus.$emit(Constants.Event.statusview, {
                    message: `文件下载中(${this.status_count}/${this.status_total})...0%`,
                });

                let option = {};
                option.count = this.bucket.downloads.length;

                if (this.baseDir) {//指定下载目录
                    option.directory = this.baseDir;
                    option.folder = '/' + util.getFakeFolder(this.bucket.downloads[0].key);
                } else {//默认下载地址   downloaddir + 'bucket.name' + 'file folder'
                    if (this.setup_downloaddir) {
                        option.directory = this.setup_downloaddir;
                    }
                    option.folder = '/' + this.bucket.name + '/' + util.getFakeFolder(this.bucket.downloads[0].key);
                }

                this.$electron.ipcRenderer.send(Constants.Listener.downloadFile, this.getResoureUrl(this.bucket.downloads[0]), option);
            } else {
                this.$refs['table'] && this.$refs['table'].selectAll(false);
                EventBus.$emit(Constants.Event.statusview, {
                    message: '',
                    path: '',
                    show: false
                });

                this.baseDir = '';
                this.$Message.info('文件下载完成');
                this.syncFinish();
            }
        },
        resourceRename(files) {
            this.bucket.renameFile(files, () => {
                EventBus.$emit(Constants.Event.loading, {
                    show: false,
                });

                this.$Message.info('文件修改成功');
                this.$emit('on-update', null, 'change');
            });
        },
        resourceCreate(file, option) {
            let param = {
                path: file.path,
                key: file.key,
                isOverwrite: option.isOverwrite,
                progressCallback: option.progressCallback
            };

            this.bucket.createFile(param, option.uploadType, option.callback);
        },
        /**
         *
         * 删除按钮点击事件
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
                if (ret.error) {
                    this.$Message.error('移除失败：' + ret.error);
                } else {
                    this.$Message.info('文件移除成功');
                    console.log(this);
                    this.$emit('on-update', null, 'remove');
                }
                this.bucket.selection = [];
            });
        },
    }
};