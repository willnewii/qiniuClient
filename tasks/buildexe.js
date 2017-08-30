const electronInstaller = require('electron-winstaller');
const path = require('path');
const pkg = require('../package.json');

console.log(pkg.cnname + pkg.version + '.exe 构建中...');

let resultPromise = electronInstaller.createWindowsInstaller({
    appDirectory: path.join(__dirname, '../builds/' + pkg.cnname + '-win32-x64'),
    outputDirectory: path.join(__dirname, '../builds/'),
    authors: pkg.author,
    exe: '七牛云管理客户端.exe',
    version: pkg.version
});

resultPromise.then(() => console.log("It worked!"), (e) => console.log(`No dice: ${e.message}`));
