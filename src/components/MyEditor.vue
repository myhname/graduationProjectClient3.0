<template>
    <textarea ref="mdText" v-model="markdown"></textarea>
</template>

<script setup>

import { ref, onMounted, defineProps, computed, watch, reactive, onBeforeUnmount } from 'vue';

import emitter from '../untils/eventBus'

//引入codemirror支持,js和css文件需要分别在script和style中引入
import _codemirror from 'codemirror';

//引入基础样式支持
import 'codemirror/lib/codemirror';//基础JS
//引入特定语法高亮支持
import 'codemirror/mode/markdown/markdown';
import 'codemirror/mode/htmlmixed/htmlmixed';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/css/css';
import 'codemirror/mode/vue/vue';
import 'codemirror/mode/stex/stex'
//扩展功能
import 'codemirror/addon/selection/active-line.js';//光标行背景高亮
import 'codemirror/addon/display/fullscreen';//全屏显示
import 'codemirror/addon/edit/matchbrackets';//括号匹配
import 'codemirror/addon/hint/show-hint';//自动补全
import 'codemirror/addon/hint/html-hint';
import 'codemirror/addon/lint/lint';
import 'codemirror/addon/scroll/simplescrollbars';//滚动条样式
//代码折叠功能
import 'codemirror/addon/fold/foldcode';
import 'codemirror/addon/fold/comment-fold';
import 'codemirror/addon/fold/brace-fold';
import 'codemirror/addon/fold/markdown-fold';
import 'codemirror/addon/fold/indent-fold';
import 'codemirror/addon/fold/foldgutter';
//搜索功能——ctrl+F,顶部出现滚动条,绑定方法：codemirror.execCommand('find')
import 'codemirror/addon/scroll/annotatescrollbar';//提供在滚动条上显示标记的功能，以标注文档的某些内容
import 'codemirror/addon/search/matchesonscrollbar';
import 'codemirror/addon/search/match-highlighter';
import 'codemirror/addon/search/jump-to-line';
import 'codemirror/addon/dialog/dialog';//提供一种查询用户文本输入的方法
import 'codemirror/addon/search/searchcursor'
import 'codemirror/addon/search/search'

//获取编辑器
let editor;
//关联文本框DOM
const mdText = ref()
//初始化codemirror
const codemirror = window.Codemirror || _codemirror
//文本值
let markdown = ref()
//获取总行数
const lineNumbers = ref()
const thisLine = ref()

//赋值载体, 这里要用多一个载体去获值,不然会重复赋值卡顿
let code = ref();

//主动更新
let theChangingContent = {
    changeType: null,
    startLine: 0,
    newContent: null,
    removedNumbers: 0
}

//接收一个初始值
const props = defineProps({
    md: {
        type: String
    }
})

//计算属性会动态改变
const start = computed(() => {
    return props.md
})
//返回变更后的值
const emit = defineEmits(["newMarkdown", "getLineNumber"])

//获取初始内容
watch(start, () => {
    markdown.value = start.value
    ////codemirror发生在挂载上，顺序问题
    editor.setValue(markdown.value)
})
//改变之后才触发，所以得先来一次，当一开始的文本值就是动态读入的时候就不需要先触发一次了
watch(markdown, () => {
    emit("newMarkdown", markdown.value)
})
//返回行数
watch(lineNumbers, () => {
    emit("getLineNumber", lineNumbers.value)
})

onMounted(() => {
    //向底部状态栏发送信息, 控制显示
    emitter.emit('editorSendMsgToBottom', true)

    //初始化编辑器
    editor = codemirror.fromTextArea(mdText.value, {
        value: markdown.value,//初始值
        //切换主题还是切换切换编辑器后续定
        mode: {
            name: "stex", // 使用LaTex语法高亮插件
            inlineMath: [["$", "$"], ["\\(", "\\)"]], // 定义LaTex内联公式
            blockMath: [["$$", "$$"], ["\\[", "\\]"]], // 定义LaTex块级公式
            fold: "brace" // 支持代码折叠
        },
        mode: "markdown",//markdown语法高亮
        //主题样式，具体预览效果参考：https://codemirror.net/5/demo/theme.html
        theme: "paraiso-light 3024-day",
        lineNumbers: true, // 显示行号
        matchBrackets: true, //括号自动匹配
        indentUnit: 4, //缩进单位
        indentWithTabs: true, //缩进的时候，把前面的N*tab大小的空间转化为N个tab字符
        styleActiveLine: true, //当前行背景高亮
        lineWrapping: true, //自动换行
        scrollbarStyle: "simple", //滚动条样式
        foldGutter: true,//代码折叠
        gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter", "CodeMirror-lint-markers"],
        extraKeys: {
            //触发自动提示按键
            Ctrl: 'autocomplete',
        },
        hintOptions: {
            //自定义提示选项
            completeSingle: false,//当匹配只有一项的时候是否自动补全
            tables: {}, //代码提示
        },
    }),
        editor.on('change', (cm) => {
            code = cm.getValue(); // 这里要用多一个载体去获值,不然会重复赋值卡顿
            markdown.value = code
            lineNumbers.value = editor.lineCount()
            //获得鼠标位置，这个需要动态获得，放在这里只能在位置改变时候获得，但实际上我们需要在点来点去得时候也边，所以在用得时候点击触发一次就好
            thisLine.value = editor.getCursor()
        }),
        //代码提示这个不知道是不支持markdown还是我现在配置不够，反正不能用
        editor.on('inputRead', () => {
            editor.showHint()
        })

    editor.on('changes', (instance, changes) => {
        for (let i = 0; i < changes.length; i++) {
            let change = changes[i]
            console.log("----------------")
            theChangingContent.changeType = change.origin
            // 行号从零开始计算
            theChangingContent.startLine = change.from.line + 1
            let newList = []
            for (let j = 0; j < change.text.length; j++) {
                newList.push(editor.getLine(change.from.line + j))
            }
            theChangingContent.newContent = newList
            theChangingContent.removedNumbers = change.removed.length
            emitter.emit('updateMsgNeedSendToServer', theChangingContent)
        }
    })
    //设置大小
    editor.setSize("100%", "100%")
})

//工具方法
//获得鼠标当前位置
const getCursor = () => {
    thisLine.value = editor.getCursor()
}
//撤销
const getUndo = () => {
    editor.execCommand("undo")
}
//搜索
const getSearch = () => {
    editor.execCommand("findPersistent")
}
//替换
const getReplace = () => {
    editor.execCommand("replace")
}

//针对markdown
//辅助完成加粗等修饰的方法
const addUntils = (matchStr, changePos) => {
    let preAlready = false, aftAlready = false // 前后是否已经有相应样式标识，如**，`，~等   
    if (editor.somethingSelected()) {
        const selectContent = editor.listSelections()[0] // 第一个选中的文本
        let { anchor, head } = selectContent // 前后光标位置
        head.line >= anchor.line && head.sticky === 'before' && ([head, anchor] = [anchor, head])
        let { line: preLine, ch: prePos } = head
        let { line: aftLine, ch: aftPos } = anchor
        // 判断前后是否有matchStr
        editor.getRange({ line: preLine, ch: prePos - changePos }, head) ===
            matchStr && (preAlready = true)
        editor.getRange(anchor, { line: aftLine, ch: aftPos + changePos }) ===
            matchStr && (aftAlready = true)
        // 去除前后的matchStr
        aftAlready &&
            editor.replaceRange('', anchor, { line: aftLine, ch: aftPos + changePos })
        preAlready &&
            editor.replaceRange('', { line: preLine, ch: prePos - changePos }, head)
        if (!preAlready && !aftAlready) {
            // 前后都没有matchStr
            editor.setCursor(anchor)
            editor.replaceSelection(matchStr)
            editor.setCursor(head)
            editor.replaceSelection(matchStr)
            prePos += changePos
            aftPos += aftLine === preLine ? changePos : 0
            editor.setSelection(
                { line: aftLine, ch: aftPos },
                { line: preLine, ch: prePos }
            )
        } else if (!preAlready) {
            // 只有后面有matchStr
            editor.setCursor(head)
            editor.replaceSelection(matchStr)
            prePos += changePos
            aftPos += aftLine === preLine ? changePos : 0
            editor.setSelection(
                { line: aftLine, ch: aftPos },
                { line: preLine, ch: prePos }
            )
        } else if (!aftAlready) {
            // 只有前面有matchStr
            editor.setCursor({ line: aftLine, ch: aftPos - changePos })
            editor.replaceSelection(matchStr)
            prePos -= changePos
            aftPos -= aftLine === preLine ? changePos : 0
            editor.setSelection(
                { line: aftLine, ch: aftPos },
                { line: preLine, ch: prePos }
            )
        }
    } else {
        let cursor = editor.getCursor()
        let { line: curLine, ch: curPos } = cursor // 获取光标位置
        // 判断前后是否有matchStr
        editor.getRange({ line: curLine, ch: curPos - changePos }, cursor) ===
            matchStr && (preAlready = true)
        editor.getRange(cursor, { line: curLine, ch: curPos + changePos }) ===
            matchStr && (aftAlready = true)
        // 去除前后的matchStr
        if (aftAlready && preAlready) {
            editor.replaceRange('', cursor, { line: curLine, ch: curPos + changePos })
            editor.replaceRange('', { line: curLine, ch: curPos - changePos }, cursor)
            editor.setCursor({ line: curLine, ch: curPos - changePos })
        } else if (!preAlready && !aftAlready) {
            // 前后都没有matchStr
            editor.replaceSelection(matchStr + matchStr)
            editor.setCursor({ line: curLine, ch: curPos + changePos })
        }
    }
    editor.focus()
}
//加粗
const getBlod = () => {
    addUntils("**", 2)
}
//倾斜
const getIncline = () => {
    addUntils("*", 1)
}
//删除线
const getDeleteLine = () => {
    addUntils("~~", 2)
}
//辅助完成插入图片等功能，更完善一点应该是光标选中说明文字
const insertUntils = (str, changePos) => {
    let cursor = editor.getCursor()
    let { line: curLine, ch: curPos } = cursor // 获取光标位置
    editor.replaceSelection(str)
    editor.setCursor({ line: curLine, ch: curPos + changePos })
    editor.focus()
}
//插入图片
const addIMG = () => {
    insertUntils("![图片]()", 6)
}
//插入链接
const addHTTP = () => {
    insertUntils("[链接]()", 5)
}

//插入引用和无序（可多行）
const addListUntils = (matchStr) => {
    if (editor.somethingSelected()) {
        const selectContent = editor.listSelections()[0] // 第一个选中的文本
        let { anchor, head } = selectContent
        head.line >= anchor.line && head.sticky === 'before' && ([head, anchor] = [anchor, head])
        let preLine = head.line
        let aftLine = anchor.line
        if (preLine !== aftLine) {
            // 选中了多行，在每行前加上匹配字符
            let pos = matchStr.length
            for (let i = preLine; i <= aftLine; i++) {
                editor.setCursor({ line: i, ch: 0 })
                editor.replaceSelection(matchStr)
                i === aftLine && (pos += editor.getLine(i).length)
            }
            editor.setCursor({ line: aftLine, ch: pos })
            editor.focus()
        } else {
            // 检测开头是否有匹配的字符串，有就将其删除
            const preStr = editor.getRange({ line: preLine, ch: 0 }, head)
            if (preStr === matchStr) {
                editor.replaceRange('', { line: preLine, ch: 0 }, head)
            } else {
                const selectVal = editor.getSelection()
                let replaceStr = `\n\n${matchStr}${selectVal}\n\n`
                editor.replaceSelection(replaceStr)
                editor.setCursor({ line: preLine + 2, ch: (matchStr + selectVal).length })
            }
        }
    } else {
        const cursor = editor.getCursor()
        let { line: curLine, ch: curPos } = cursor // 获取光标位置
        let preStr = editor.getRange({ line: curLine, ch: 0 }, cursor)
        let preBlank = ''
        if (/^( |\t)+/.test(preStr)) {
            // 有序列表标识前也许会有空格或tab缩进
            preBlank = preStr.match(/^( |\t)+/)[0]
        }
        curPos && (matchStr = `\n${preBlank}${matchStr}`) && ++curLine
        editor.replaceSelection(matchStr)
        editor.setCursor({ line: curLine, ch: matchStr.length - 1 })
    }
    editor.focus()
}
const addCite = () => {
    addListUntils("> ")
}
const addUnorderedList = () => {
    addListUntils("- ")
}
const addOrderedList = () => {
    if (editor.somethingSelected()) {
        const selectContent = editor.listSelections()[0] // 第一个选中的文本
        let { anchor, head } = selectContent
        head.line >= anchor.line && head.sticky === 'before' && ([head, anchor] = [anchor, head])
        let preLine = head.line
        let aftLine = anchor.line
        if (preLine !== aftLine) {
            // 选中了多行，在每行前加上匹配字符
            let preNumber = 0
            let pos = 0
            for (let i = preLine; i <= aftLine; i++) {
                editor.setCursor({ line: i, ch: 0 })
                const replaceStr = `${++preNumber}. `
                editor.replaceSelection(replaceStr)
                if (i === aftLine) {
                    pos += (replaceStr + editor.getLine(i)).length
                }
            }
            editor.setCursor({ line: aftLine, ch: pos })
            editor.focus()
        } else {
            const selectVal = editor.getSelection()
            let preStr = editor.getRange({ line: preLine, ch: 0 }, head)
            let preNumber = 0
            let preBlank = ''
            if (/^( |\t)+/.test(preStr)) {
                // 有序列表标识前也许会有空格或tab缩进
                preBlank = preStr.match(/^( |\t)+/)[0]
                preStr = preStr.trimLeft()
            }
            if (/^\d+(\.) /.test(preStr)) {
                // 是否以'数字. '开头，找出前面的数字
                preNumber = Number.parseInt(preStr.match(/^\d+/)[0])
            }
            let replaceStr = `\n${preBlank}${preNumber + 1}. ${selectVal}\n`
            editor.replaceSelection(replaceStr)
            editor.setCursor({ line: preLine + 1, ch: replaceStr.length })
        }
    } else {
        const cursor = editor.getCursor()
        let { line: curLine, ch: curPos } = cursor // 获取光标位置
        let preStr = editor.getRange({ line: curLine, ch: 0 }, cursor)
        let preNumber = 0
        let preBlank = ''
        if (/^( |\t)+/.test(preStr)) {
            // 有序列表标识前也许会有空格或tab缩进
            preBlank = preStr.match(/^( |\t)+/)[0]
            preStr = preStr.trimLeft()
        }
        if (/^\d+(\.) /.test(preStr)) {
            // 是否以'数字. '开头，找出前面的数字
            preNumber = Number.parseInt(preStr.match(/^\d+/)[0])
        }
        let replaceStr = `\n${preBlank}${preNumber + 1}. `
        editor.replaceSelection(replaceStr)
        editor.setCursor({ line: curLine + 1, ch: replaceStr.length - 1 })
    }
}

const switchMode = (currMode)=>{
    if(currMode === "markdown"){
        editor.setOption("mode","markdown")
        console.log(1)
    }else if(currMode === "LaTex"){
        editor.setOption("mode","stex")
    }
}

//返回给父组件
defineExpose({
    getUndo,
    getSearch,
    getReplace,
    getBlod,
    getIncline,
    getDeleteLine,
    addIMG,
    addHTTP,
    addCite,
    addUnorderedList,
    addOrderedList,
    getCursor,
    switchMode,
})

onBeforeUnmount(() => {
    emitter.emit('editorSendMsgToBottom', false)
})

</script>
<style scoped>
@import url("../../node_modules/codemirror/lib/codemirror.css");
@import url("../../node_modules/codemirror/addon/hint/show-hint.css");
/*主题拓展*/
@import url("../../node_modules/codemirror/theme/ambiance.css");
@import url("../../node_modules/codemirror/theme/blackboard.css");
@import url("../../node_modules/codemirror/theme/3024-day.css");
@import url("../../node_modules/codemirror/theme/ayu-dark.css");
@import url("../../node_modules/codemirror/theme/paraiso-light.css");
@import url("../../node_modules/codemirror/addon/scroll/simplescrollbars.css");
@import url("../../node_modules/codemirror/addon/fold/foldgutter.css");
@import url("../../node_modules/codemirror/addon/dialog/dialog.css");
</style>