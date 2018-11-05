//默认文件的分隔符
export const DELIMITER = '/';

export const protocol = 'http://';

export const method = {
    //列举一个账号的所有空间
    getBuckets: 'https://rs.qbox.me/buckets',
    //获取一个空间绑定的域名列表
    getDomains: 'https://api.qiniu.com/v6/domain/list',
    //获取目录(是通过公共前缀模拟出的效果)
    getResources: 'https://rsf.qbox.me/list',
};

export const Key = {
    withoutDelimiter: '__withoutDelimiter__',
    filter: '__filter__',
    app_setup: '__app__setup__',
    app_switch: '__app__switch__',
    app_logout: '__app__logout__',
    configuration: 'configuration',
};

export const PageName = {
    login: 'login',
    main: 'main',
    tray: 'tray',
    about: 'about',
    bucketPage: 'bucketPage',
    setup: 'setup',
};

export const URL = {
    github: 'https://github.com/willnewii/qiniuClient',
    issue: 'https://github.com/willnewii/qiniuClient/issues',
    releases: 'https://api.github.com/repos/willnewii/qiniuClient/releases/latest'
};

export const Event = {
    removes: 'removes',
    remove: 'remove',
    download: 'download',
    statusview: 'statusview',
    loading: 'loading',
    updateFiles: 'updateFiles'
};

export const CopyType = {
    URL: 'url',
    MARKDOWN: 'markdown'
};

export const UploadType = {
    UPLOAD: 'upload',
    FETCH: 'fetch'
};

/**
 * 以本地为基准,云对应不上的文件会被删除
 * 以云为基准,本地对应不上的文件会被删除
 * @type {{normal: number, baseCloud: number, baseLocal: number}}
 */
export const mergeType = {
    normal: 0,
    coverCloud: 1,
    coverLocal: 2
};

export const Listener = {
    uploadFile: 'upload-Files',
    downloadFile: 'downloadFile',
    showNotifier: 'show-Notifier',
    updateTrayTitle: 'update-TrayTitle',
    choiceDownloadFolder: 'choiceDownloadFolder',
    updateDownloadProgress: 'updateDownloadProgress',
    openFileDialog: 'open-file-dialog',
    selectedDirectory: 'selected-directory',
    readDirectory: 'read-directory',
    setBrand: 'setBrand',
    preview: 'preview',
    syncDirectory: 'syncDirectory',
    darkMode: 'darkMode'
};