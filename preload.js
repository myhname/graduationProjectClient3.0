const { contextBridge, ipcRenderer} = require('electron')

//操作窗口
contextBridge.exposeInMainWorld('$app', {
    min() {
        ipcRenderer.send('window-min')
        // console.log(1)
    },
    max() {
        ipcRenderer.send('window-max')
    },
    close() {
        ipcRenderer.send('window-close')
    }
})

console.log(0)