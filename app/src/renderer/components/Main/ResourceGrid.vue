<style lang="scss" scoped>
    .layout-content {
        margin: 15px;
        overflow: scroll;
        background: #fff;

        .gallery {
            display: flex;
            flex-direction: row;
            flex-wrap: wrap;
            justify-content: space-between;
            .card {
                margin-bottom: 10px;
                max-height: 150px;
                .view {
                    display: flex;
                    flex-direction: column;
                    .image {
                        height: 100px;
                        width: 100px;
                        min-height: 100px;
                        min-width: 100px;
                    }
                    .audio {
                        height: 100px;
                        width: 100px;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                    }
                    .name {
                        font-size: 12px;
                        max-width: 100px;
                        white-space: nowrap;
                        text-overflow: ellipsis;
                        overflow: hidden;
                        margin-top: 5px;
                        text-align: center;
                    }
                }
            }
        }
    }
</style>
<template>
    <div class="layout-content">
        <div class="gallery" :style="{height: tableHeight+ 'px'}">
            <Card v-for="file,index in bucket.files" class="card" :padding="10" :bordered="false">
                <div class="view" @click="show(index)">
                    <img  v-if="file.mimeType.indexOf('image')===0" class="image" v-lazy="'http://' + bucket.domains[0] + '/' + file.key + '?' + setup_imagestyle">
                    <div v-else-if="file.mimeType.indexOf('audio')===0" class="audio">
                        <Icon  type="music-note" size="32"></Icon>
                    </div>
                    <div v-else class="audio">
                        <Icon  type="help-circled" size="32"></Icon>
                    </div>
                    <span  v-else class="image" >其他类型</span>
                    <span class="name">{{file.key | getfileNameByPath}}</span>
                </div>
            </Card>
        </div>

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
    import {cloudStorage, util} from '../../service/index'

    import moment from 'moment'

    export default {
        name: 'ResourceGrid',
        data() {
            return {
                self: this,
                deleteKey: '',
                deleteNoAskModel: false,
            }
        },
        computed: {
            ...mapGetters({
                setup_copyType: types.APP.setup_copyType,
                setup_deleteNoAsk: types.APP.setup_deleteNoAsk,
                setup_imagestyle: types.APP.setup_imagestyle,
            }),
            tableHeight() {
                return this.$parent.$el.clientHeight * 0.85 - 20;
            }
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
            }
        }
    };
</script>