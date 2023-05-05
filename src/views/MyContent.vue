<template>
    <div class="box">
        <!-- 左半边编辑组件 -->
        <div class="left-editor" :class="{ disNone: isPresent }">
            <MyEditor @newMarkdown="getMarkDown" :md="startText" @getLineNumber="getLineNumbers" ref="editor" />
        </div>
        <!-- 右半边渲染组件 -->
        <div class="right-preview" :class="{ present: isPresent }">
            <MyPreview v-if="whichPreview" :md="markdown" ref="mdPreview" />
            <MyLatexPreview v-else :latex="markdown" ref="LaTexPreview" />
        </div>

        <!-- 弹窗显示 -->
        <div class="dialog-editor" :class="{ disNone: !isDialog }">
            <div class="dialog-title"> {{ dialogTitle }}</div>
            <div class="dailog-close" @click="closeDialog">
                <MyIcons icon="close" Style="font-size:1.5rem"> </MyIcons>
            </div>
            <div class="dialog">
                <NewFileDialog :show="show" @showChange="getShowChange" @newFileName="getNewFileName" />
                <DocListDialog :docShow="docDiaShow" :contentList="contentList" @showChange="docShowChange"
                    @getWhich="getWhich" />
                <HistoryDialog :docShow="historyShow" :contentList="historyList" @showChange="historyShowChange"
                    @getWhich="getWhichHistory" />
                <PermissionTypeDialog :show="permissionShow" @showChange="permissionShowChange"
                    @newPermission="getNewPermission" />
                <CommendControl :show="commendShow" @showChange="commendShowChange" @newCommend="getNewCommend" />
                <CommendList :docShow="commendListShow" :contentList="commendList" @showChange="cLShowChange"
                    @getWhich="deleteWhich" />
            </div>
        </div>
    </div>
</template>

<script setup>

import { ref, reactive, onMounted, watch, onBeforeUnmount, onUnmounted } from 'vue'

import emitter from '../untils/eventBus';

//编辑渲染组件
import MyEditor from '../components/MyEditor.vue';
import MyPreview from '../components/MyPreview.vue'
import MyLatexPreview from '../components/MyLatexPreview.vue';
import MyIcons from '../components/MyIcons.vue';

//弹窗
import NewFileDialog from '../components/NewFileDialog.vue'
import DocListDialog from '../components/DocListDialog.vue'
import HistoryDialog from '../components/HistoryDialog.vue'
import PermissionTypeDialog from '../components/PermissionTypeDialog.vue'
import CommendControl from '../components/CommendControl.vue'
import CommendList from '../components/CommendList.vue'

import SocketService from '../untils/myWebsock'

import { openDocument, saveDocument, newDocument, newContent, closeDocument, getHistory, historyBack, getCommends } from '../request/document'
import { getDocList, addPermission, addCommend, deleteCommend } from '../request/user'

//显示控制（预览功能）
const isPresent = ref(false)

//获取组件
const editor = ref()
const mdPreview = ref()
const LaTexPreview = ref()

//文本信息, 初始值，避免初始化以及后续处理混乱
const startText = ref("# markdown-editor")
//文本值
const markdown = ref()
//语言类型
const mode = ref()
//获取文件名称
const titleName = ref()
//获取文件格式
const fileFormat = ref("")
//留存文件路径
const filePath = ref()
//接收行数
const lineNumbers = ref()

//提示信息
const promptingMsg = ref()

//新建文件 需要命名和提交结果
const newFile = ref()
//自动保存，这里所有新建的文件只有一份暂存副本，多个的话涉及到了删除缓存，之后再改进，未保存的提示应该在页面关闭时触发提示
const tempFile = reactive({
    path: "",
    result: ""
})
const autoSaveTimer = ref()

//弹窗控制
const isDialog = ref(false)
// 之后多了改用v-if或者其它方式进行选择
const show = ref()
const dialogTitle = ref()
const docDiaShow = ref()
const historyShow = ref()
const permissionShow = ref()
const commendShow = ref()
const commendListShow = ref()
// 文章信息
const contentList = ref()
const historyList = ref()
const commendList = ref()

//控制渲染组件选择
const whichPreview = ref(true)

//协同编辑, 建立websocket链接
const connect = ref()
// 当前是否处于协作状态
const isCooperation = ref(false)
//用户身份，当前文章
let identity = {
    userUID: localStorage.getItem('userUID') || 0,
    docUID: localStorage.getItem('currDocUID') || 0
}
// 在线状态新建标识，保证执行顺序
const isOnlineNew = ref(false)
const isUpload = ref(false)

//编辑器初始化
//文件格式和语言类型同步
watch(fileFormat, () => {
    switch (fileFormat.value) {
        case 'md': mode.value = "markdwon"; break;
        case 'tex': mode.value = "LaTex"; break;
        default: mode.value = "txt"
    }
    tempFile.result = tempFile.path + '.' + fileFormat.value
})

//接收修改后的文本内容
const getMarkDown = (value) => {
    markdown.value = value
}
//接收行数，顺便发送
const getLineNumbers = (value) => {
    lineNumbers.value = value
    emitter.emit('lineNumberChangeToBottom', lineNumbers.value)
}

//监听文件名的改变，传给MyHeader
watch(titleName, () => {
    emitter.emit('titleNameChangeToHeader', titleName.value)
})
//发送到底部显示信息，语言类型
watch(mode, () => {
    emitter.emit('modeChangeToBottom', mode.value)
})

//编辑器基础功能， 自动保存
const autoSave = () => {
    if (!filePath.value) {
        $data.backSaveFile(tempFile.result, markdown.value)
    } else {
        $data.backSaveFile(filePath.value, markdown.value)
    }
}
//新建文件
const getNewFile = () => {
    //实际上应该是打开到新的标签页不需要考虑上一份文件是否已经保存
    isDialog.value = true
    dialogTitle.value = "新建文件"
    show.value = false
    // 如果是协作状态
    if (isCooperation.value) {
        isCooperation.value = false
        websocketDisConnect()
    }
    if (localStorage.getItem('currDocUID')) localStorage.removeItem('currDocUID')
}
const getShowChange = (value) => {
    show.value = value
    closeDialog()
}
const getNewFileName = (value) => {
    newFile.value = value
}
watch(newFile, () => {
    titleName.value = newFile.value
    fileFormat.value = titleName.value.split('.').pop()
    startText.value = ""
    if (isOnlineNew.value) {
        getNewFileOnline()
    }
})

//打开本地文件
const openFile = async () => {
    //获得文件路径，解析获得文件名和后缀
    let tempFilePath = (await $data.getOpenFile()).filePaths[0]
    if (tempFilePath) {
        filePath.value = tempFilePath
        let fileName = filePath.value.split('\\').pop()
        titleName.value = fileName
        //获得文件后缀，未后续扩充更多解析渲染格式做准备
        fileFormat.value = fileName.split('.').pop()
        $data.backFilePath(filePath.value)
        startText.value = (await $data.getFileContext())
    } else {
        console.log("打开操作已取消")
    }
    // 打开新的本地文档，要断开协同编辑连接
    if (localStorage.getItem('currDocUID')) localStorage.removeItem('currDocUID')
    if (isCooperation.value) {
        isCooperation.value = false
        websocketDisConnect()
    }
}
//保存文件
const saveFile = () => {
    // 如果是新建或者初始文件
    if (!filePath.value) {
        saveNewFile()
    } else {
        $data.backSaveFile(filePath.value, markdown.value)
    }
}
//另存为
const saveNewFile = async () => {
    //还有一个问题，文件应该有一个默认的名字
    //取消之后返回的是空值，得先判断操作是否执行下去了
    $data.backFileName(titleName.value)
    let tempFilePath = (await $data.getSavePath()).filePath
    if (tempFilePath) {
        filePath.value = tempFilePath
        let fileName = filePath.value.split('\\').pop()
        titleName.value = fileName
        fileFormat.value = fileName.split('.').pop()
        switch (fileFormat.value) {
            case 'md': mode.value = "markdwon"; break;
            default: mode.value = "txt"
        }
        $data.backSaveFile(filePath.value, markdown.value)
    } else {
        console.log("保存操作已取消")
    }
}

//格式控制
watch(fileFormat, () => {
    if (fileFormat.value === 'tex') {
        whichPreview.value = false
        editor.value.switchMode("LaTex")
    } else {
        whichPreview.value = true
        editor.value.switchMode("markdown")
    }
})

//预览
const preview = () => {
    isPresent.value = !isPresent.value
}

//弹窗控制
const closeDialog = () => {
    isDialog.value = false
    show.value = true
    docDiaShow.value = true
    historyShow.value = true
    permissionShow.value = true
    commendShow.value = true
    commendListShow.value = true
}

//协同编辑部分，这个哪怕本地编辑也会触发，有点问题

//建立websocket链接
connect.value = SocketService.Instance
const websocketConnect = () => {
    SocketService.Instance.connect()
    connect.value = SocketService.Instance
}
//断开链接，更换文章需要重新建立连接
const websocketDisConnect = () => {
    if (localStorage.getItem('currDocUID')) {
        closeOnlineDoc(localStorage.getItem('currDocUID'))
        closeDocument(localStorage.getItem('currDocUID')).then(() => {
            localStorage.removeItem('currDocUID')
        })
    }
    connect.value.close()

}
//发送消息
const sendData = (value) => {
    connect.value.send(value)
    console.log("send this data")
}

watch(isCooperation, () => {
    emitter.emit('sendCooperatrionMSGToHeader', isCooperation.value)
})

// 打开文档
const getOpenDoc = (docUID) => {
    openDocument(docUID).then((res) => {
        console.log(res)
        let curr = res.object
        // 去掉描述先
        curr.shift()
        startText.value = curr.join("\n")
        localStorage.setItem('currDocUID', docUID)
        console.log("CurrDocUID是：" + localStorage.getItem('currDocUID'))
        identity.docUID = docUID
        if (!isCooperation.value) {
            // 打开完应该自动进入协同编辑
            websocketConnect()
            // 得到锁之前禁止编辑
            editor.value.getOnlyRead()
        }
    })

}

// 保存到数据库，需要打开协同编辑才行
const saveCurrDocToSQL = (docUID) => {
    saveDocument(docUID).then((res) => {
        console.log(res)
    })
}

//新建在线文档
const getNewFileOnline = () => {
    newDocument(localStorage.getItem('userUID'), {
        docUID: null,
        title: titleName.value.split('.')[0],
        format: fileFormat.value,
        authorUID: localStorage.getItem('userUID')
    }).then((res) => {
        console.log(res.object)
        localStorage.setItem('currDocUID', res.object)
        isOnlineNew.value = false
        if (isUpload.value) {
            uploadDocument()
        }
    })
}

// 上传 新文档or内容
const uploadDocument = () => {
    // 文档内容
    if (localStorage.getItem('currDocUID')) {
        newContent(localStorage.getItem('currDocUID'), { contentList: markdown.value.split('\n') }).then((res) => {
            console.log(res)
            isUpload.value = false
        })
    } else {
        isUpload.value = true
        getNewFileOnline()
    }
}

//打开列表
const openDocmentList = () => {

    getDocList(localStorage.getItem('userUID')).then((res) => {
        isDialog.value = true
        dialogTitle.value = "文件列表"
        docDiaShow.value = false
        contentList.value = res.object
    })
}
const getWhich = (value) => {
    getOpenDoc(value)
}
const docShowChange = (value) => {
    docDiaShow.value = value
    closeDialog()
}

// 关闭文章
const closeOnlineDoc = (docUID) => {
    sendData(Object.assign(identity, {
        changeType: "endEditor",
        startLine: 0,
        newContent: null,
        removedNumbers: 0
    }));
}

// 修改权限
const permissionDialog = () => {
    //实际上应该是打开到新的标签页不需要考虑上一份文件是否已经保存
    isDialog.value = true
    dialogTitle.value = "修改权限"
    permissionShow.value = false
}
const permissionShowChange = (value) => {
    permissionShow.value = value
    closeDialog()
}
const getNewPermission = (value) => {
    addPermission(localStorage.getItem('userUID'), {
        docUID: Number(value.docUID),
        userUID: Number(value.userUID),
        permissionType: value.permissionType
    }).then((res) => {
        console.log(res)
    })
}

// 恢复历史版本
const getHistoryDialog = () => {
    if (localStorage.getItem('currDocUID')) {
        getHistory(localStorage.getItem('currDocUID')).then((res) => {
            if (res.objectType === "String") {
                promptingMsg.value = res.object
            } else {
                isDialog.value = true
                dialogTitle.value = "历史版本"
                historyShow.value = false
                historyList.value = res.object
            }
        })
    }
}
const getHistoryBack = (uid) => {
    historyBack(localStorage.getItem('userUID'), uid).then((res) => {
        if (res.code === 400) {
            promptingMsg.value = res.object
        } else {
            promptingMsg.value = res.object
        }
    })
}
const getWhichHistory = (value) => {
    getHistoryBack(value)
}
const historyShowChange = (value) => {
    historyShow.value = value
    closeDialog()
}

// 获取评论列表
const getCommendList = () => {
    if (!localStorage.getItem('currDocUID')) {
        promptingMsg.value = "请先打开文章"
    } else {
        getCommends(localStorage.getItem('currDocUID')).then((res) => {
            if (res.objectType === "String") {
                promptingMsg.value = "暂无评论"
            } else {
                isDialog.value = true
                dialogTitle.value = "评论列表"
                commendListShow.value = false
                commendList.value = res.object
            }
        })
    }
}
const cLShowChange = (value) => {
    commendShow.value = value
    closeDialog()
}
const deleteWhich = (value) => {
    deleteSelectedCommend(value)
}

// 删除评论
const deleteSelectedCommend = (uid) => {
    deleteCommend(localStorage.getItem('userUID'),localStorage.getItem('currDocUID'),{commendUID:uid}).then((res)=>{
        promptingMsg.value = res.object
    })
}

// 评论
const NewCommend = () => {
    isDialog.value = true
    dialogTitle.value = "评论"
    commendShow.value = false
}
const commendShowChange = (value) => {
    commendShow.value = value
    closeDialog()
}
const getNewCommend = (value) => {
    addCommend(Object.assign({
        uid: null,
        docUID: localStorage.getItem('currDocUID') || 0,
        authorUID: localStorage.getItem('userUID') || 0
    }, value)).then((res) => {
        console.log(res)
    })
}

// 文档描述，重命名

onMounted(async () => {
    emitter.emit('leftToolsShow', true)
    //通过electron获取初始文本的内容
    startText.value = (await $data.getStartMD())
    tempFile.path = (await $data.getTempPath())
    //初始文本名称
    titleName.value = "StartMD.md"
    fileFormat.value = "md"

    autoSaveTimer.value = setInterval(() => {
        autoSave()
    }, 30000)

    //接收文件操作信息
    emitter.on('fileControlMsgToEditor', (value) => {
        switch (value) {
            case "newFile":
                getNewFile()
                break
            case "newFileOnline":
                isOnlineNew.value = true
                getNewFile()
                break
            case "openFile":
                openFile()
                break
            case "saveFile":
                saveFile()
                break
            case "saveNewFile":
                saveNewFile()
                break
            case "output":
                if (whichPreview.value) mdPreview.value.exportPDF()
                else LaTexPreview.value.exportPDF()
                break
            case "saveToSQL":
                if (!localStorage.getItem('currDocUID')) {
                    promptingMsg.value = "当前未打开文章"
                } else {
                    saveCurrDocToSQL(identity.docUID || localStorage.getItem('currDocUID'))
                }
                break
            case "startConnect":
                websocketConnect()
                break
            case "closeConnect":
                websocketDisConnect()
                break
            case "upload":
                uploadDocument()
                break
            case "getFlieList":
                openDocmentList()
                break
            case "getCommendList":
                getCommendList()
                break
            case "newComment":
                NewCommend()
                break
            case "newPermission":
                permissionDialog()
                break
            case "historyBack":
                getHistoryDialog()
                break
            case "addScreen":
                editor.value.getOnlyRead()
                console.log("待后续完善")
                break
            case "preview":
                preview()
                break
            default:
                promptingMsg.value = "未定义操作"
                break
        }
    })

    //接收左侧快捷编辑工具信息
    emitter.on('editorUtilsMsgToContent', (value) => {
        if (fileFormat.value === "" || fileFormat.value === "md") {
            switch (value) {
                case "blod":
                    editor.value.getBlod()
                    break
                case "incline":
                    editor.value.getIncline()
                    break
                case "undo":
                    editor.value.getUndo()
                    break
                case "search":
                    editor.value.getSearch()
                    break
                case "deleteLine":
                    editor.value.getDeleteLine()
                    break
                case "orderedList":
                    editor.value.addOrderedList()
                    break
                case "unorderedList":
                    editor.value.addUnorderedList()
                    break
                case "cite":
                    editor.value.addCite()
                    break
                case "IMG":
                    editor.value.addIMG()
                    break
                case "HTTP":
                    editor.value.addHTTP()
                    break
                default:
                    promptingMsg.value = "未定义操作"
                    break
            }
        } else {
            promptingMsg.value = "当前语言格式暂不支持快捷操作"
        }
    })

    emitter.on('updateMsgNeedSendToServer', (value) => {
        if (isCooperation.value && value.changeType != "undefined" && value.changeType != "donotmerge" && value.changeType != "undo") {
            sendData(Object.assign(identity, value));
        }
        // console.log(value)
    })

    // 接收websocket连接信息
    emitter.on('sendConnectionMSG', (value) => {
        isCooperation.value = value
    })

    // 接收改变
    emitter.on('sendWebSocketReceiveData', (value) => {
        if (value.substr(0, 5) === "Error") {
            promptingMsg.value = value
        } else if (value.substr(0, 8) === "blockMSG") {
            let currBlock = value.slice(10)
            if (currBlock === '}') {
                emitter.emit('sendBlovkMSGToEditor', "First")
            } else {
                currBlock = currBlock.slice(0, -1)
                let blockList = currBlock.split(",")
                emitter.emit('sendBlovkMSGToEditor', blockList)
            }
        } else {
            emitter.emit('sendUpdateMSGToEditor', JSON.parse(value))
        }
    })
})

//发送提示信息
watch(promptingMsg, () => {
    emitter.emit('contentSendMsgToBottom', promptingMsg.value)
})

//这里要再调用一次保存
onBeforeUnmount(() => {
    autoSave()
    emitter.off('editorUtilsMsgToContent')
    emitter.off('fileControlMsgToEditor')
    emitter.off('updateMsgNeedSendToServer')
    emitter.off('sendConnectionMSG')
    emitter.off('sendWebSocketReceiveData')
    localStorage.removeItem('currDocUID')
})

onUnmounted(() => {
    clearTimeout(autoSaveTimer.value)
})

</script>

<style scoped>
.box {
    box-sizing: border-box;
    position: relative;
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
    border-style: groove;
}

.left-editor {
    position: absolute;
    left: 0;
    top: 0;
    /*距离上有点怪怪的*/
    width: 50%;
    height: 100%;
    /*滚动条设置*/
    overflow: scroll;
    overflow-x: hidden;
    overflow-y: auto;
    text-align: left;
    /*边框*/
    border-style: groove;
    border-bottom: 0;
    border-left: 0;
    border-top: 0;
}

.disNone {
    display: none;
}

.right-preview {
    position: absolute;
    right: 0;
    top: 0;
    width: 47%;
    height: 100%;
    overflow: scroll;
    overflow-x: hidden;
    overflow-y: auto;
    text-align: left;
    /*左侧文字不至于紧贴边框*/
    padding: 0 1%;
}

.present {
    width: 98%;
}

.dialog-editor {
    position: absolute;
    left: 25%;
    top: 25%;
    width: 50%;
    height: 40%;
    z-index: 999;
    background-position: center top;
    background-repeat: no-repeat;
    background-size: cover;
    background-image: url('../images/backgroundImg/7.jpg');
    filter: opacity(0.9);
}

.dialog-title {
    position: absolute;
    left: 0.3rem;
    top: 0.2rem;
    font-size: larger;
    font-weight: bolder;
    color: black;
}

.dailog-close {
    position: absolute;
    top: 0.2rem;
    right: 0.5rem;
    width: 1.5rem;
    height: 1.5rem;
}

.dailog-close:hover {
    cursor: pointer;
    background-color: red;
}

.dialog {
    position: absolute;
    left: 0;
    top: 10%;
    width: 100%;
    height: 90%;
}
</style>