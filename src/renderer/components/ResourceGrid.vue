<template>
    <div ref="content" class="layout-content">
        <v-contextmenu ref="folderMenu" @contextmenu="handleFolderMenu">
            <v-contextmenu-item @click="handleFolderMenuClick(1)">详情</v-contextmenu-item>
            <v-contextmenu-item divider></v-contextmenu-item>
            <v-contextmenu-item @click="handleFolderMenuClick(2)">重命名</v-contextmenu-item>
            <v-contextmenu-item divider></v-contextmenu-item>
            <v-contextmenu-item @click="handleFolderMenuClick(0)"><span style="color: red;width: 300px">删除</span>
            </v-contextmenu-item>
        </v-contextmenu>
        <v-contextmenu ref="fileMenu" @contextmenu="handleFileMenu">
            <v-contextmenu-item @click="handleFileMenuClick(1)">详情</v-contextmenu-item>
            <v-contextmenu-item divider></v-contextmenu-item>
            <v-contextmenu-item @click="handleFileMenuClick(4)">重命名</v-contextmenu-item>
            <v-contextmenu-item divider></v-contextmenu-item>
            <v-contextmenu-item @click="handleFileMenuClick(2)">复制链接</v-contextmenu-item>
            <v-contextmenu-item divider></v-contextmenu-item>
            <v-contextmenu-item @click="handleFileMenuClick(3)">复制链接(Markdown)</v-contextmenu-item>
            <v-contextmenu-item divider></v-contextmenu-item>
            <v-contextmenu-item @click="handleFileMenuClick(0)"><span style="color: red;width: 300px">删除</span>
            </v-contextmenu-item>
        </v-contextmenu>
        <div class="grid" v-if="type === 1">
            <Card v-for="(file,index) in files" :key="file.key" class="card" :padding="0" :bordered="false">
                <div class="item" @click="clickItem(file,index)"
                     v-contextmenu="file._contextmenu" :index="index">
                    <template v-if="file._directory">
                        <div class="file">
                            <Icon :type="file._icon" size="50"></Icon>
                        </div>
                        <span class="name">{{file._name}}</span>
                    </template>
                    <template v-else>
                        <img v-if="/image\/(png|img|jpe?g)/.test(file.mimeType.toLowerCase())" class="image"
                             v-lazy="'http://' + bucket.domain + '/' + file.key + '?' + setup_imagestyle"/>
                        <img v-else-if="/image\/(svg|gif)/.test(file.mimeType.toLowerCase())" class="image"
                             v-lazy="'http://' + bucket.domain + '/' + file.key"/>
                        <div v-else class="file">
                            <Icon :type="file._icon" size="50"></Icon>
                        </div>
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
            <div style="flex-grow: 1"></div>
        </div>
        <virtual-list :size="29" :remain="remain" class="list" v-else-if="type === 0">
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
    import {resource, base} from '../mixins/index';
    import * as qiniu from '../cos/qiniu';
    import ResourceList from "@/components/ResourceList";
    import {EventBus, Constants, util,} from "@/service/index";

    export default {
        name: 'ResourceGrid',
        components: {ResourceList},
        mixins: [resource, base],
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
                contextFolderMenuIndex: -1,
                contextFileMenuIndex: -1,
                folderInfoDialog: {
                    show: false,
                    title: '',
                    info: ''
                },
                changeFileNameDialog: {
                    show: false,
                    title: '',
                    info: '',
                    key: '',
                    input: ''
                },
                files: [],
                //缓存当前路径
                cacheName: '',
                //是否在多选状态
                isMultiple: false,
                //多选数组
                selection: [],
                //virtual-list
                remain: 0,
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
                this.fileFilter((result) => {
                    if (this.keyWord) {
                        this.showMessage({
                            message: `匹配到${result.searchCount}个文件`
                        });
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
        },
        mounted() {
            this.remain = this.$refs['content'].offsetHeight / 29;
            
            this.fileFilter();
        },
        methods: {
            changeFileName() {
                let files = [];
                let path = this.changeFileNameDialog.file.key;
                if (this.changeFileNameDialog.file._directory) {
                    path = this.changeFileNameDialog.file._path;
                }
                let array = path.split(qiniu.DELIMITER);
                array[array.length - 1] = this.changeFileNameDialog.input;
                let newPath = array.join(qiniu.DELIMITER);

                if (!this.changeFileNameDialog.file._directory) {
                    this.changeFileNameDialog.file._key = newPath;
                    files.push(this.changeFileNameDialog.file);
                } else {
                    for (let file of this.bucket.files) {
                        if (file.key.indexOf(path + qiniu.DELIMITER) === 0) {
                            file._key = file.key.replace(path, newPath);
                            files.push(file);
                        }
                    }
                }
                EventBus.$emit(Constants.Event.loading, {
                    show: true,
                    message: '更新中...',
                });
                this.resourceRename(files);
            },
            handleFolderMenu(ref) {
                this.contextFolderMenuIndex = ref.data.attrs.index;
            },
            handleFolderMenuClick(action) {
                let path = this.files[this.contextFolderMenuIndex]._path;

                switch (action) {
                    case 0://删除操作
                        this.resourceRemove(this.getFilebyPath(path));
                        break;
                    case 1://目录详情
                        let files = this.getFilebyPath(path);
                        let size = 0;
                        files.forEach((item) => {
                            size += item.fsize;
                        });
                        this.folderInfoDialog.show = true;
                        this.folderInfoDialog.title = `${path}简介`;
                        this.folderInfoDialog.info = `共${files.length}个文件\n大小：${util.formatFileSize(size)}`;
                        break;
                    case 2://修改文件夹
                        this.changeFileNameDialog.show = true;
                        this.changeFileNameDialog.input = this.files[this.contextFolderMenuIndex]._name;
                        this.changeFileNameDialog.file = this.files[this.contextFolderMenuIndex];
                        break;
                }
            },
            handleFileMenu(ref) {
                this.contextFileMenuIndex = ref.data.attrs.index;
            },
            handleFileMenuClick(action) {
                let file = this.files[this.contextFileMenuIndex];

                switch (action) {
                    case 0://删除操作
                        this.resourceRemove(file);
                        break;
                    case 1:
                        this.folderInfoDialog.show = true;
                        this.folderInfoDialog.title = `${util.getPostfix(file.key)}简介`;
                        this.folderInfoDialog.info = `文件路径：${file.key}\n上传时间：${util.formatDate(file.putTime)}\n大小：${util.formatFileSize(file.fsize)}`;
                        break;
                    case 2:
                        this.copy(file, Constants.CopyType.URL);
                        break;
                    case 3:
                        this.copy(file, Constants.CopyType.MARKDOWN);
                        break;
                    case 4:
                        this.changeFileNameDialog.show = true;
                        this.changeFileNameDialog.input = util.getPostfix(file.key);
                        // this.changeFileNameDialog.input = file.key;
                        this.changeFileNameDialog.file = file;
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
            clickItem(file, index) {
                if (this.isMultiple) {

                    if (this.selection.indexOf(index) !== -1) {
                        this.selection.splice(this.selection.indexOf(index), 1);
                    } else {
                        this.selection.push(index);
                    }


                    let files = [];
                    for (const i of this.selection) {
                        let file = this.files[i];
                        if (file._directory) {
                            files = files.concat(this.getFilebyPath(file._path));
                        } else {
                            files = files.concat(file);
                        }
                    }
                    this.bucket.selection = files;
                } else {
                    if (file._directory) {
                        this.bucket.folderPath = file._path;
                    } else {
                        this.show(file);
                    }
                }
            },
            /**
             * 根据前缀获取当前目录结构(文件夹/文件)
             * @param callback  回调
             */
            fileFilter(callback) {
                this.selection = [];
                this.bucket.selection = [];
                let folderPath = this.bucket.folderPath;
                let _dirs = [];
                let files = [];
                let resultCount = 0;

                this.bucket.files.forEach((file) => {
                    let temp_key = file.key;
                    if (folderPath === '' || temp_key.indexOf(folderPath + qiniu.DELIMITER) === 0) {

                        if (this.keyWord) {
                            if (temp_key.indexOf(this.keyWord) === -1) {
                                return;
                            } else {
                                resultCount++;
                            }
                        }

                        //去除前缀然后再split
                        if (folderPath.length > 0) {
                            temp_key = temp_key.replace(folderPath + qiniu.DELIMITER, '');
                        }
                        let temps = temp_key.split(qiniu.DELIMITER);
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
                                    key: (folderPath ? folderPath + qiniu.DELIMITER : '') + temps[0],
                                    _name: temps[0],
                                    _path: (folderPath ? folderPath + qiniu.DELIMITER : '') + temps[0],
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

                this.files = [];
                //TODO:优化显示速度
                this.$nextTick(function () {
                    this.files = files;
                    callback && callback({searchCount: resultCount});
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
    @import "../style/params";

    $imageWidth: 80px;

    .layout-content {
        margin: 0 15px 15px 15px;
        overflow-y: scroll;
        background: $bg-resource;
        flex-grow: 1;
        border-radius: 4px;

        .grid {
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
            }
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
                    display: flex;
                    justify-content: center;
                    align-items: center;
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
            .item-select {
                color: white;
                background-color: $primary !important;
            }
        }
        .item {
            .name {
                white-space: nowrap;
                /*font-weight: bold;*/
                overflow: hidden;
                text-overflow: ellipsis;
            }
        }
    }
</style>