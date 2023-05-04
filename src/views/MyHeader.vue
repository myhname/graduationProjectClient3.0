<template>
    <div class="box">
        <!-- 应用图标，固定左上角 -->
        <div class="header-img" id="yingyongtubiao" v-bind:title="IconMsg">
            <MyIcons icon="bianji" style="font-size: 2rem;"></MyIcons>
        </div>
        <!-- 左侧控制组件，动态显示 -->
        <div class="header-left" :class="{showMenu:!isEditorView}" ref="menuControl">
            <div class="editorBtn">
                <button type="button" @click="openFileMenu">文件</button>
                <div class="menu" :class="{showMenu:!isFileMenu}">
                    <ul>
                        <li @click="getNewFile">新建</li>
                        <li @click="getOpenFile">打开</li>
                        <li v-if="!isOnline" @click="getSaveFile">保存</li>
                        <li v-else @click="getSaveToSQL">保存到数据库</li>
                        <li @click="getSaveNewFile">另存为</li>
                        <li @click="getOutput">导出为...</li>
                    </ul>
                </div>
            </div>
            <div class="onlineEditorBtn" :class="{showMenu:!isOnline}">
                <button type="button" @click="openCooperationMenu">协作</button>
                <div class="menu" :class="{showMenu:!isCooperationMenu}">
                    <ul>
                        <li v-if="!isCooperation" @click="getStartConnect">开始协作</li>
                        <li v-else @click="getCloseConnect">结束协作</li>
                        <li @click="getUpload">上传</li>
                        <li @click="getFileList">打开...</li>
                        <li @click="getComment">评论</li>
                        <li @click="getPermission">修改权限</li>
                        <li @click="getHistory">恢复历史版本</li>
                        <li @click="getClientServer">服务器配置</li>
                    </ul>
                </div>
            </div>
        </div>
        <!-- 当前文件名 -->
        <div class="header-middle">
            {{ titleName }} 毕业设计编辑器
        </div>
        <!-- 右侧控制组件 -->
        <div class="header-right">
            <div class="appControl" id="splitScreen" v-bind:title="splitscreenMsg" :class="{showMenu:!isEditorView}" @click="getAddScreen">
                <MyIcons icon="w_pingmu" style="font-size: 2rem;"> </MyIcons>
            </div>
            <div class="appControl" id="present" v-bind:title="presentMsg" @click="getPreview" :class="{showMenu:!isEditorView}">
                <MyIcons v-if="!ISPRESENT" icon="browse" style="font-size: 2rem;"> </MyIcons>
                <MyIcons v-else icon="browse-off" style="font-size: 2rem;"></MyIcons>
            </div>
            <div class="appControl screenControl" id="min" v-bind:title="minsMsg" @click="minWindow">
                <MyIcons icon="zuixiaohua" style="font-size: 1.5rem;"> </MyIcons>
            </div>
            <div class="appControl screenControl" id="max" v-bind:title="maxMsg" @click="maxWindow">
                <MyIcons v-if="!ISMAX" icon="3zuidahua-1" style="font-size: 1.5rem;"> </MyIcons>
                <MyIcons v-else icon="zuidahua" style="font-size: 1.5rem;"></MyIcons>
            </div>
            <div class="appControl screenControl" id="close" v-bind:title="closeMsg" @click="closeWindow">
                <MyIcons icon="close" style="font-size: 1.5rem;"> </MyIcons>
            </div>
        </div>
    </div>
</template>

<script setup>

import { ref, watch, onMounted, onBeforeUnmount } from 'vue'

import emitter from '../untils/eventBus'

import MyIcons from '@/components/MyIcons.vue';

//图标信息
const IconMsg = "应用图标"
const splitscreenMsg = "分屏显示"
const presentMsg = "预览"
const minsMsg = "最小化"
const maxMsg = "最大化"
const closeMsg = "最小化"

//提示信息
const promptingMsg = ref()

//绑定DOM元素
const menuControl = ref()

//预览图标显示控制
const ISPRESENT = ref(false)
//最大化图标显示控制
const ISMAX = ref(false)

//当前文件名 + "-"
const titleName = ref("")

//监听页面改变，调整左侧菜单栏按钮显示
const currView = ref()
//全假表示在首页
const isAccountView = ref(false)
const isEditorView = ref(false)
const isOnline = ref(false)
//子菜单显示控制
const isFileMenu = ref(false)
const isCooperationMenu = ref(false)

//协作状态控制
const isCooperation = ref(false)

//判别当前页面状态，改变控制
watch(currView, () => {
    switch (currView.value) {
        case 0:
            isAccountView.value = false
            isEditorView.value = false
            titleName.value = ""
            break;
        case 1:
            isAccountView.value = false
            isEditorView.value = true
            break;
        case 2:
            isAccountView.value = true
            isEditorView.value = false
            titleName.value = ""
            break;
        default:
    }
})

//点击其他位置收起菜单
window.addEventListener('click', (event)=>{
    if(menuControl.value){
        if(!menuControl.value.contains(event.target)){
        isFileMenu.value = false
        isCooperationMenu.value = false
    }
    }
})
const openFileMenu = ()=>{
    //两菜单互斥
    isFileMenu.value = true
    isCooperationMenu.value = false
}
const openCooperationMenu = ()=>{
    isFileMenu.value = false
    isCooperationMenu.value = true
}

// 文件操作， 新建本地文件
const getNewFile = ()=>{
    // console.log("新建")
    if(!isOnline.value){
        emitter.emit('fileControlMsgToEditor', "newFile")
        promptingMsg.value = "新建临时文件"
    }else{
        emitter.emit('fileControlMsgToEditor', "newFileOnline")
        // console.log("555")
        promptingMsg.value = "新建在线文档"
    }
}
// 打开本地文件
const getOpenFile = ()=>{
    emitter.emit('fileControlMsgToEditor', "openFile")
    promptingMsg.value = "打开本地文件"
}
// 保存到本地
const getSaveFile = ()=>{
    emitter.emit('fileControlMsgToEditor', "saveFile")
    promptingMsg.value = "保存文件到本地"
}
// 另存为
const getSaveNewFile = ()=>{
    emitter.emit('fileControlMsgToEditor', "saveNewFile")
    promptingMsg.value = "另存为"
}
// 导出为
const getOutput = ()=>{
    emitter.emit('fileControlMsgToEditor', "output")
    promptingMsg.value = "导出渲染文件"
}

//协作编辑操作， 当前版本保存到数据库
const getSaveToSQL = ()=>{
    emitter.emit('fileControlMsgToEditor', "saveToSQL")
    promptingMsg.value = "保存文件修改到数据库"
}
// 开启websocket连接
const getStartConnect = ()=>{
    emitter.emit('fileControlMsgToEditor', "startConnect")
    promptingMsg.value = "开始协作模式"
}
// 断开websocket连接
const getCloseConnect = ()=>{
    emitter.emit('fileControlMsgToEditor', "closeConnect")
    promptingMsg.value = "结束协作模式"
}
// 上传
const getUpload = ()=>{
    emitter.emit('fileControlMsgToEditor', "upload")
    promptingMsg.value = "上传当前界面文件"
}
// 打开当前用户有权限的文章列表
const getFileList = ()=>{
    emitter.emit('fileControlMsgToEditor', "getFlieList")
    promptingMsg.value = "获取文章列表"
}
// 评论
const getComment = ()=>{
    emitter.emit('fileControlMsgToEditor', "newComment")
    promptingMsg.value = "添加评论"
}
// 修改权限, 删除的话单独加一个标识就好,不用加接口
const getPermission = ()=>{
    emitter.emit('fileControlMsgToEditor', "newPermission")
    promptingMsg.value = "设置文章权限"
}
// 恢复历史版本
const getHistory = ()=>{
    emitter.emit('fileControlMsgToEditor', "historyBack")
    promptingMsg.value = "恢复历史版本"
}
// 服务器设置
const getClientServer = ()=>{
    emitter.emit('fileControlMsgToEditor', "clientServer")
    promptingMsg.value = "配置服务端"
}
// 分屏
const getAddScreen = ()=>{
    emitter.emit('fileControlMsgToEditor', "addScreen")
    promptingMsg.value = "预览"
}
// 预览
const getPreview = ()=>{
    emitter.emit('fileControlMsgToEditor', "preview")
    promptingMsg.value = "预览"
}

//窗口控制
const minWindow = () => {
    $app.min()
}
const maxWindow = () => {
    $app.max()
}
const closeWindow = () => {
    $app.close()
}

// 监听页面大小改变，改变最大化图标
window.onresize = () => {
    return (() => {
        //判断页面是否最大化
        if (window.outerHeight === screen.availHeight && window.outerWidth === screen.availWidth) {
            ISMAX.value = true
            promptingMsg.value = "屏幕最大化"
        } else {
            ISMAX.value = false
            promptingMsg.value = ""
        }
    })()
}

//发送提示信息
watch(promptingMsg,()=>{
    emitter.emit('headerSendMsgToBottom', promptingMsg.value)
})

onMounted(() => {
    //接收页面改变信息
    emitter.on('changeCurrView', (value) => {
        currView.value = value
    })
    emitter.on('isOnlineReady', (value)=>{
        isOnline.value = value
        if(value === true){
            isEditorView.value = true
            isFileMenu.value = true
        }
    })
    //接收文件信息
    emitter.on('titleNameChangeToHeader',(value)=>{
        titleName.value = value
    })
    emitter.on('sendCooperatrionMSGToHeader', (value)=>{
        isCooperation.value = value
    })
})

onBeforeUnmount(() => {
    //注销监听事件
    emitter.off('changeCurrView')
    emitter.off('isOnlineReady')
    emitter.off('titleNameChangeToHeader')
})

</script>

<style scoped>

.showMenu{
    display: none;
}
.box {
    position: relative;
    height: 100%;
    width: 100%;
    background-position: center top;
    background-repeat: no-repeat;
    background-size: cover;
    background-image: url("../images/backgroundImg/3.jpg");
    opacity: .6;
}

.header-img {
    position: fixed;
    left: 0.5rem;
    right: 0;
}

.header-left {
    position: absolute;
    top: 0;
    left: 3rem;
    width: 10rem;
    height: 100%;
}

.editorBtn {
    box-sizing: border-box;
    position: absolute;
    top: 0;
    left: 0;
    width: 5rem;
    height: 100%;
}

.onlineEditorBtn {
    box-sizing: border-box;
    position: absolute;
    top: 0;
    left: 5.1rem;
    width: 5rem;
    height: 100%;
}

button {
    width: 100%;
    height: 100%;
    color: black;
    font-size: medium;
    font-weight: bolder;
    border: 0.1rem solid;
    border-color: aliceblue;
    border-radius: 0.5rem;
    opacity: 0.7;
}

button:hover {
    opacity: 0.9;
    border-color: rgb(218, 99, 99);
    background-color: black;
    color: aliceblue;
}

.menu {
    position: absolute;
    left: 0;
    top: 100%;
    width: 9rem;
    background-color: black;
    color: aliceblue;
    opacity: 1;
}

ul {
    box-sizing: border-box;
    position: relative;
    left: 0;
    right: 0;
    margin: 0;
    padding: 0;
    list-style: none;
    display: flex;
    flex-direction: column;
}

li {
    box-sizing: border-box;
    height: 1.7rem;
    width: 9rem;
    padding: 0.2rem 1.5rem;
    list-style-type: none;
    display: block;
    text-align: left;
    cursor: pointer;
    font-weight: bolder;
}

li:hover {
    background-color: rgb(58, 57, 57);
}

.header-middle {
    box-sizing: border-box;
    flex: 1;
    width: 30%;
    height: 100%;
    /*这里文字居中不好用，所以直接拉边距好了*/
    margin-left: 40%;
    margin-right: 12rem;
    padding-top: 0.5rem;
    color: black;
    font-weight: bolder;
    -webkit-app-region: drag;
    /* 可拖拽 */
    -webkit-user-select: none;
    /* 禁止选择文本，防止和拓展冲突 */
}

.header-right {
    position: absolute;
    right: 0;
    top: 0;
    width: 11rem;
    height: 100%;
}

.appControl {
    position: relative;
    width: 2rem;
    height: 100%;
}

.appControl:hover {
    background-color: darkgray;
}

.screenControl {
    box-sizing: border-box;
    padding-top: 0.3rem;
    padding-left: 0.25rem;
}

#splitScreen {
    position: absolute;
    right: 9rem;
}

#present {
    position: absolute;
    right: 6.5rem;
}

#present:hover {
    cursor: pointer;
}

#min {
    position: absolute;
    right: 4rem;
}

#max {
    position: absolute;
    right: 2rem;
}

#close {
    position: absolute;
    right: 0rem;
}

#close:hover {
    background-color: red;
}</style>