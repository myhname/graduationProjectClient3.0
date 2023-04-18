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


//读取一开始的展示效果文本
let defaultName = "未命名.txt"
const START_MD = path.join(__dirname, './src/data/startMD.md')
const TEMP_PATH = path.join(__dirname, './src/data/temp')
const getTempPath = () => TEMP_PATH
//读取文件内容
let opennedFilePath
const getStartMD = () => fs.readFileSync(START_MD,{encoding:'utf8', flag:'r'})
const getFileContext = (openFilePath) => fs.readFileSync(openFilePath,{encoding:'utf8', flag:'r'})

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

//文件读写

ipcMain.handle('get-start-md', () => getStartMD())
ipcMain.handle('get-temp-path', () => getTempPath())
//读取文件，无法传递对象无法直接解析路径，但是我既想得到文件内容，又想得到文件名，所以麻烦一点，发送文件路径对象，vue解析返回路径，通过路径在将内容发送过去
ipcMain.handle('get-open-file', ()=>{
    let filePath = dialog.showOpenDialog({
        title: '请选择要打开的文件',
        properties: ['openFile','multiSelections'],
    })
    return filePath
})
ipcMain.on('get-file-path', (event, filePath)=>{
    opennedFilePath = filePath
})
ipcMain.handle('open-file', ()=> getFileContext(opennedFilePath))
//保存文件
ipcMain.on('save-old-file', (event,filePath,context)=>{
    fs.writeFileSync(filePath, context, {encoding:'utf8',flag:'w'})
})
//另存为，首先获得默认名称
ipcMain.on('get-default-name', (event, fileName)=>{
    defaultName = fileName
})
ipcMain.handle('save-new-file', ()=>{
    let filePath = dialog.showSaveDialog({
        title: '另存为',
        filters: [{
            name: "new Markdown",
            extensions: ['md']
        },{
            name: "new LaTex",
            extensions: ['tex']
        },{
            name: "new File",
            extensions: ['txt']
        }],
        defaultPath: defaultName,
        nameFieldLabel: "this.md",
        properties: []
    })
    return filePath
})

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