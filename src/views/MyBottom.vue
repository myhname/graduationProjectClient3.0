<template>
    <div class="box">
        <!-- 左下角时间日期显示 -->
        <div class="time">
            {{ nowTime }} 星期{{ NowDay }}
        </div>
        <!-- 当前编辑的文章信息 -->
        <div class="wordCount" :class="{ showControl: !isShow }">行数：{{ lineNumbers }}</div>
        <div class="language" :class="{ showControl: !isShow }">语言模式：{{ mode }}</div>
        <!-- 操作提示信息 -->
        <div class="msgBox">
            {{ promptingMsg }}
        </div>
            <!-- 网络状态 -->
        <div class="imgInternet" v-bind:title="isOnlineMsg">
            <MyIcons v-if="!isOnline" icon="wangluo" style="font-size: 1rem;"></MyIcons>
            <MyIcons v-else icon="wuxianwangluo" style="font-size: 1rem;"></MyIcons>
        </div>
        
    </div>
</template>

<script setup>

import { ref, onMounted, onBeforeUnmount, onUnmounted } from 'vue'

import MyIcons from '../components/MyIcons.vue';

import emitter from '../untils/eventBus'

//日期显示
const nowTime = ref(new Date().toLocaleDateString())
//转换星期显示，理论上一天更新一次星期就行，设置0点，到了零点对比一下，但是对比还是要定时器，怎么也是有一个，直接用行了
const day = ["日", "一", "二", "三", "四", "五", "六"]
const NowDay = ref()
const nowTimer = ref()

//控制显示
const isShow = ref(false)
//接收行数
const lineNumbers = ref("")
//接收语言类型
const mode = ref("")
//接收提示信息
const promptingMsg = ref("欢迎使用毕业设计编辑器")
//定时清除提示信息
const timerClearMsg = ref()
//在线or本地状态
const isOnline = ref(false)
//标签信息
const isOnlineMsg = ref("本地编辑")

//获取日期
const getNowTime = () => {
    let date = new Date();
    nowTime.value = date.toLocaleString();
    NowDay.value = day[date.getDay()]
}

onMounted(() => {
    //获取日期
    nowTimer.value = setInterval(() => {
        getNowTime()
    }, 1000)

    //定时清除提示信息，1分40秒
    timerClearMsg.value = setInterval(() => {
        promptingMsg.value = ""
    }, 100000)

    //同步页面地址, 控制显示
    emitter.on('syncWhichViewBottom', (value) => {
        if (value === 1) {
            isShow.value = true
        } else {
            isShow.value = false
        }
    })
    emitter.on('editorSendMsgToBottom',(value)=>{
        isShow.value = value
    })
    emitter.on('lineNumberChangeToBottom', (value) => {
        lineNumbers.value = value
    })
    emitter.on('modeChangeToBottom', (value) => {
        mode.value = value
    })
    
    //接收提示信息
    emitter.on('leftSendMsgToBottom', (value)=>{
        promptingMsg.value = value
    })
    emitter.on('IndexSendMsgToBottom', (value)=>{
        promptingMsg.value = value
    })
    emitter.on('headerSendMsgToBottom', (value)=>{
        promptingMsg.value = value
    })
    emitter.on('contentSendMsgToBottom', (value)=>{
        promptingMsg.value = value
    })
})

onBeforeUnmount(() => {
    emitter.off('syncWhichViewBottom')
    emitter.off('editorSendMsgToBottom')
    emitter.off('lineNumberChangeToBottom')
    emitter.off('modeChangeToBottom')
    emitter.off('leftSendMsgToBottom')
    emitter.off('IndexSendMsgToBottom')
    emitter.off('headerSendMsgToBottom')
    emitter.off('contentSendMsgToBottom')
})

onUnmounted(() => {
    clearTimeout(nowTimer.value)
})

</script>

<style scoped>
.showControl {
    display: none;
}

.box {
    position: relative;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    background-repeat: no-repeat;
    background-size: cover;
    background-image: url("../images/backgroundImg/3.jpg");
    opacity: 0.8;
}

.time {
    position: absolute;
    left: 1.5rem;
}

.wordCount {
    margin: 0 1rem;
}

.language {
    margin: 0 1rem;
}

.msgBox{
    position: absolute;
    top: 0;
    right: 2.5rem;
}

.imgInternet{
    position: absolute;
    right: 0.5rem;
    top: 0;
}
</style>