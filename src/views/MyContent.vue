<template>
    <div class="box">
        <!-- 左半边编辑组件 -->
        <div class="left-editor" :class="{ disNone: isPresent }">
            <MyEditor @newMarkdown="getMarkDown" :md="startText" @getLineNumber="getLineNumbers" ref="editor" />
        </div>
        <!-- 右半边渲染组件 -->
        <div class="right-preview" :class="{ present: isPresent }">
            <MyPreview v-if="whichPreview" :md="markdown" ref="mdPreview"/>
            <MyLatexPreview v-else :latex="markdown" ref="LaTexPreview"/>
        </div>

        <!-- 弹窗显示 -->
        <div class="dialog-editor" :class="{ disNone: !isDialog }">
            <div class="dialog-title"> {{dialogTitle}}</div>
            <div class="dailog-close" @click="closeDialog">
                <MyIcons icon="close" Style="font-size:1.5rem"> </MyIcons>
            </div>
            <div class="dialog">
                <NewFileDialog :show="show" @showChange="getShowChange" @newFileName="getNewFileName" />
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

import SocketService from '../untils/myWebsock'

import {openDocument} from '../request/document'

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
watch(fileFormat,()=>{
    if(fileFormat.value === 'tex'){
        whichPreview.value = false
        editor.value.switchMode("LaTex")
    }else{
        whichPreview.value = true
        editor.value.switchMode("markdown")
    }
})

//预览
const preview = () => {
    isPresent.value = !isPresent.value
}

//弹窗控制
const closeDialog = ()=>{
    isDialog.value = false
}

//协同编辑部分，这个哪怕本地编辑也会触发，有点问题

//建立websocket链接
connect.value = SocketService.Instance
const websocketConnect = ()=>{
  SocketService.Instance.connect()
  connect.value = SocketService.Instance
}
//断开链接，更换文章需要重新建立连接
const websocketDisConnect = ()=>{
  connect.value.close()
}
//发送消息
const sendData = (value)=>{
  connect.value.send(value)
  console.log("send this data")
}

watch(isCooperation,()=>{
    emitter.emit('sendCooperatrionMSGToHeader', isCooperation.value)
})

// 打开文档
const getOpenDoc = (docUID)=>{
    openDocument(docUID).then((res)=>{
        let curr = res.object
        // 去掉描述先
        curr.shift()
        startText.value = curr.join("\n")
        localStorage.setItem('currDocUID',docUID)
        console.log("CurrDocUID是：" + localStorage.getItem('currDocUID'))
        identity.docUID = docUID
    })
}

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
                if(whichPreview.value) mdPreview.value.exportPDF()
                else LaTexPreview.value.exportPDF()
                break
            case "saveToSQL":
                console.log("待后续完善")
                break
            case "startConnect":
                websocketConnect()
                break
            case "closeConnect":
                websocketDisConnect()
                break
            case "upload":
                console.log("待后续完善")
                break
            case "getFlieList":
                getOpenDoc(10000008)
                break
            case "newComment":
                console.log("待后续完善")
                break
            case "newPermission":
                console.log("待后续完善")
                break
            case "historyBack":
                console.log("待后续完善")
                break
            case "addScreen":
                editor.value.testSetValue(20,["aad"],1)
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

    emitter.on('updateMsgNeedSendToServer', (value)=>{
        if(isCooperation.value){
            sendData(Object.assign(identity,value));
        }
        // console.log(identity,value)
    })

    // 接收websocket连接信息
    emitter.on('sendConnectionMSG', (value)=>{
        isCooperation.value = value
    })

    // 接收改变
    emitter.on('sendWebSocketReceiveData', (value)=>{
        if(value.substr(0,5) === "Error"){
            promptingMsg.value = value
        }else {
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
    background-image: url('../images/backgroundImg/3.jpg');
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

.dailog-close{
    position: absolute;
    top: 0.2rem;
    right: 0.5rem;
    width: 1.5rem;
    height: 1.5rem;
}

.dailog-close:hover{
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