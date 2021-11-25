/**
 * Created by zhangweiwei on 2017/4/14.
 */
 import { BrowserWindow, Tray, ipcMain } from 'electron'
 import * as util from './util/util'
 import * as Constants from '../renderer/service/constants'
 
 const icon_tray = 'tray.png'
 const icon_upload = util.isWin() ? 'win_upload.png' : 'tray_upload.png'
 
 let mTray, mTrayWindow, mainWindown
 
 //托盘部分处理
 export const createTray = function (mainWindowId) {
   mainWindown = BrowserWindow.fromId(mainWindowId)
   mTray = new Tray(util.getIconPath(`../${icon_tray}`))
 
   mTray.setToolTip('试试把文件拖到这里？')
 
   mTray.on('click', () => {
     toggleTrayWindow()
   })
 
   mTray.on('drop-files', async (event, files) => {
     setTrayIcon(icon_upload)
     mainWindown && mainWindown.webContents.send(Constants.Listener.trayUploadFile, await util.wrapperFiles(files))
   })
 
   ipcMain.on(Constants.Listener.trayUpdateTitle, function (event, title) {
     if (title.length === 0) {
       setTrayIcon(icon_tray)
     }
     setTrayTitle(title)
   })
 
   /*
     mTrayWindow = createTrayWindow()
 
     ipcMain.on(Constants.Listener.showNotifier, function (event, option) {
         // option.icon = util.getIconPath(option.icon || 'icon.png');
         option.icon = option.image
         option.title = option.title || pkg.cnname
         option.body = option.message
 
         option.silent = true
         // option.subtitle = 'subtitle';
         // option.body = 'body';
         new Notification(option).show()
     })*/
 
   return mTray
 }
 
 const toggleTrayWindow = () => {
   if (mainWindown) {
     if (mainWindown.isVisible()) {
       mainWindown.minimize()
     } else {
       mainWindown.show()
     }
   }
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
       backgroundThrottling: false,
       devTools: true,
       nodeIntegration: true,
       contextIsolation: false,
       enableRemoteModule: true,
     },
   })
   require('@electron/remote/main').enable(trayWindow.webContents)
 
   trayWindow.loadURL(util.mainURL + '#/tray')
 
   // Hide the window when it loses focus
   trayWindow.on('blur', () => {
     if (!trayWindow.webContents.isDevToolsOpened()) {
       trayWindow.hide()
     }
   })
 
   return trayWindow
 }
 
 const showTrayWindow = () => {
   const position = getTrayWindowPosition()
   mTrayWindow.setPosition(position.x, position.y, false)
   mTrayWindow.show()
   mTrayWindow.focus()
 }
 
 const getTrayWindowPosition = () => {
   const trayBounds = mTray.getBounds()
   const windowBounds = mTrayWindow.getBounds()
 
   let x, y
   if (util.isMac()) {
     x = Math.round(trayBounds.x + trayBounds.width / 2 - windowBounds.width / 2)
     y = Math.round(trayBounds.y + trayBounds.height + 4)
   } else {
     x = Math.round(trayBounds.x + trayBounds.width / 2 - windowBounds.width / 2)
     y = Math.round(trayBounds.y - windowBounds.height)
   }
 
   return { x: x, y: y }
 }
 
 export const setTrayTitle = function (title) {
   if (util.isMac()) {
     mTray.setTitle(title)
   }
 }
 
 export const setTrayIcon = function (image) {
   mTray.setImage(util.getIconPath(`../${image}`))
 }
 