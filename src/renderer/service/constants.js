//默认文件的分隔符
export const DELIMITER = '/'

export const Key = {
  filter: '__filter__',
  app_setup: '__app__setup__',
  app_switch: '__app__switch__',
  app_logout: '__app__logout__',
  configuration: 'configuration',
}

export const PageName = {
  login: 'login',
  main: 'main',
  tray: 'tray',
  about: 'about',
  bucketPage: 'bucketPage',
  setup: 'setup',
}

export const URL = {
  github: 'https://github.com/willnewii/qiniuClient',
  issue: 'https://github.com/willnewii/qiniuClient/issues',
  releases: 'https://api.github.com/repos/willnewii/qiniuClient/releases/latest',
}

export const Event = {
  dropView: 'dropView',
  loading: 'loading',
  syncing: 'syncing', //indexedDB 数据同步中
  updateFiles: 'updateFiles', //Filter&Search组件更新文件列表,不修改源数据
  refreshFiles: 'refreshFiles', //更新文件列表
  resourceAction: 'resourceAction', //下载/上传事件
  changeTheme: 'changeTheme',
  changePrivate: 'changePrivate',
}

export const CopyType = {
  URL: 'url',
  MARKDOWN: 'markdown',
}

export const UploadType = {
  UPLOAD: 'upload',
  FETCH: 'fetch',
}

export const FileType = {
  folder: 'F',
}

export const ActionType = {
  download: 'download',
  upload: 'upload',
  rename: 'rename',
  remove: 'remove',
  refreshUrls: 'refreshUrls',
}

export const DBAction = {
  create: 'C',
  retrieve: 'R',
  update: 'U',
  delete: 'D',
  rename: 'rename',
}

/**
 * 以本地为基准,云对应不上的文件会被删除
 * 以云为基准,本地对应不上的文件会被删除
 * @type {{normal: number, baseCloud: number, baseLocal: number}}
 */
export const mergeType = {
  normal: 0,
  coverCloud: 1,
  coverLocal: 2,
}

export const Listener = {
  trayUploadFile: 'trayUploadFile',
  trayUpdateTitle: 'update-TrayTitle',
  downloadFile: 'downloadFile',
  choiceDownloadFolder: 'choiceDownloadFolder',
  updateDownloadProgress: 'updateDownloadProgress',
  openFileDialog: 'open-file-dialog',
  readDirectory: 'read-directory',
  preview: 'preview',
  syncDirectory: 'syncDirectory',
  darkMode: 'darkMode',
  exportUrl: 'exportUrl',
  showNotifier: 'show-Notifier',
  showMenuBar: 'showMenuBar',
}
