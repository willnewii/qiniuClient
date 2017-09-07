const electronInstaller = require('electron-winstaller');
const path = require('path');
const pkg = require('../package.json');

console.log(pkg.cnname + pkg.version + '.exe 构建中...');

let resultPromise = electronInstaller.createWindowsInstaller({
    appDirectory: path.join(__dirname, '../builds/' + pkg.cnname + '-win32-x64'),
    outputDirectory: path.join(__dirname, '../builds/qiniuClient-win32-exe'),
    authors: 'willnewii@163.com',
    exe: '七牛云管理客户端.exe',
    version: pkg.version
});

resultPromise.then(() => console.log(pkg.cnname + pkg.version + '.exe 构建成功'), (e) => console.log(`No dice: ${e.message}`));