'use strict'

import {app, BrowserWindow, Menu, ipcMain, dialog} from 'electron'
import * as util from './util'
import * as trayUtil from './trayUtil';

let mainWindow;

app.on('ready', initApp);

function initApp() {
    //注册菜单
    const menu = Menu.buildFromTemplate(getMenuData());
    Menu.setApplicationMenu(menu);

    //创建主窗口
    createMainWindow();
    //托盘处理
    util.isMac() && trayUtil.createTray();

    registerIPC();
}

function createMainWindow() {
    mainWindow = new BrowserWindow({
        height: 750,
        width: 1000,
        // frame: false,
        titleBarStyle: 'hidden',
        webPreferences: {
            webSecurity: false
        }
    });

    mainWindow.loadURL(util.winURL);

    mainWindow.on('closed', () => {
        //mainWindow = null
    });
}

app.on('window-all-closed', () => {
    if (!util.isMac()) {
        app.quit()
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createMainWindow()
    }
});

/**
 * 注册IPC事件
 */
const registerIPC = function () {
    ipcMain.on('open-file-dialog', function (event) {
        dialog.showOpenDialog({
            properties: ['openFile', 'multiSelections']
        }, function (files) {
            if (files) event.sender.send('selected-directory', files)
        })
    });

    ipcMain.on('previewFile', function (event, filePath) {
        if (mainWindow) {
            mainWindow.previewFile(filePath);
        }
    });
};

/**
 * 注册菜单
 * @returns {[*,*,*,*]}
 */
const getMenuData = function () {
    const template = [
        /*        {
                    label: 'Edit',
                    submenu: [
                        {role: 'undo'},
                        {role: 'redo'},
                        {type: 'separator'},
                        {role: 'cut'},
                        {role: 'copy'},
                        {role: 'paste'},
                        {role: 'pasteandmatchstyle'},
                        {role: 'delete'},
                        {role: 'selectall'}
                    ]
                },*/
        {
            label: '视图',
            submenu: [
                {
                    label: '重新加载',
                    click() {
                        if (mainWindow) {
                            mainWindow.loadURL(util.winURL);
                        }
                    }
                },
                {role: 'forcereload'},
                {role: 'toggledevtools'},
                {type: 'separator'},
                {role: 'resetzoom'},
                {role: 'zoomin'},
                {role: 'zoomout'},
                {type: 'separator'},
                {role: 'togglefullscreen'}
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
                    label: '关于项目',
                    click() {
                        require('electron').shell.openExternal('https://github.com/willnewii/qiniuClient')
                    }
                },
                {
                    label: '提交异常或需求',
                    click() {
                        require('electron').shell.openExternal('https://github.com/willnewii/qiniuClient/issues')
                    }
                }
            ]
        }
    ];

    if (process.platform === 'darwin') {
        template.unshift({
            label: app.getName(),
            submenu: [
                {role: 'about'},
                {type: 'separator'},
                {role: 'services', submenu: []},
                {type: 'separator'},
                {role: 'hide'},
                {role: 'hideothers'},
                {role: 'unhide'},
                {type: 'separator'},
                {role: 'quit'}
            ]
        })

        /*        // Edit menu
                template[1].submenu.push(
                    {type: 'separator'},
                    {
                        label: 'Speech',
                        submenu: [
                            {role: 'startspeaking'},
                            {role: 'stopspeaking'}
                        ]
                    }
                )*/

        // Window menu
        template[2].submenu = [
            {role: 'close'},
            {role: 'minimize'},
            {role: 'zoom'},
            {type: 'separator'},
            {role: 'front'}
        ]
    }
    return template;
};

