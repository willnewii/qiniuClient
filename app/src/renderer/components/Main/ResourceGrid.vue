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
                    .btn {
                        display: none;
                        position: absolute;
                        right: 15px;
                        top: 80px;
                    }
                }
                .view:hover {
                    .btn {
                        display: inline;
                    }
                }
            }
        }
    }
</style>
<template>
    <div class="layout-content">
        <div class="gallery" :style="{height: tableHeight+ 'px'}">
            <Card v-for="file,index in bucket.files" :key="index" class="card" :padding="10" :bordered="false">
                <div class="view" @click="show(index)">
                    <img v-if="file.mimeType.indexOf('image')===0" class="image"
                         v-lazy="'http://' + bucket.domain + '/' + file.key + '?' + setup_imagestyle">
                    <div v-else-if="file.mimeType.indexOf('audio')===0" class="audio">
                        <Icon type="music-note" size="32"></Icon>
                    </div>
                    <div v-else class="audio">
                        <Icon type="help-circled" size="32"></Icon>
                    </div>
                    <span v-else class="image">其他类型</span>
                    <div class="btn">
                        <Button type="ghost" shape="circle" size="small" icon="ios-download"
                                @click="handleDownload(index,$event)" style="background: #FFFFFF"></Button>
                        <Button type="ghost" shape="circle" size="small" icon="clipboard"
                                @click="copy(index,$event)" style="background: #FFFFFF"></Button>
                        <Button type="error" shape="circle" size="small" icon="trash-b"
                                @click="remove(index,$event)"></Button>
                    </div>
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
    import mixin_resource from '../../mixins/mixin-resource'

    import {cloudStorage} from '../../service/index'

    export default {
        name: 'ResourceGrid',
        mixins: [mixin_resource],
        computed: {
            tableHeight() {
                let layout = this.$parent.$el;
                let style = window.getComputedStyle(layout.children[2]);
                return layout.clientHeight - layout.children[0].clientHeight - layout.children[1].clientHeight - parseInt(style.marginTop) - parseInt(style.marginBottom);
            }
        },
        data() {
            return {
                self: this,
            }
        },
        methods: {
            handleDownload(index) {
                let item = this.bucket.files[index];

                this.bucket.selection = [item];
                this.downloadFiles();

                event.stopPropagation();
            }
        }
    };
</script>