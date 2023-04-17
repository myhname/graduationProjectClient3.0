<template>
    <div class="box">
        <div class="letf-to-editor">
            <div class="text left-text" @click="toEditor">
                本地编辑
            </div>
        </div>
        <div class="right-to-onlineEditor">
            <div class="text right-text" @click="toOnlineEditor">
                在线编辑
            </div>
        </div>
    </div>
</template>

<script setup>

import {ref,watch,onMounted,onBeforeUnmount} from 'vue'

import emitter from '../untils/eventBus'

// 传递页面跳转信息
const toWhichView = ref()
const toEditor = ()=>{
    toWhichView.value = 1
}
//实际上要先跳转到用户登录界面 
const toOnlineEditor = ()=>{
    toWhichView.value = 2
}
watch(toWhichView, ()=>{
    emitter.emit('toWhichView', toWhichView.value)
})

onMounted(()=>{
    //同步当前页面地址信息
    emitter.on('syncWhichView',(value)=>{
        toWhichView.value = value
    })
})

onBeforeUnmount(()=>{
  //注销监听事件
  emitter.off('syncWhichView')
})

</script>

<style scoped>
.box {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
    background-position: center top;
    background-repeat: no-repeat;
    background-size: cover;
    background-image: url("../images/backgroundImg/4.jpg");
    opacity: .6;
}

.letf-to-editor{
    position: absolute;
    left: 0;
    top: 0;
    width: 50%;
    height: 100%;
    overflow: hidden;
    /*边框*/
  border-style: groove;
  border-right: 0;
}
.right-to-onlineEditor{
    position: absolute;
    left: 50%;
    top: 0;
    width: 50%;
    height: 100%;
    overflow: hidden;
    border-style: groove;
}
.text {
    position: absolute;
    top: 45%;
    width: 10rem;
    height: 5rem;
    /* 字体居中 */
    text-align: center;
    line-height: 5rem;
    font-size: 1.2rem;
    font-weight: bold;
    color: black;
    border-style: double;
}
.left-text{
    left: 40%;
}
.right-text{
    right: 40%;
}
</style>