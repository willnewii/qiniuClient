<template>
    <div ref="content" class="layout-content">
        <v-contextmenu ref="folderMenu" @contextmenu="handleFolderMenu">
            <v-contextmenu-item @click="handleFolderMenuClick(1)">详情</v-contextmenu-item>
            <v-contextmenu-item divider></v-contextmenu-item>
            <v-contextmenu-item @click="handleFolderMenuClick(2)">重命名</v-contextmenu-item>
            <v-contextmenu-item divider></v-contextmenu-item>
            <v-contextmenu-item @click="handleFolderMenuClick(3)">选择</v-contextmenu-item>
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
            <div v-for="(items,index1) of getFilebyGrid(files)" class="grid2-item" :key="index1">
                <Card v-for="(file,index) of items" :key="file.key" class="card" :padding="0" :bordered="false"
                      v-bind:class="{'item-select': selection.indexOf(files.indexOf(file)) !== -1}">
                    <div class="item" @click="clickItem(file,files.indexOf(file))"
                         v-contextmenu="file._contextmenu" :index="files.indexOf(file)">
                        <template v-if="file._directory">
                            <Icon class="file" :type="file._icon" size="50"></Icon>
                            <span class="name">{{file._name}}</span>
                        </template>
                        <template v-else>
                            <img v-if="/image\/(png|img|jpe?g|svg|gif)/.test(file.mimeType.toLowerCase())" class="image"
                                 v-lazy="getUrlbyMimeType(file)"/>
                            <Icon v-else class="file" :type="file._icon" size="50"></Icon>
                            <span class="name">{{file.key | getfileNameByUrl}}</span>
                            <div class="btn">
                                <Button shape="circle" size="small" icon="md-download"
                                        @click.stop="handleDownload(file)" style="background: #FFFFFF"></Button>
                                <Button shape="circle" size="small" icon="md-clipboard"
                                        @click.stop="copy(file)" style="background: #FFFFFF"></Button>
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
                 v-bind:class="{'item-select': selection.indexOf(index) !== -1}"
                 @click="clickItem(file,index)"
                 v-contextmenu="file._contextmenu" :index="index">
                <template v-if="file._directory">
                    <Icon :type="file._icon" size="15"></Icon>
                    <span class="name">{{file._name}}</span>
                </template>
                <template v-else>
                    <Icon :type="file._icon" size="15"></Icon>
                    <span class="name">{{file.key | getfileNameByUrl}}</span>
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
            keyWord: {//搜索关键字
                type: String,
                default: ''
            },
        },
        data() {
            return {
                files: [],
                //缓存当前路径
                cacheName: '',
                //是否在多选状态
                isMultiple: false,
                //多选数组
                selection: [],

                //virtual-list
                remain0: 0,
                remain1: 0,
                step: 6
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
                this.fileFilter();
            },
            'bucket.selection': function (newValue) {
                if (newValue && newValue.length === 0) {
                    this.selection = [];
                }
            },
            'keyWord': function () {
                this.fileFilter({
                    callback: (result) => {
                        if (this.keyWord) {
                            this.showMessage({
                                message: `匹配到${result.searchCount}个文件`
                            });
                        }
                    }
                });
            },
        },
        created() {
            document.onkeydown = (event) => {
                let e = event || window.event || arguments.callee.caller.arguments[0];
                switch (e.keyCode) {
                    case 91://command(mac)
                    case 93:
                    case 17://control(win)
                        this.isMultiple = true;
                        break;
                }
            };
            document.onkeyup = (event) => {
                let e = event || window.event || arguments.callee.caller.arguments[0];
                switch (e.keyCode) {
                    case 91://command
                    case 93:
                    case 17://control
                        this.isMultiple = false;
                        break;
                }
            };
            EventBus.$on(Constants.Event.updateFiles, (files) => {
                this.files = files;
                /*this.fileFilter({
                    source: files,
                    callback: (result) => {
                        if (this.keyWord) {
                            this.showMessage({
                                message: `筛选到${result.searchCount}个文件`
                            });
                        }
                    }
                });*/
            });
        },
        mounted() {
            this.remain0 = this.$refs['content'].offsetHeight / 29;
            this.remain1 = this.$refs['content'].offsetHeight / 123;

            this.fileFilter();
        },
        methods: {
            clickItem(file, index) {
                if (this.isMultiple) {
                    this.selectFile(index);
                } else {
                    if (file._directory) {
                        this.bucket.folderPath = file._path;
                    } else {
                        this.show(file);
                    }
                }
            },
            getUrlbyMimeType(file) {
                let temp = '?' + this.setup_imagestyle;
                if (/image\/(svg|gif)/.test(file.mimeType.toLowerCase())) {
                    temp = '';
                }
                switch (this.$storage.name) {
                    case brand.qiniu.key:
                        return `${this.bucket.generateUrl(file.key)}${temp}`;
                    case brand.tencent.key:
                        return this.bucket.generateUrl(file.key);
                }
            },
            getFilebyGrid() {
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
            getFilebyPath(prefix) {
                let files = [];
                this.bucket.files.forEach((file) => {
                    let temp_key = file.key;
                    if (temp_key.indexOf(prefix + Constants.DELIMITER) === 0) {
                        files.push(file);
                    }
                });
                return files;
            },
            /**
             * 根据前缀获取当前目录结构(文件夹/文件)
             * @param option  {source , callback}
             */
            fileFilter(option = {}) {
                this.selection = [];
                this.bucket.selection = [];
                let folderPath = this.bucket.folderPath;
                let _dirs = [];
                let files = [];
                let resultCount = 0;

                (option.source || this.bucket.files).forEach((file) => {
                    let temp_key = file.key;
                    if (folderPath === '' || temp_key.indexOf(folderPath + Constants.DELIMITER) === 0) {

                        if (this.keyWord) {
                            if (temp_key.toLowerCase().indexOf(this.keyWord.toLowerCase()) === -1) {
                                return;
                            } else {
                                resultCount++;
                            }
                        }

                        //去除前缀然后再split
                        if (folderPath.length > 0) {
                            temp_key = temp_key.replace(folderPath + Constants.DELIMITER, '');
                        }
                        let temps = temp_key.split(Constants.DELIMITER);
                        //根据分隔符切分,如果 length ===1 ,则为文件,否则为下级目录
                        if (temps.length === 1) {
                            if (/image\/(png|img|jpe?g){1}/.test(file.mimeType.toLowerCase())) {
                                file._icon = 'md-image';
                            } else if (file.mimeType.indexOf('audio') === 0) {
                                file._icon = 'md-musical-notes';
                            } else {
                                file._icon = 'md-document';
                            }
                            file._contextmenu = 'fileMenu';
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
                                    _contextmenu: 'folderMenu'
                                });
                            }
                        }
                    }
                });

                files = files.sort(util.sequence);
                if (folderPath !== '') {
                    let lastIndex = folderPath.lastIndexOf('/');
                    files.unshift({
                        _name: '返回上级',
                        _path: lastIndex !== -1 ? folderPath.substring(0, lastIndex) : '',
                        _directory: true,
                        _icon: 'md-return-left'
                    });
                }

                //清除view绑定的ContentMenu事件
                ['folderMenu', 'fileMenu'].forEach((item) => {
                    if (this.$refs[item] && this.$refs[item].references) {
                        this.$refs[item].references.forEach((ref) => {
                            ref.el.removeEventListener(this.$refs[item].eventType, this.$refs[item].handleReferenceContextmenu);
                        });
                        this.$refs[item].references = [];
                    }
                });

                // files.length = parseInt(files.length / 2);
                this.files = [];
                this.$nextTick(function () {
                    this.files = Object.freeze(files);
                    option.callback && option.callback({searchCount: resultCount});
                });
            },
            handleDownload(file) {
                this.bucket.downloads = [file];
                this.resourceDownload();
            },
        }
    };
</script>
<style lang="scss" scoped>
    @import "../style/params";

    $imageWidth: 80px;

    .layout-content {
        margin: 0 15px 15px 15px;
        overflow-y: scroll;
        background: $bg-resource;
        flex-grow: 1;
        border-radius: 4px;

        .grid2 {
            padding: 10px;
            box-sizing: content-box;
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