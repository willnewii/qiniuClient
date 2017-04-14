'use strict'

const path = require('path')
import {app, BrowserWindow, Menu, ipcMain, dialog, Tray} from 'electron'

const winURL = process.env.NODE_ENV === 'development'
    ? `http://localhost:${require('../../../config').port}`
    : `file://${__dirname}/index.html`

const iconPath = path.join(__dirname, 'assets/');

let mainWindow, trayWindow, mTray;

function initApp() {
    //注册菜单
    const menu = Menu.buildFromTemplate(getMenuData())
    Menu.setApplicationMenu(menu)

    //创建主窗口
    createMainWindow();

    //托盘处理
    initTray();
    createTrayWindow();

    registerIPC();
}

function createMainWindow() {
    /**
     * Initial window options
     */
    mainWindow = new BrowserWindow({
        height: 600,
        width: 800,
        webPreferences: {
            webSecurity: false
        }
    })

    console.log(winURL);
    mainWindow.loadURL(winURL)

    mainWindow.on('closed', () => {
        mainWindow = null
    })

    // eslint-disable-next-line no-console
    console.log('mainWindow opened')
}
app.on('ready', initApp)

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    if (mainWindow === null) {
        createMainWindow()
    }
})



//托盘部分处理
const initTray = function () {
    mTray = new Tray(path.join(iconPath, (process.platform === 'win32' ? 'tray.png' : 'tray.png')));

    mTray.on('click', () => {
        toggleTrayWindow()
    })
}

const toggleTrayWindow = () => {
    if (trayWindow.isVisible()) {
        trayWindow.hide()
    } else {
        showTrayWindow()
    }
}

const showTrayWindow = () => {
    const position = getTrayWindowPosition()
    trayWindow.setPosition(position.x, position.y, false)
    trayWindow.show()
    trayWindow.focus()
}

const getTrayWindowPosition = () => {
    const windowBounds = trayWindow.getBounds()
    const trayBounds = mTray.getBounds()

    // Center window horizontally below the tray icon
    const x = Math.round(trayBounds.x + (trayBounds.width / 2) - (windowBounds.width / 2))

    // Position window 4 pixels vertically below the tray icon
    const y = Math.round(trayBounds.y + trayBounds.height + 4)

    return {x: x, y: y}
}

const createTrayWindow = () => {
    trayWindow = new BrowserWindow({
        width: 300,
        height: 450,
        show: false,
        frame: false,
        fullscreenable: false,
        resizable: false,
        transparent: true,
        webPreferences: {
            // Prevents renderer process code from not running when window is
            // hidden
            webSecurity: false,
            backgroundThrottling: false
        }
    })

    trayWindow.loadURL(winURL + '/#/tray')

    // Hide the window when it loses focus
    trayWindow.on('blur', () => {
        if (!trayWindow.webContents.isDevToolsOpened()) {
            trayWindow.hide()
        }
    })
}

/**
 * 注册IPC事件
 */
const registerIPC = function () {
    ipcMain.on('open-file-dialog', function (event) {
        dialog.showOpenDialog({
            properties: ['openFile', 'openDirectory']
        }, function (files) {
            if (files) event.sender.send('selected-directory', files)
        })
    })

    ipcMain.on('put-in-tray', function (event) {
        const contextMenu = Menu.buildFromTemplate([{
            label: 'Remove',
            click: function () {
                event.sender.send('tray-removed')
            }
        }])
        mTray.setToolTip('Electron Demo in the tray.')
        mTray.setContextMenu(contextMenu)
    })

    ipcMain.on('remove-tray', function () {
        mTray.destroy()
    })
}



//注册菜单

function getMenuData() {
    const template = [
        {
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
        },
        {
            label: 'View',
            submenu: [
                {role: 'reload'},
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
            role: 'window',
            submenu: [
                {role: 'minimize'},
                {role: 'close'}
            ]
        },
        {
            role: 'help',
            submenu: [
                {
                    label: 'Learn More',
                    click () {
                        require('electron').shell.openExternal('https://electron.atom.io')
                    }
                }
            ]
        }
    ]

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

        // Edit menu
        template[1].submenu.push(
            {type: 'separator'},
            {
                label: 'Speech',
                submenu: [
                    {role: 'startspeaking'},
                    {role: 'stopspeaking'}
                ]
            }
        )

        // Window menu
        template[3].submenu = [
            {role: 'close'},
            {role: 'minimize'},
            {role: 'zoom'},
            {type: 'separator'},
            {role: 'front'}
        ]
    }
    return template;
}

