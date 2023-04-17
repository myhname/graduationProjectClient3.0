const {
    app,
    BrowserWindow,
    ipcMain,
    dialog,
    ipcRenderer
} = require('electron')
const path = require('path')
const fs = require('fs')
const {
    default: WinState
} = require('electron-win-state')

//不知道有用没用的安全策略
process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'

const createWindow = () => {

    const winState = new WinState({
        defaultWidth: 1000,
        defaultHeight: 800

    })

    //自定义窗口的状态
    const win = new BrowserWindow({
        ...winState.winOptions,
        useContentSize: true,
        frame: false, // 去除边框
        center: true,
        movable: true,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
        }
    })

    win.loadURL("http://localhost:8080/")
    //打包好之后要读取静态页面文件资源
    // win.loadFile("./dist/index.html")

//窗口整体状态
    //最小化
    ipcMain.on('window-min', () => {
        win.minimize();
    })
    //最大化
    ipcMain.on('window-max', () => {
        if (win.isMaximized()) {
            win.restore();
        } else {
            win.maximize();
        }
    })
    //关闭
    ipcMain.on('window-close', () => {
        win.close();
    })

    //命令提示台
    win.webContents.openDevTools()
    winState.manage(win)

}

// 回调函数，运行窗口
app.whenReady().then(() => {
    createWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});