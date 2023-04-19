<template>
    <div class="box">
        <!-- 左半边编辑组件 -->
        <div class="left-editor" :class="{ disNone: isPresent }">
            <MyEditor @newMarkdown="getMarkDown" :md="startText" @getLineNumber="getLineNumbers"
                @updateData="receiveUpdateData" ref="editor" />
        </div>
        <!-- 右半边渲染组件 -->
        <div class="right-preview" :class="{ present: isPresent }">
            <MyPreview :md="markdown" />
        </div>
    </div>
</template>

<script setup>

import { ref, reactive, onMounted, watch, onBeforeUnmount, onUnmounted } from 'vue'

import emitter from '../untils/eventBus';

//编辑渲染组件
import MyEditor from '@/components/MyEditor.vue';
import MyPreview from '../components/MyPreview.vue'

//显示控制（预览功能）
const isPresent = ref(false)
//弹窗显示
const showDialog = ref(false)

//获取组件
const editor = ref()

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

//按钮触发值
const whichBtnClicked = ref()
//新建文件 需要命名和提交结果
const newFile = ref()
//自动保存，这里所有新建的文件只有一份暂存副本，多个的话涉及到了删除缓存，之后再改进，未保存的提示应该在页面关闭时触发提示
const tempFile = reactive({
    path: "",
    result: ""
})
const autoSaveTimer = ref()

//编辑器初始化
//文件格式和语言类型同步
watch(fileFormat, () => {
    switch (fileFormat.value) {
        case 'md': mode.value = "markdwon"; break;
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

//协同编辑部分，这个哪怕本地编辑也会触发，有点问题
const receiveUpdateData = (value) => {
    console.log("后续完善")
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
            }
        } else {
            promptingMsg.value = "当前语言格式暂不支持快捷操作"
        }
    })
})

//发送提示信息
watch(promptingMsg, (value) => {
    emitter.emit('contentSendMsgToBottom', promptingMsg.value)
})

//这里要再调用一次保存
onBeforeUnmount(() => {
    emitter.off('editorUtilsMsgToContent')
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
</style>