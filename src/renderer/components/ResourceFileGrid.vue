<template>
    <div class="layout-content">
        <div class="gallery" :style="{height: tableHeight+ 'px'}">
            <Card v-for="(file,index) in files" :key="index" class="card" :padding="10" :bordered="false">
                <div class="view" @click="showDirectory(file)" v-if="file._directory">
                    <div class="other">
                        <Icon :type="file._icon" size="50"></Icon>
                    </div>
                    <span class="name">{{file._name}}</span>
                </div>
                <div class="view" @click="show(file)" v-else>
                    {{file.key}}
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
            <div style="flex-grow: 1"></div>
        </div>
    </div>
</template>
<script>
    import mixin_resource from '../mixins/mixin-resource';
    import * as util from '../service/util';
    import * as qiniu from '../cos/qiniu';

    export default {
        name: 'ResourceFileGrid',
        mixins: [mixin_resource],
        computed: {
            tableHeight() {
                let layout = this.$parent.$el;
                let style = window.getComputedStyle(layout.children[2]);
                return layout.clientHeight - layout.children[0].clientHeight - layout.children[1].clientHeight - parseInt(style.marginTop) - parseInt(style.marginBottom);
            }
        },
        props: {
            type: {
                type: Number,
                default: 0 // 0:grid 1:file
            }
        },
        data() {
            return {
                self: this,
                files: [],
                path: []//当前路径 a/b=> [a,b]
            };
        },
        watch: {
            'bucket.files': function () {
                this.type === 1 && this.fileFilter();
            },
        },
        mounted() {
            this.type === 1 && this.fileFilter();
        },
        methods: {
            showDirectory(file) {
                this.fileFilter(file.key);
            },
            // TODO:构建树状结构
            fileFilter(prefix) {
                let dirs = [];
                let files = [];
                this.bucket.files.forEach((file) => {
                    let temp_key = file.key;
                    if (prefix === undefined || temp_key.indexOf(prefix) === 0) {
                        //去除前缀然后再split
                        temp_key = temp_key.replace(prefix + qiniu.DELIMITER, '');
                        let temps = temp_key.split(qiniu.DELIMITER);
                        if (temps.length === 1) {//当前prefix下文件
                            files.push(file);
                        } else {//当前prefix下目录
                            if (dirs.indexOf(temps[0]) === -1) {
                                dirs.push(temps[0]);
                                files.push({_name: temps[0], key: temps[0], _directory: true, _icon: 'folder'});
                            }
                        }
                    }
                });

                files = files.sort(util.sequence);

                if (prefix !== undefined) {
                    let _arr = prefix.split(qiniu.DELIMITER);
                    files.unshift({
                        _name: '返回上级',
                        key: _arr[_arr.length - 2],
                        _directory: true,
                        _icon: 'arrow-return-left'
                    });
                }

                this.files = files;
            },
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
            justify-content: space-between;
            align-content: flex-start;
            padding: 10px;
            .card {
                height: 120px;
                width: 103px;
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