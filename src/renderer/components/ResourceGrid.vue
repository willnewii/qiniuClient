<template>
    <div class="layout-content">
        <v-contextmenu ref="contextmenu" @contextmenu="handleContextMenu">
            <v-contextmenu-item @click="handleContextMenuClick(1)">详情</v-contextmenu-item>
            <v-contextmenu-item divider></v-contextmenu-item>
            <v-contextmenu-item @click="handleContextMenuClick(0)"><span style="color: red;width: 300px">删除</span>
            </v-contextmenu-item>
        </v-contextmenu>
        <div class="gallery" :style="{height: tableHeight+ 'px'}">
            <Card v-for="(file,index) in files" class="card" :padding="0" :bordered="false">
                <div v-if="file._directory && file._icon === 'folder'" class="view" @click="showDirectory(file)"
                     v-contextmenu:contextmenu :index="index">
                    <div class="file">
                        <Icon :type="file._icon" size="50"></Icon>
                    </div>
                    <span class="name">{{file._name}}</span>
                </div>
                <div v-else-if="file._directory && file._icon !== 'folder'" class="view" @click="showDirectory(file)">
                    <div class="file">
                        <Icon :type="file._icon" size="50"></Icon>
                    </div>
                    <span class="name">{{file._name}}</span>
                </div>
                <div v-else class="view" @click="show(file)">
                    <img v-if="/image\/(png|img|jpe?g){1}/.test(file.mimeType.toLowerCase())" class="image"
                         v-lazy="'http://' + bucket.domain + '/' + file.key + '?' + setup_imagestyle">
                    <div v-else-if="file.mimeType.indexOf('audio')===0" class="file">
                        <Icon type="music-note" size="50"></Icon>
                    </div>
                    <div v-else class="file">
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
                    <span class="name">{{file.key | getfileNameByUrl}}</span>
                </div>
            </Card>
            <div style="flex-grow: 1"></div>
        </div>
        <Modal
                v-model="folderInfoDialog.show"
                :title="folderInfoDialog.title"
                @on-ok="">
            {{folderInfoDialog.info}}
            <div slot="footer">
            </div>
        </Modal>
    </div>
</template>
<script>
    import mixin_resource from '../mixins/mixin-resource';
    import * as util from '../service/util';
    import * as qiniu from '../cos/qiniu';

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
        props: {
            type: {
                type: Number,
                default: 0 // 0:grid 1:file
            },
            _folderPath: {//base 路径
                type: String,
                default: undefined
            },
        },
        data() {
            return {
                self: this,
                contextMenuIndex: -1,
                files: [],
                folderInfoDialog: {
                    show: false,
                    title: '',
                    info: ''
                },
                folderPath: undefined,
                cacheName: '',
            };
        },
        watch: {
            'bucket.files': function () {
                if (this.cacheName !== this.bucket.name) {
                    this.cacheName = this.bucket.name;
                    this.folderPath = undefined;
                }
                this.fileFilter(this.folderPath);
            },
            '_folderPath': function (newValue) {
                if (newValue !== this.folderPath) {
                    this.folderPath = newValue;
                    this.fileFilter(this.folderPath);
                }
            },
        },
        mounted() {
            this.fileFilter(this.folderPath);
        },
        methods: {
            handleContextMenu(ref) {
                this.contextMenuIndex = ref.data.attrs.index;
            },
            handleContextMenuClick(action) {
                let path = this.files[this.contextMenuIndex]._path;

                switch (action) {
                    case 0://删除操作
                        this.bucket.selection = this.getFilebyPath(path);
                        this.$parent.askRemove();
                        break;
                    case 1://目录详情
                        let files = this.getFilebyPath(path);
                        let size = 0;
                        files.forEach((item) => {
                            size += item.fsize;
                        });
                        this.folderInfoDialog.show = true;
                        this.folderInfoDialog.title = `${path}简介`;
                        this.folderInfoDialog.info = `共${files.length}个文件,大小:${util.formatFileSize(size)}`;
                        break;
                }
            },
            /**
             * 根据前缀获取当前目录下的所有文件
             * @param prefix
             */
            getFilebyPath(prefix) {
                let files = [];
                this.bucket.files.forEach((file) => {
                    let temp_key = file.key;
                    if (temp_key.indexOf(prefix + qiniu.DELIMITER) === 0) {
                        files.push(file);
                    }
                });
                return files;
            },
            showDirectory(file) {
                this.fileFilter(file._path);
            },
            /**
             * 根据前缀获取当前目录结构(文件夹/文件)
             * @param prefix
             */
            fileFilter(prefix) {
                if (this.type === 0) {
                    this.files = this.bucket.files;
                    return;
                }

                this.folderPath = prefix;
                //文件夹模式下,路径修改的回调
                this.$emit('onPathUpdate', this.folderPath);

                let _dirs = [];
                let files = [];
                this.bucket.files.forEach((file) => {
                    let temp_key = file.key;
                    if (prefix === undefined || temp_key.indexOf(prefix + qiniu.DELIMITER) === 0) {
                        //去除前缀然后再split
                        temp_key = temp_key.replace(prefix + qiniu.DELIMITER, '');
                        let temps = temp_key.split(qiniu.DELIMITER);
                        if (temps.length === 1) {//当前prefix下文件
                            files.push(file);
                        } else {//当前prefix下目录
                            if (_dirs.indexOf(temps[0]) === -1) {
                                _dirs.push(temps[0]);
                                files.push({
                                    _name: temps[0],
                                    _path: prefix ? prefix + qiniu.DELIMITER + temps[0] : temps[0],
                                    _directory: true,
                                    _icon: 'folder'
                                });
                            }
                        }
                    }
                });

                files = files.sort(util.sequence);
                if (prefix !== undefined) {
                    let lastIndex = prefix.lastIndexOf('/');
                    files.unshift({
                        _name: '返回上级',
                        _path: lastIndex !== -1 ? prefix.substring(0, lastIndex) : undefined,
                        _directory: true,
                        _icon: 'arrow-return-left'
                    });
                }

                //清除view绑定的右键事件
                this.$refs['contextmenu'].references.forEach((ref) => {
                    ref.el.removeEventListener(this.$refs['contextmenu'].eventType, this.$refs['contextmenu'].handleReferenceContextmenu);
                });
                this.$refs['contextmenu'].references = [];
                this.files = [];

                this.$nextTick(function () {
                    this.files = files;
                });
            },
            handleDownload(file) {
                this.bucket.selection = [file];
                this.downloadFiles();
            },
        }
    };
</script>
<style lang="scss" scoped>

    $imageWidth: 80px;

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
                height: 113px;
                width: 113px;
                margin: 5px;
                .view {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    .image {
                        height: $imageWidth;
                        width: $imageWidth;
                        min-height: $imageWidth;
                        min-width: $imageWidth;
                        margin-top: 5px;
                    }
                    .file {
                        height: $imageWidth;
                        width: $imageWidth;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                    }
                    .name {
                        font-size: 12px;
                        max-width: $imageWidth;
                        white-space: nowrap;
                        text-overflow: ellipsis;
                        overflow: hidden;
                        margin-top: 5px;
                        text-align: center;
                    }
                    .btn {
                        opacity: 0;
                        display: flex;
                        flex-direction: row;
                        justify-content: space-around;
                        align-items: center;
                        position: absolute;
                        width: 100%;
                        height: 100%;
                        transition: all .2s;
                    }
                    &:hover {
                        .btn {
                            opacity: 1;
                            background: rgba(28, 36, 56, 0.22);
                        }
                    }
                }
            }
        }
    }
</style>