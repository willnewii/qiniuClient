/**
 * Created by zhangweiwei on 2017/4/14.
 */
import {BrowserWindow, Tray, ipcMain, clipboard} from 'electron'
import notifier from 'node-notifier'
import * as util from './util'

let mTray, mTrayWindow;

//托盘部分处理
export const createTray = function () {
    mTray = new Tray(util.getIconPath('tray.png'));

    mTrayWindow = createTrayWindow();

    mTray.on('click', () => {
        toggleTrayWindow()
    })

    mTray.on('drop-files', (event, files) => {
        mTrayWindow.webContents.send('upload-Files', files);
    })

    ipcMain.on('upload-tray-title', function (event, title) {
        setTrayTitle(title)
    })

    ipcMain.on('show-Notifier', function (event, option) {
        if (option.icon) {
            option.icon = util.getIconPath(option.icon);
        }

        notifier.notify(option, (err, response) => {
            event.sender.send('log', err)
        });
    })

 /*   setInterval(() => {
        console.log("clipboard:", clipboard.readText());
        console.log("clipboard:", clipboard.readHtml());
        console.log("clipboard:", clipboard.readImage().toDataURL());
        console.log("clipboard:", clipboard.readRtf());
        console.log("clipboard:", clipboard.availableFormats());
    }, 10000);*/

    return mTray;
}

const createTrayWindow = () => {
    let trayWindow = new BrowserWindow({
        width: 300,
        height: 300,
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

    trayWindow.loadURL(util.winURL + '#/tray')

    // Hide the window when it loses focus
    trayWindow.on('blur', () => {
        if (!trayWindow.webContents.isDevToolsOpened()) {
            trayWindow.hide()
        }
    })

    return trayWindow;
}

const toggleTrayWindow = () => {
    if (mTrayWindow.isVisible()) {
        mTrayWindow.hide()
    } else {
        showTrayWindow()
    }
}

const showTrayWindow = () => {
    const position = getTrayWindowPosition()
    mTrayWindow.setPosition(position.x, position.y, false)
    mTrayWindow.show()
    mTrayWindow.focus()
}

const getTrayWindowPosition = () => {
    const windowBounds = mTrayWindow.getBounds()
    const trayBounds = mTray.getBounds()

    const x = Math.round(trayBounds.x + (trayBounds.width / 2) - (windowBounds.width / 2))
    const y = Math.round(trayBounds.y + trayBounds.height + 4)

    return {x: x, y: y}
}

export const setTrayTitle = function (title) {
    if (util.isMac()) {
        mTray.setTitle(title);
    }
}

