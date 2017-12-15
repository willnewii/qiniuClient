import {mapGetters} from 'vuex';
import * as types from '../vuex/mutation-types';
import * as util from '../util/util';
import {cloudStorage} from '../service/index';

export default {
    computed: {
        ...mapGetters({
            menuState: types.APP.menu_state,
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
            deleteKey: '',
            deleteNoAskModel: false
        };
    },
    created: function () {
    },
    methods: {
        getResoureUrl(index, key) {
            let fileName;
            if (key) {
                fileName = key;
            } else {
                fileName = this.bucket.files[index].key;
            }
            let url;
            if (this.bucket.isprivate) {
                url = cloudStorage.getPrivateUrl(this.bucket.domain, fileName, this.setup_deadline);
            } else {
                url = util.getQiniuUrl(this.bucket.domain, fileName);
            }
            return url;
        },
        show(index) {
            this.$electron.shell.openExternal(this.getResoureUrl(index));
        },
        copy(index) {
            util.setClipboardText(this, this.setup_copyType, this.getResoureUrl(index));

            this.$Message.info('文件路径以复制到剪贴板');
            event.stopPropagation();
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
        removes() {
            this.deleteKey = this.bucket.selection[0].key;

            if (this.bucket.selection.length === 1) {
                this.doRemove();
            } else {
                this.doRemove(() => {
                    this.bucket.selection.shift();
                    if (this.bucket.selection.length > 0)
                        this.removes();
                });
            }
        },
        remove(index, event) {
            this.deleteKey = this.bucket.files[index].key;
            if (this.setup_deleteNoAsk) {
                this.doRemove();
            } else {
                this.deleteNoAskModel = true;
            }
            event.stopPropagation();
        },
        doRemove(callback) {
            cloudStorage.remove({
                bucket: this.bucket.name,
                key: this.deleteKey
            }, (ret) => {
                if (callback) {
                    callback();
                } else {
                    this.$Message.info('移除成功');
                    if (!ret) {
                        ret = {
                            key: this.deleteKey
                        };
                    }
                    this.$emit('on-update', ret, 'remove', event);
                }

            });
        },
    }
};