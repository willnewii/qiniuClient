<template>
    <div class="layout-content">
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
        <div class="gallery">
            <Card v-for="(file,index) in files" class="card" :padding="0" :bordered="false">
                <div v-if="file._directory && file._icon === 'folder'" class="view" @click="showDirectory(file)"
                     v-contextmenu:folderMenu :index="index">
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
                <div v-else class="view" @click="show(file)" v-contextmenu:fileMenu :index="index">
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
    import * as util from '../service/util';
    import * as constants from '../service/constants';
    import * as qiniu from '../cos/qiniu';

    export default {
        name: 'ResourceGrid',
        mixins: [resource, base],
        props: {
            type: {
                type: Number,
                default: 0 // 0:grid 1:file
            },
            keyWord: {//搜索关键字
                type: String,
                default: ''
            },
        },
        data() {
            return {
                self: this,
                contextFolderMenuIndex: -1,
                contextFileMenuIndex: -1,
                files: [],
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
                //当前路径
                cacheName: '',
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
        mounted() {
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
                        this.copy(file, constants.CopyType.URL);
                        break;
                    case 3:
                        this.copy(file, constants.CopyType.MARKDOWN);
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
            showDirectory(file) {
                this.bucket.folderPath = file._path;
            },
            /**
             * 根据前缀获取当前目录结构(文件夹/文件)
             * @param callback  回调
             */
            fileFilter(callback) {
                if (this.type === 0) {
                    this.files = this.bucket.files;
                    return;
                }

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
                            files.push(file);
                        } else {
                            if (_dirs.indexOf(temps[0]) === -1) {
                                _dirs.push(temps[0]);
                                files.push({
                                    _name: temps[0],
                                    _path: (folderPath ? folderPath + qiniu.DELIMITER : '') + temps[0],
                                    _directory: true,
                                    _icon: 'folder'
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
                        _icon: 'arrow-return-left'
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

    $imageWidth: 80px;

    .layout-content {
        margin: 15px;
        overflow-y: scroll;
        background: #fff;
        flex-grow: 1;
        border-radius: 4px;

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
                            background: rgba(28, 36, 56, 0.20);
                        }
                    }
                }
            }
        }
    }
</style>