'use strict';

import {app, BrowserWindow, Menu, ipcMain, dialog, shell} from 'electron';
import EAU from 'electron-asar-hot-updater';

const path = require('path');
const {download} = require('electron-dl');

import pkg from '../../package';
import * as util from './util';
import * as trayUtil from './trayUtil';
import * as Constants from '../renderer/service/constants';

let mainWindow, aboutWindow;

app.on('ready', initApp);

app.on('window-all-closed', () => {
    if (!util.isMac()) {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createMainWindow();
    }
});

function initApp() {
    //注册菜单
    const menu = Menu.buildFromTemplate(getMenuData());
    Menu.setApplicationMenu(menu);

    //创建主窗口
    createMainWindow();
    //托盘处理
    util.isMac() && trayUtil.createTray(mainWindow.id);

    registerIPC();

    //updateAsar();
}

function createMainWindow() {
    mainWindow = new BrowserWindow({
        height: 750,
        width: 1000,
        title: pkg.cnname,
        titleBarStyle: 'hidden',
        webPreferences: {
            webSecurity: false
        }
    });

    mainWindow.loadURL(util.mainURL);

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

/**
 * 注册IPC事件
 */
const registerIPC = function () {

    ipcMain.on('miniWindow', function (event, option) {
        mainWindow.setContentSize(option.width, option.height, true);
    });

    //选择下载目录
    ipcMain.on(Constants.Listener.choiceDownloadFolder, function (event, option) {
        dialog.showOpenDialog(option, function (files) {
            if (files) event.sender.send(Constants.Listener.choiceDownloadFolder, files);
        });
    });

    //下载文件
    ipcMain.on(Constants.Listener.downloadFile, function (event, file, option) {
        option.onProgress = function (num) {
            if (num !== 1) {
                event.sender.send(Constants.Listener.updateDownloadProgress, num);
            }
        };
        if (!option.directory) {
            option.directory = path.join(app.getPath('downloads'), pkg.name);
        }
        if (option.folder) {
            option.directory = path.join(option.directory, option.folder);
        }

        download(BrowserWindow.getFocusedWindow(), file, option).then(dl => {
            if (option.count === 1) {
                shell.showItemInFolder(dl.getSavePath());
            }
            event.sender.send(Constants.Listener.updateDownloadProgress, 1);
        }).catch(error => {
            console.error(error);
            event.sender.send(Constants.Listener.updateDownloadProgress, 1);
        });
    });

    //选择文件
    ipcMain.on(Constants.Listener.openFileDialog, function (event, option) {
        dialog.showOpenDialog({
            properties: option.properties
        }, async function (_files) {
            if (_files) {
                event.sender.send(Constants.Listener.readDirectory, await wrapperFiles(_files));
            }
        });
    });

    ipcMain.on(Constants.Listener.readDirectory, async function (event, arg) {
        event.sender.send(Constants.Listener.readDirectory, await wrapperFiles(arg.files));
    });

    ipcMain.on(Constants.Listener.setBrand, function (event, arg) {
        console.log(arg);
        // trayUtil.setTrayIcon();
    });

    /*    ipcMain.on('previewFile', function (event, filePath) {
            if (mainWindow) {
                mainWindow.previewFile(filePath);
            }
        });*/
};

async function wrapperFiles(_files) {
    let files = [];
    for (const item of _files) {
        if (util.isDirectory(item)) {
            let temp = await util.readDir(item);
            temp.forEach((path) => {
                //path.sep 将window 的路径分割符 \  转换成 /
                files.push({path: path.replace(/\\/g, '/'), dir: item.replace(/\\/g, '/')});
            });
        } else {
            files.push({path: item.replace(/\\/g, '/')});
        }
    }

    return files;
}

/**
 * 检测更新asar
 */
function updateAsar() {

    if (!app.getAppPath().toLowerCase().endsWith('asar')) {
        console.log('未使用asar,跳过更新');
        return;
    }

    EAU.init({
        'api': 'http://ou62js7ck.bkt.clouddn.com/test/last-version.json?t=' + new Date().getTime(), // The API EAU will talk to
        'server': false // Where to check. true: server side, false: client side, default: true.
    });

    EAU.check(function (error, last, body) {
        console.log(error, last, body);
        if (error) {
            if (error === 'no_update_available') {
                return false;
            }
            dialog.showErrorBox('info', error);
            return false;
        }

        /*EAU.progress(function (state) {
            console.log(state);
        });

        EAU.download(function (error) {
            if (error) {
                dialog.showErrorBox('info', error);
                return false;
            }
            dialog.showErrorBox('info', 'App updated successfully! Restart it please.');
        });*/
    });
}

/**
 * 注册菜单
 * @returns {[*,*,*,*]}
 */
const getMenuData = function () {
    const template = [
        {
            label: '修改',
            submenu: [
                {role: 'undo', label: '撤销'},
                {role: 'redo', label: '重做'},
                {type: 'separator'},
                {role: 'cut', label: '剪切'},
                {role: 'copy', label: '复制'},
                {role: 'paste', label: '粘贴'},
                {role: 'pasteandmatchstyle', label: '粘贴并匹配样式'},
                {role: 'delete', label: '删除'},
                {role: 'selectall', label: '全选'}
            ]
        },
        {
            label: '视图',
            submenu: [
                {
                    label: '重新加载',
                    click() {
                        if (mainWindow) {
                            mainWindow.loadURL(util.mainURL);
                        }
                    }
                },
                {role: 'forcereload'},
                {role: 'toggledevtools', label: '开发者工具'},
                /*{type: 'separator'},
                {role: 'resetzoom'},
                {role: 'zoomin'},
                {role: 'zoomout'},
                {type: 'separator'},
                {role: 'togglefullscreen'}*/
            ]
        },
        {
            label: '窗口',
            submenu: [
                {role: 'minimize'},
                {role: 'close'}
            ]
        },
        {
            label: '帮助',
            submenu: [
                {
                    label: '提交异常或需求',
                    click() {
                        shell.openExternal('mailto:support@paocdn.com');
                    }
                }
            ]
        }
    ];

    let aboutMenu = {
        label: '关于',
        click() {
            if (aboutWindow) {
                aboutWindow.show();
            } else {
                aboutWindow = new BrowserWindow({
                    width: 300,
                    height: 300,
                    resizable: false,
                    autoHideMenuBar: true,
                    title: '关于',
                    webPreferences: {
                        webSecurity: false,
                        backgroundThrottling: false
                    }
                });
                aboutWindow.loadURL(util.mainURL + '#/about');
                aboutWindow.on('closed', () => {
                    aboutWindow = null;
                });
            }
        }
    };

    if (process.platform === 'darwin') {
        template.unshift({
            label: app.getName(),
            submenu: [
                aboutMenu,
                {type: 'separator'},
                {role: 'services', submenu: []},
                {type: 'separator'},
                {role: 'hide', label: '隐藏'},
                {role: 'hideothers', label: '隐藏其他'},
                {role: 'unhide', label: '显示全部'},
                {type: 'separator'},
                {role: 'quit', label: '关闭'}
            ]
        });

        // Window menu
        template[3].submenu = [
            {role: 'close'},
            {role: 'minimize', label: '最小化'},
            {role: 'zoom', label: '缩放'},
            /*{type: 'separator'},
            {role: 'front'}*/
        ];
    } else {
        template[template.length - 1].submenu.unshift(aboutMenu);
    }
    return template;
};

