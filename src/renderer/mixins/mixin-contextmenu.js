import {Constants, util, EventBus, brand} from "@/service/index";

export default {
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
        };
    },
    methods: {
        selectFile(index) {
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
        },
        changeFileName() {
            let files = [];
            let path = this.changeFileNameDialog.file.key;
            if (this.changeFileNameDialog.file._directory) {
                path = this.changeFileNameDialog.file._path;
            }
            let array = path.split(Constants.DELIMITER);
            array[array.length - 1] = this.changeFileNameDialog.input;
            let newPath = array.join(Constants.DELIMITER);

            if (!this.changeFileNameDialog.file._directory) {
                this.changeFileNameDialog.file._key = newPath;
                files.push(this.changeFileNameDialog.file);
            } else {
                for (let file of this.bucket.files) {
                    if (file.key.indexOf(path + Constants.DELIMITER) === 0) {
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
            let files = [];

            switch (action) {
                case 0://删除操作
                    this.resourceRemove(this.getFilebyPath(path));
                    break;
                case 1://目录详情
                    files = this.getFilebyPath(path);
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
                case 3://多选
                    this.selectFile(this.contextFolderMenuIndex);
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
                    this.folderInfoDialog.info = `文件路径：${file.key}\n上传时间：${util.formatDate(file.putTime)}\n大小：${util.formatFileSize(file.fsize)}\nETag：${file.ETag}`;
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
                case 5://多选
                    this.selectFile(this.contextFileMenuIndex);
                    break;
                case 6://下载
                    this.handleDownload(file);
            }
        },
    }
};