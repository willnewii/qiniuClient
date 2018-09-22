<template>
    <div class="layout-content">
        <div class="gallery" :style="{height: tableHeight+ 'px'}">
            <Card v-for="file,index in bucket.files" :key="index" class="card" :padding="10" :bordered="false">
                <div class="view" @click="show(file)">
                    <img v-if="/image\/(png|img|jpe?g){1}/.test(file.mimeType.toLowerCase())" class="image"
                         v-lazy="'http://' + bucket.domain + '/' + file.key + '?' + setup_imagestyle">
                    <div v-else-if="file.mimeType.indexOf('audio')===0" class="other">
                        <Icon type="music-note" size="50"></Icon>
                    </div>
                    <div v-else class="other">
                        <Icon type="document-text" size="50"></Icon>
                    </div>
                    <div class="btn">
                        <Button type="ghost" shape="circle" size="small" icon="ios-download"
                                @click.stop="handleDownload(file)" style="background: #FFFFFF"></Button>
                        <Button type="ghost" shape="circle" size="small" icon="clipboard"
                                @click.stop="copy(file)" style="background: #FFFFFF"></Button>
                        <Button type="error" shape="circle" size="small" icon="trash-b"
                                @click.stop="resourceRemove(file)"></Button>
                    </div>
                    <span class="name">{{file.key | getfileNameByPath}}</span>
                </div>
            </Card>
        </div>
    </div>
</template>
<script>
    import mixin_resource from '../mixins/mixin-resource';

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
            };
        },
        methods: {
            handleDownload(file) {
                this.bucket.selection = [file];
                this.downloadFiles();
            }
        }
    };
</script>
<style lang="scss" scoped>

    $size: 80px;

    .layout-content {
        margin: 15px;
        overflow: scroll;
        background: #fff;

        .gallery {
            display: flex;
            flex-direction: row;
            flex-wrap: wrap;
            justify-content: flex-start;
            align-content: flex-start;
            padding: 10px;
            .card {
                height: 120px;
                width: 103.5px;
                margin: 10px;
                .view {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    .image {
                        height: $size;
                        width: $size;
                        min-height: $size;
                        min-width: $size;
                    }
                    .other {
                        height: $size;
                        width: $size;
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
                        top: 70px;
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