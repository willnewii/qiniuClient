import {mapGetters} from 'vuex';
import {Constants, EventBus, util} from '../service/index';
import * as types from '../vuex/mutation-types';


//作为ResourceGrid的扩展,不应该被其他页面引用
//queue 执行中的标识符
let isTaskPending = false;

export default {
    computed: {
        ...mapGetters({
            setup_copyType: types.setup.copyType,
            setup_deleteNoAsk: types.setup.deleteNoAsk,
            setup_uploadNoAsk: types.setup.uploadNoAsk,
            setup_imagestyle: types.setup.imagestyle,
            setup_downloaddir: types.setup.downloaddir,
            setup_deadline: types.setup.deadline,
        }),
    },
    props: {
        bucket: {
            type: Object
        }
    },
    data() {
        return {
            previewImages: [],
            status_total: 0,
            status_count: 0,
            //同步文件时,缓存文件父路径
            baseDir: '',
        };
    },
    created: function () {

    },
    methods: {
        /**
         * 获取资源链接
         */
        getResourceUrl(file) {
            if (!file.key && file.path) {
                file.key = util.getPrefix(file.path);
            }
            return this.bucket.generateUrl(file.key, this.setup_deadline);
        },
        preview(file) {
            if (util.isSupportImage(file.mimeType)) {
                this.$viewer.view(this.previewImages.indexOf(this.getResourceUrl(file)));
            } else {
                this.$Message.info('不支持预览的文件格式');
            }
        },
        copyFileUrl(file, copyType) {
            let text = util.getClipboardText(copyType ? copyType : this.setup_copyType, this.getResourceUrl(file), file);
            this.$electron.clipboard.writeText(text);
            this.$Message.info('文件路径已复制到剪贴板');
        },
        resourceAction(files, action) {
            files = Array.isArray(files) ? files : [files];

            switch (action) {
                case Constants.ActionType.download:
                case Constants.ActionType.upload:
                    this.bucket.fileQueue.push(...files.map((item) => {
                        item.__action = action;
                        return item;
                    }));
                    if (!isTaskPending) {
                        this.status_total = this.bucket.fileQueue.length;
                        this.status_count = 0;
                        this.queueTask();
                    } else {
                        this.status_total += files.length;
                    }
                    break;
                case Constants.ActionType.remove:
                    this.resourceRemove(files, true);
                    break;
            }


        },
        queueTask() {
            let lastTask;
            if (isTaskPending) {
                lastTask = this.bucket.fileQueue.shift();
            } else {
                isTaskPending = true;
            }

            let list = this.bucket.fileQueue;
            let file = list[0];
            if (list.length > 0) {
                let message = "";
                switch (file.__action) {
                    case Constants.ActionType.download:
                        message = '文件下载中';
                        this.resourceDownload(file);
                        break;
                    case Constants.ActionType.upload:
                        message = '文件上传中';
                        this.resourceUpload(file);
                        break;
                }

                this.$Loading.start();
                EventBus.$emit(Constants.Event.statusView, {
                    show: true,
                    message: `${message}(${++this.status_count}/${this.status_total})...`,
                });

            } else {
                isTaskPending = false;
                if (lastTask && lastTask.__action === Constants.ActionType.upload) {
                    // 上传成功后： 1.刷新列表 2.复制路径
                    EventBus.$emit(Constants.Event.refreshFiles, Constants.ActionType.upload);
                    this.copyFileUrl(lastTask);
                }

                this.$Loading.finish();
                EventBus.$emit(Constants.Event.statusView, {
                    show: false
                });

                this.baseDir = '';
                util.notification({body: '任务完成'});
            }
        },
        resourceDownload(file) {
            let option = {
                // TODO: 用来标识最后一个文件，打开文件目录用,如果是队列方式，这样处理有问题
                count: this.bucket.fileQueue.length
            };
            //指定下载目录(默认下载地址:下载目录 + bucket.name + file.key)
            if (this.baseDir) {
                option.directory = this.baseDir;
                option.folder = Constants.DELIMITER + util.getFakeFolder(file.key);
            } else {
                if (this.setup_downloaddir) {
                    option.directory = this.setup_downloaddir;
                }
                option.folder = Constants.DELIMITER + this.bucket.name + Constants.DELIMITER + util.getFakeFolder(file.key);
            }

            this.$electron.ipcRenderer.send(Constants.Listener.downloadFile, this.getResourceUrl(file), option);
        },
        resourceUpload(file) {
            let callback = (err, ret) => {
                if (err) {
                    this.$Notice.error({title: '上传失败', desc: err.error,});
                }
                //批量上传的时候提示信息会干扰
                /*else {
                    this.$Notice.success({title: '上传成功', desc: ret.key,});
                }*/

                this.queueTask();
            };

            if (!file.key && file.path) {
                file.key = util.getPrefix(file.path);
            }

            let param = {
                path: file.path,
                key: file.key,
                isOverwrite: true,
                progressCallback: (progress) => {
                    EventBus.$emit(Constants.Event.statusView, {
                        message: `文件上传中(${this.status_count}/${this.status_total})...${progress}%`,
                        progress: this.status_total === 1 ? 0 : parseInt(this.status_count / this.status_total * 100)
                    });
                }
            };

            this.bucket.createFile(param, Constants.UploadType.UPLOAD, callback);
        },
        resourceRename(files) {
            EventBus.$emit(Constants.Event.loading, {
                show: true,
                message: '更新中...',
            });

            this.bucket.renameFile(files, () => {
                EventBus.$emit(Constants.Event.loading, {
                    show: false,
                });

                this.$Message.info('文件修改成功');
                EventBus.$emit(Constants.Event.refreshFiles, Constants.ActionType.rename, files);
            });
        },
        resourceRemove(file, noAsk = false) {
            this.bucket.selection = Array.isArray(file) ? file : [file];
            if (this.setup_deleteNoAsk || noAsk) {
                this.bucket.removeFile(this.bucket.selection, (ret) => {
                    if (ret && ret.error) {
                        this.$Message.error('移除失败：' + ret.error);
                    } else {
                        this.$Message.info('文件移除成功');
                        EventBus.$emit(Constants.Event.refreshFiles, Constants.ActionType.remove);
                    }

                });
                this.bucket.selection = [];
            } else {
                this.$parent.askRemove();
            }
        },
    }
};
