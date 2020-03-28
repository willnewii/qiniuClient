<template>
    <div ref="content" class="layout-content">
        <v-contextmenu ref="folderMenu" @contextmenu="handleFolderMenu">
            <v-contextmenu-item @click="handleFolderMenuClick(1)">详情</v-contextmenu-item>
            <v-contextmenu-item divider></v-contextmenu-item>
            <v-contextmenu-item @click="handleFolderMenuClick(2)">重命名</v-contextmenu-item>
            <v-contextmenu-item divider></v-contextmenu-item>
            <v-contextmenu-item @click="handleFolderMenuClick(3)">选择</v-contextmenu-item>
            <v-contextmenu-item divider></v-contextmenu-item>
            <v-contextmenu-item @click="handleFolderMenuClick(4)">全选</v-contextmenu-item>
            <v-contextmenu-item divider></v-contextmenu-item>
            <v-contextmenu-item @click="handleFolderMenuClick(0)"><span style="color: red;width: 300px">删除</span>
            </v-contextmenu-item>
        </v-contextmenu>
        <v-contextmenu ref="fileMenu" @contextmenu="handleFileMenu">
            <v-contextmenu-item @click="handleFileMenuClick(1)">详情</v-contextmenu-item>
            <v-contextmenu-item divider></v-contextmenu-item>
            <v-contextmenu-item @click="handleFileMenuClick(4)">重命名</v-contextmenu-item>
            <v-contextmenu-item divider></v-contextmenu-item>
            <v-contextmenu-item @click="handleFileMenuClick(5)">选择</v-contextmenu-item>
            <v-contextmenu-item divider></v-contextmenu-item>
            <v-contextmenu-item @click="handleFileMenuClick(7)">全选</v-contextmenu-item>
            <v-contextmenu-item divider></v-contextmenu-item>
            <v-contextmenu-item @click="handleFileMenuClick(2)">复制链接</v-contextmenu-item>
            <v-contextmenu-item divider></v-contextmenu-item>
            <v-contextmenu-item @click="handleFileMenuClick(3)">复制链接(Markdown)</v-contextmenu-item>
            <v-contextmenu-item divider></v-contextmenu-item>
            <v-contextmenu-item @click="handleFileMenuClick(6)">下载</v-contextmenu-item>
            <v-contextmenu-item divider></v-contextmenu-item>
            <v-contextmenu-item @click="handleFileMenuClick(0)"><span style="color: red;width: 300px">删除</span>
            </v-contextmenu-item>
        </v-contextmenu>
        <virtual-list :size="123" :remain="remain1" :bench="10" :debounce="500" class="grid2" v-if="type === 1" key="1">
            <div v-for="(items,index1) of getFileByGrid(files)" class="grid2-item" :key="index1">
                <Card v-for="(file,index) of items" :key="file.key" class="card" :padding="0" :bordered="false"
                      v-bind:class="{'item-select': selection.indexOf(files.indexOf(file)) !== -1}">
                    <div class="item" @click="clickItem(file,files.indexOf(file))"
                         v-contextmenu="file._directory ? 'folderMenu' : 'fileMenu' " :index="file">
                        <template v-if="file._directory">
                            <Icon class="file" :type="file._icon" size="50"></Icon>
                            <span class="name">{{file._name}}</span>
                        </template>
                        <template v-else>
                            <img v-if="file._icon==='md-image' && file.imgObj.src" class="image" v-lazy="file.imgObj"/>
                            <Icon v-else class="file" :type="file._icon" size="50"></Icon>
                            <span class="name">{{file.displayName}}</span>
                            <div class="btn">
                                <Button shape="circle" size="small" icon="md-download"
                                        @click.stop="fileAction(file , 0)"
                                        style="background: #FFFFFF"></Button>
                                <Button shape="circle" size="small" icon="md-clipboard"
                                        @click.stop="copyFileUrl(file)" style="background: #FFFFFF"></Button>
                                <Button type="error" shape="circle" size="small" icon="md-trash"
                                        @click.stop="resourceRemove(file)"></Button>
                            </div>
                        </template>
                    </div>
                </Card>
            </div>
        </virtual-list>
        <virtual-list :size="29" :remain="remain0" class="list" v-else-if="type === 0" key="0">
            <div v-for="(file,index) of files" :key="file.key" class="item"
                 v-bind:class="{'item-select': selection.indexOf(index) !== -1}" @click="clickItem(file,index)"
                 v-contextmenu="file._directory ? 'folderMenu' : 'fileMenu' " :index="file">
                <template v-if="file._directory">
                    <Icon :type="file._icon" size="15"></Icon>
                    <span class="name">{{file._name}}</span>
                </template>
                <template v-else>
                    <Icon :type="file._icon" size="15"></Icon>
                    <span class="name">{{file.displayName}}</span>
                    <span class="date">{{file.putTime | formatDate}}</span>
                    <span class="size">{{file.fsize | formatFileSize}}</span>
                </template>
            </div>
        </virtual-list>

        <Modal v-model="folderInfoDialog.show" :title="folderInfoDialog.title" @on-ok="">
            <div style="white-space: pre-line">
                {{folderInfoDialog.info}}
            </div>
            <div slot="footer">
            </div>
        </Modal>
        <Modal v-model="changeFileNameDialog.show" title="重命名" @on-ok="changeFileName">
            <Input v-model="changeFileNameDialog.input"/>
        </Modal>

        <viewer :options="options" :images="previewImages" ref="viewer" @inited="inited" style="display: none">
            <img class="image-wrapper" v-for="src in previewImages" :key="src"
                 :src="src" :data-source="src" :alt="src.split('?image=').pop()">
        </viewer>
    </div>
</template>
<script>
    import {resource, base, contextmenu} from '../mixins/index';
    import {EventBus, Constants, util, brand} from "@/service/index";

    export default {
        name: 'ResourceGrid',
        components: {},
        mixins: [resource, base, contextmenu],
        props: {
            type: {
                type: Number,
                default: 1 // 0:grid 1:list
            },
        },
        data() {
            return {
                files: [],
                //缓存当前路径
                cacheName: '',
                //点击时间戳，判断是否为双击
                itemClickTime: 0,
                //多选数组
                selection: [],
                //virtual-list
                remain0: 0,
                remain1: 0,
                step: 6,    //每行加载数
                //图片查看配置项
                options: {
                    inline: false,
                    button: true,
                    navbar: false,
                    title: true,
                    toolbar: true,
                    tooltip: true,
                    movable: true,
                    zoomable: true,
                    rotatable: true,
                    scalable: true,
                    transition: true,
                    fullscreen: true,
                    keyboard: true,
                    url: 'data-source'
                },
            };
        },
        watch: {
            'bucket.files': function () {
                if (this.cacheName !== this.bucket.name) {
                    this.cacheName = this.bucket.name;
                }
                this.fileFilter();
            },
            'bucket.folderPath': function (newValue) {
                //又拍 特别处理
                // this.bucket.getResources(null, this.bucket.folderPath);
                this.fileFilter();
            },
            'bucket.selection': function (newValue) {
                if (newValue && newValue.length === 0) {
                    this.selection = [];
                }
            },
        },
        created() {
            EventBus.$on(Constants.Event.updateFiles, (option = {}) => {
                if (option.keyWord) {
                    option.callback = (result) => {
                        this.$Message.info(`匹配到${result.searchCount}个文件`);
                    };
                }
                this.fileFilter(option);
            });
            EventBus.$on(Constants.Event.refreshFiles, (action) => {
                this.bucket.getResources();
            });

            EventBus.$on(Constants.Event.resourceAction, (files, action) => {
                this.resourceAction(files, action);
            });

            this.$electron.ipcRenderer.on(Constants.Listener.updateDownloadProgress, (event, num) => {
                this.$Loading.update(num * 100);
                EventBus.$emit(Constants.Event.statusView, {
                    message: `文件下载中(${this.status_count}/${this.status_total})...${parseFloat(num * 100).toFixed(2)}%`,
                    progress: this.status_total === 1 ? 0 : parseInt(this.status_count / this.status_total * 100)
                });
                if (num === 1) {
                    this.queueTask();
                }
            });

            this.$electron.ipcRenderer.on(Constants.Listener.syncDirectory, (event, results) => {
                let finishCount = 0;
                //  下载任务
                if (results.downloads && results.downloads.length > 0) {
                    this.baseDir = results.baseDir;
                    this.resourceAction(results.downloads, Constants.ActionType.download);
                } else {
                    ++finishCount;
                }

                //  上传任务
                if (results.uploads && results.uploads.length > 0) {
                    this.resourceAction(results.uploads, Constants.ActionType.upload);
                } else {
                    ++finishCount;
                }

                //  删除任务
                if (results.deletes && results.deletes.length > 0) {
                    this.resourceAction(results.deletes, Constants.ActionType.remove);
                } else {
                    ++finishCount;
                }

                if (finishCount === 3) {
                    util.notification({body: '没有需要同步的任务'});
                }
            });

            this.$once('hook:beforeDestroy', function () {
                EventBus.$off(Constants.Event.updateFiles);
                EventBus.$off(Constants.Event.refreshFiles);
                EventBus.$off(Constants.Event.resourceAction);

                this.$electron.ipcRenderer.removeAllListeners(Constants.Listener.updateDownloadProgress);
                this.$electron.ipcRenderer.removeAllListeners(Constants.Listener.syncDirectory);
            });
        },
        mounted() {
            this.fileFilter();

            this.$nextTick(() => {
                let height = this.$refs['content'].offsetHeight;
                this.remain0 = height / 29;
                this.remain1 = height / 123;
            });

            this.step = parseInt(this.$refs['content'].offsetWidth / 123);

            window.onresize = () => {
                this.step = parseInt(this.$refs['content'].offsetWidth / 123);
            };
        },
        methods: {
            inited(viewer) {
                this.$viewer = viewer;
            },
            /**
             * index 当前UI中的下标
             */
            clickItem(file, index) {
                let time = new Date().getTime();
                const CLICKTIME = 300;

                if ((time - this.itemClickTime) < CLICKTIME) {
                    this.itemClickTime = 0;

                    if (file._directory) {
                        if (this.bucket.paging) {//切换目录模式,需要重置marker
                            this.bucket.marker = null;
                            this.bucket.getResources({
                                keyword: file._path
                            });
                        }
                        console.log(file, file._path);
                        this.bucket.folderPath = file._path;
                    } else {
                        this.preview(file);
                    }
                } else {
                    if (this.itemClickTime === 0) {
                        setTimeout(() => {
                            if (this.itemClickTime !== 0) {
                                this.selectFile(index);
                            }
                            this.itemClickTime = 0;
                        }, CLICKTIME);
                    } else {
                        console.log('nothing');
                    }
                    this.itemClickTime = time;
                }
            },
            addFileIcon(file) {
                if (util.isSupportImage(file.mimeType.toLowerCase())) {
                    file.imgObj = this.getImgUrlWithStyle(file);
                    file._icon = 'md-image';
                } else if (file.mimeType.indexOf('audio') === 0) {
                    file._icon = 'md-musical-notes';
                } else {
                    file._icon = 'md-document';
                }
            },
            getImgUrlWithStyle(file) {
                let imageStyle = this.setup_imagestyle;
                if (/image\/(svg|gif)/.test(file.mimeType.toLowerCase())) {
                    imageStyle = '';
                }

                let url = this.bucket.generateUrl(file.key, this.setup_deadline);
                let imageSrc = '';
                switch (this.$storage.key) {
                    case brand.qiniu.key:
                        if (parseInt(this.bucket.permission) === 1) {//如果是私密空间直接显示原图
                            imageSrc = url;
                        } else {
                            imageSrc = url ? `${url}${imageStyle}` : '';
                        }
                        break;
                    case brand.aliyun.key:
                        if (imageStyle) {
                            imageStyle = 'x-oss-process=image/format,jpg/auto-orient,1/quality,q_30';
                        }
                        // 加载图片样式会报签名错误
                        imageSrc = `${url}${url.indexOf('?') !== -1 ? '' : '?' + imageStyle}`;
                        break;
                    default:
                        imageSrc = url;
                }
                return {
                    src: imageSrc,
                    error: require('../assets/img/md-image.svg')
                };
            },
            getFileByGrid() {
                let array = [];
                for (let i = 0; i < this.files.length; i += this.step) {
                    array.push(this.files.slice(i, i + this.step > this.files.length ? this.files.length : i + this.step));
                }
                return array;
            },
            /**
             * 根据前缀获取当前目录下的所有文件
             * @param prefix
             */
            getFileByPath(prefix) {
                return this.bucket.files.filter((file) => {
                    return file.key.indexOf(prefix + Constants.DELIMITER) === 0;
                });
            },
            /**
             * 根据前缀获取当前目录结构(文件夹/文件)
             * flatten: 不显示文件夹解构, 搜索和筛选时这样显示比较友好
             * @param option  (source, keyWord, flatten, callback)
             */
            fileFilter(option = {flatten: false}) {
                this.selection = [];
                this.bucket.selection = [];
                let folderPath = option.flatten ? '' : this.bucket.folderPath;
                let _dirs = [];
                let files = [];
                //images 用于图片预览
                let images = [];
                let resultCount = 0;

                (option.source || this.bucket.files).forEach((file) => {
                    let temp_key = file.key;
                    if (folderPath === '' || temp_key.indexOf(folderPath + Constants.DELIMITER) === 0) {

                        if (option.keyWord) {
                            if (file.displayName.toLowerCase().indexOf(option.keyWord.toLowerCase()) === -1) {
                                return;
                            } else {
                                resultCount++;
                            }
                        }

                        //又拍云 && 七牛云(自定义) 通过type参数判断文件夹
                        if (file.type === Constants.FileType.folder) {
                            let temp = {
                                key: temp_key.replace(folderPath + Constants.DELIMITER, ''),
                                _name: temp_key.replace(folderPath + Constants.DELIMITER, ''),
                                _path: file.key,
                                _directory: true,
                                _icon: 'md-folder',
                            };
                            files.push(temp);
                            return;
                        } else if (folderPath.length > 0) {//去除前缀然后再split
                            temp_key = temp_key.replace(folderPath + Constants.DELIMITER, '');
                        }
                        let temps = temp_key.split(Constants.DELIMITER);
                        //根据分隔符切分,如果 length ===1 ,则为文件,否则为下级目录
                        if (option.flatten || temps.length === 1) {
                            this.addFileIcon(file);
                            file.imgObj && images.push(file);
                            files.push(file);
                        } else {
                            if (_dirs.indexOf(temps[0]) === -1) {
                                _dirs.push(temps[0]);
                                files.push({
                                    key: (folderPath ? folderPath + Constants.DELIMITER : '') + temps[0],
                                    _name: temps[0],
                                    _path: (folderPath ? folderPath + Constants.DELIMITER : '') + temps[0],
                                    _directory: true,
                                    _icon: 'md-folder',
                                });
                            }
                        }
                    }
                });

                files = files.sort(util.sequence);
                images = images.sort(util.sequence);
                if (folderPath !== '') {
                    let lastIndex = folderPath.lastIndexOf('/');
                    files.unshift({
                        _name: '返回上级',
                        _path: lastIndex !== -1 ? folderPath.substring(0, lastIndex) : '',
                        _directory: true,
                        _icon: 'md-return-left'
                    });
                }

                this.files = Object.freeze(files);

                this.previewImages = images.map((item) => {
                    return this.getResourceUrl(item);
                });
                option.callback && option.callback({searchCount: resultCount});
            },
            fileAction(file, action) {
                switch (action) {
                    case 0:
                        this.resourceAction(file, Constants.ActionType.download);
                        break;
                    case 1:

                        break;
                }
                this.bucket.selection = [];
            }
        }
    };
</script>
<style lang="scss" scoped>
    @import "../style/params";

    $imageWidth: 80px;

    .layout-content {
        margin: 0 15px 15px 15px;
        overflow: hidden;
        background: $bg-resource;
        flex-grow: 1;
        border-radius: 4px;

        .grid2 {
            padding: 10px;
            box-sizing: content-box;
            transform: translateZ(0);

            .grid2-item {
                display: flex;
                flex-direction: row;
            }
        }

        .card {
            height: 113px;
            width: 113px;
            margin: 5px;

            .item {
                display: flex;
                flex-direction: column;
                align-items: center;

                .image {
                    height: $imageWidth;
                    width: $imageWidth;
                    min-height: $imageWidth;
                    min-width: $imageWidth;
                    padding: 10px;
                    object-fit: cover;
                }

                .file {
                    height: $imageWidth;
                    width: $imageWidth;
                    line-height: $imageWidth;
                    text-align: center;
                }

                .name {
                    font-size: 12px;
                    max-width: $imageWidth;
                    margin-top: 5px;
                    text-align: center;
                }

                .btn {
                    opacity: 0;
                    display: flex;
                    flex-direction: row;
                    justify-content: space-around;
                    position: absolute;
                    align-items: center;
                    width: 100%;
                    height: 100%;
                    border-radius: 4px;
                    transition: all .2s;
                }

                &:hover {
                    .btn {
                        opacity: 1;
                        background: rgba(28, 36, 56, 0.20);
                    }
                }
            }
        }

        .list {
            transform: translateZ(0);
            height: 100%;

            .item {
                display: flex;
                flex-direction: row;
                padding: 5px 10px 5px 10px;
                align-items: center;
                border-bottom: 1px solid $bg-item-selected;

                .name {
                    flex-grow: 1;
                    margin-left: 5px;
                }

                .date {
                    text-align: right;
                    flex-shrink: 0;
                    margin-left: 10px;
                }

                .size {
                    width: 100px;
                    text-align: right;
                    flex-shrink: 0;
                }

                &:nth-child(2n) {
                    background-color: $bg-item-selected;
                }

                &:hover {
                    background: rgba(28, 36, 56, 0.20);
                }
            }

            .item-even {
                background-color: $bg-item-selected;
            }
        }

        .item {
            .name {
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            &-select {
                color: white;
                background-color: $primary !important;
            }
        }
    }
</style>
