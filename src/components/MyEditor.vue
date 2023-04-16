<template>
    <textarea ref="mdText" v-model="markdown"></textarea>
</template>

<script setup>

import { ref, onMounted} from 'vue';

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
let markdown = ref("测试一下能不能用")


onMounted(() => {
    editor = codemirror.fromTextArea(mdText.value, {
        value: markdown.value,//初始值
        //切换主题还是切换切换编辑器后续定
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
            let code = cm.getValue(); // 这里要用多一个载体去获值,不然会重复赋值卡顿
            markdown.value = code
    
        }),
        //代码提示这个不知道是不支持markdown还是我现在配置不够，反正不能用
        editor.on('inputRead', () => {
            editor.showHint()
        })
    //设置大小
    editor.setSize("100%", "100%")
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