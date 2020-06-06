/**
 * Created by yee.wang on 2019-03-04
 **/

import electron from "electron"
import fs from "fs"
import path from "path"
import { creatId, readBlob } from "./util"
import * as Constants from "./constants"
const plist = require("plist")

const savePath = electron.remote.app.getPath("userData")

const WRITE_PATH = path.resolve(savePath, "pasteFiles")

export default class PasteImageService {
  constructor() {
    this.init()
  }

  init() {
    document.addEventListener("paste", this.handlerParse.bind(this))
    this.enable = true
  }

  setEnable(enable = false) {
    this.enable = enable
  }

  /**
   * 粘贴板有两个情况，一种是文件还有一种是图片数据
   * mac 下可获得文件路径 先检测是不是文件,如果是直接获取路径
   * https://github.com/Molunerfinn/PicGo/issues/99#issuecomment-415513201
   */
  async handlerParse(event) {
    if (!this.enable) return
    let filePaths = []

    if (process.platform === "darwin") {
      let content = electron.clipboard.read("NSFilenamesPboardType")
      if (content) {
        try {
          filePaths = plist.parse(content)
        } catch (e) {
          console.error(e)
        }
      }
    } else if (process.platform === "win32") {
      let content = electron.clipboard.read("FileNameW")
      if (content)
        filePaths = [content.replace(new RegExp(String.fromCharCode(0), 'g'), '')]
    }

    if (filePaths.length === 0) {
      const fileList = Array.from(event.clipboardData.items)
        .map((o) => {
          if (!/image\/.*/.test(o.type)) {
            return
          }
          return o.getAsFile()
        })
        .filter((file) => !!file)

      for (const file of fileList) {
        filePaths.push(await this.writeFile(file))
      }
    }

    electron.ipcRenderer.send(Constants.Listener.readDirectory, {
      files: filePaths
    })
  }

  async writeFile(file) {
    if (!fs.existsSync(WRITE_PATH)) {
      fs.mkdirSync(WRITE_PATH)
    }

    const filePath = path.resolve(WRITE_PATH, creatId() + ".png")

    const { base64 } = await readBlob(file)

    fs.writeFileSync(filePath, base64.split(";base64,").pop(), {
      encoding: "base64"
    })

    return filePath
  }
}
