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

import {ref,watch} from 'vue'

import emitter from '../untils/eventBus'

//引入方法以及路由
import { useRouter } from 'vue-router'

import {login} from '../request/user'

const router = useRouter()

//提示信息
const promptingMsg = ref()

const toEditor = ()=>{
    // 本地编辑
    emitter.emit('changeCurrView', 1)
    emitter.emit('isOnlineReady', false)
    promptingMsg.value = "进入本地编辑模式"
    router.push('/editor')
}
//实际上要先跳转到用户登录界面 
const toOnlineEditor = ()=>{
    // 如果已经登录则无需再次登录
    if(localStorage.getItem('userUID')){
        login({
            "UUID":null,
            "name":null,
            "password":localStorage.getItem('password'),
            "account":localStorage.getItem('account')
        }).then((res)=>{
            let curr = res.object.split("|||")
            //更新token有效期
            localStorage.setItem('token', curr[0])
            // 在线编辑
            emitter.emit('changeCurrView', 1)
            emitter.emit('isOnlineReady', true)
            promptingMsg.value = "进入在线编辑"
            router.push('/editor')
            return
        })
    }
    emitter.emit('changeCurrView', 2)
    promptingMsg.value = "用户登录"
    router.push('/account')
}

//发送提示信息
watch(promptingMsg,()=>{
    emitter.emit('IndexSendMsgToBottom', promptingMsg.value)
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
    background-image: url("../images/backgroundImg/7.jpg");
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