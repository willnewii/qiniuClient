/**
 * Created by yee.wang on 2019-03-04
 **/

import electron from "electron";
import fs from "fs";
import path from "path";
import { creatId, readBlob } from "./util";
import * as Constants from "./constants";

const savePath = electron.remote.app.getPath("userData");

const WRITE_PATH = path.resolve(savePath, "pasteFiles");

export default class PasteImageService {
  constructor() {
    this.init();
  }

  init() {
    document.addEventListener("paste", this.handlerParse.bind(this));
  }

  async handlerParse(event) {
    const fileList = Array.from(event.clipboardData.items)
      .map(o => {
        if (!/image\/.*/.test(o.type)) {
          return;
        }
        return o.getAsFile();
      })
      .filter(file => !!file);

    const filePaths = [];
    for (const file of fileList) {
      filePaths.push(await this.writeFile(file));
    }

    electron.ipcRenderer.send(Constants.Listener.readDirectory, {
      files: filePaths
    });
  }

  async writeFile(file) {
    if (!fs.existsSync(WRITE_PATH)) {
      fs.mkdirSync(WRITE_PATH);
    }

    const filePath = path.resolve(WRITE_PATH, creatId() + ".png");

    const { base64 } = await readBlob(file);

    fs.writeFileSync(filePath, base64.split(";base64,").pop(), {
      encoding: "base64"
    });

    return filePath;
  }
}
