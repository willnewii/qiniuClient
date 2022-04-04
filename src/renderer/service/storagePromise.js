const { ipcRenderer } = require('electron')
const storage = require('electron-json-storage')
import path from 'path'

let get, set
if (typeof window !== 'undefined') {
  get = async function (key) {
    if (!storage.getDataPath()) {
      const _dataPath = await ipcRenderer.invoke('appPath', 'userData')
      const dataPath = path.join(_dataPath, 'storage')
      storage.setDataPath(dataPath)
    }
    return new Promise(function (resolve, reject) {
      storage.get(key, function (error, data) {
        if (error) return reject(error)
        resolve(data)
      })
    })
  }

  set = async function (key, params) {
    if (!storage.getDataPath()) {
      const _dataPath = await ipcRenderer.invoke('appPath', 'userData')
      const dataPath = path.join(_dataPath, 'storage')
      storage.setDataPath(dataPath)
    }
    return new Promise(function (resolve, reject) {
      storage.set(key, params, function (error) {
        if (error) return reject(error)
        resolve()
      })
    })
  }
} else {
  get = () => {}
  set = () => {}
}

export { get, set }
