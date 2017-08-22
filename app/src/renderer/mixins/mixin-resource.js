import {mapGetters} from 'vuex'
import * as types from '../vuex/mutation-types'
import * as util from '../util/util'
import {cloudStorage} from '../service/index'

export default {
    computed: {
        ...mapGetters({
            menuState: types.APP.menu_state,
            setup_copyType: types.APP.setup_copyType,
            setup_deleteNoAsk: types.APP.setup_deleteNoAsk,
            setup_imagestyle: types.APP.setup_imagestyle,
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
        }
    },
    created: function () {
    },
    methods: {
        show(index) {
            //this.$electron.ipcRenderer.send('previewFile', util.getQiniuUrl(this.bucket.domains[0], this.bucket.files[index].key));
            this.$electron.shell.openExternal(util.getQiniuUrl(this.bucket.domains[0], this.bucket.files[index].key))
        },
        copy(index) {
            let url = util.getQiniuUrl(this.bucket.domains[0], this.bucket.files[index].key);
            util.setClipboardText(this, this.setup_copyType, url);

            this.$Message.info('文件路径以复制到剪贴板');
            event.stopPropagation();
        },
        removes() {
            console.log(this.bucket.selection);
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
                        }
                    }
                    this.$emit('on-update', ret, 'remove', event);
                }

            })
        },
    }
}