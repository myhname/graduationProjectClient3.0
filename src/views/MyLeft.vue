<template>
    <div class="box">
        <!-- 上方功能栏 -->
        <div class="left-top" :class="{showControl:!isShow}">
            <div class="appControl" id="jiacu" v-bind:title="blodMsg">
                <MyIcons icon="jiacu" Style="font-size:2rem"></MyIcons>
            </div>
            <div class="appControl" id="qingxie" v-bind:title="inclineMsg">
                <MyIcons icon="qingxie" Style="font-size:2rem"></MyIcons>
            </div>
            <div class="appControl" id="chehui" v-bind:title="undoMsg">
                <MyIcons icon="chehui" Style="font-size:2rem"></MyIcons>
            </div>
            <div class="appControl" id="sousuo" v-bind:title="searchMsg">
                <MyIcons icon="search" Style="font-size:2rem"></MyIcons>
            </div>
            <div class="appControl" id="youxuliebiao
            " v-bind:title="orderlistMsg">
                <MyIcons icon="youxuliebiao
                " Style="font-size:2rem"></MyIcons>
            </div>
            <div class="appControl" id="wuxuliebiao" v-bind:title="unorderlistMsg">
                <MyIcons icon="bulletpoint" Style="font-size:2rem"></MyIcons>
            </div>
            <div class="appControl" id="yinyong" v-bind:title="quoteMsg">
                <MyIcons icon="yinyong" Style="font-size:2rem"></MyIcons>
            </div> 
            <div class="appControl" id="charutupian" v-bind:title="insertImgMsg">
                <MyIcons icon="xingzhuang-tupian" Style="font-size:2rem"></MyIcons>
            </div>
            <div class="appControl" id="charulianjie" v-bind:title="insertHttpMsg">
                <MyIcons icon="lianjie" Style="font-size:2rem"></MyIcons>
            </div>
        </div>
        <!-- 下方功能栏 -->
        <div class="left-bottom">
            <div class="bottomIcon" id="shezhi" v-bind:title="setupMsg">
                <MyIcons icon="shezhi" Style="font-size:2.5rem"></MyIcons>
            </div>
            <div class="bottomIcon" id="user" v-bind:title="userMsg" @click="toAccount">
                <MyIcons icon="yonghu-yuan" Style="font-size:2.5rem"></MyIcons>
            </div>
            <div class="bottomIcon" id="huishouye" v-bind:title="returnIndexMsg" @click="toIndex">
                <MyIcons icon="huitui" Style="font-size:2.5rem"></MyIcons>
            </div>
        </div>
    </div>
</template>

<script setup>

import { ref,watch,onMounted,onBeforeUnmount} from 'vue';

import emitter from '../untils/eventBus'

import MyIcons from '@/components/MyIcons.vue';

//路由
import { useRouter } from 'vue-router'

const router = useRouter()

// 名称
const blodMsg =  "加粗"
const inclineMsg = "倾斜"
const undoMsg = "撤销"
const searchMsg = "搜索"
const orderlistMsg = "有序列表"
const unorderlistMsg = "无序列表"
const quoteMsg = "引用"
const insertImgMsg = "插入图片"
const insertHttpMsg = "插入链接"

const setupMsg = "设置"
const userMsg = "用户"
const returnIndexMsg = "返回首页"

//提示信息
const promptingMsg = ref()
//控制编菜单栏的显示
const isShow = ref(false)

//跳转操作
const toAccount = ()=>{
    //进入用户界面
    emitter.emit('changeCurrView', 2)
    emitter.emit('isOnlineReady', false)
    isShow.value = false
    promptingMsg.value = "进入用户界面"
    router.push('/account')
}
const toIndex = ()=>{
    //返回首页
    emitter.emit('changeCurrView', 0)
    emitter.emit('isOnlineReady', false)
    isShow.value = false
    promptingMsg.value = "返回首页"
    router.push('/')
}

//发送提示信息
watch(promptingMsg,()=>{
    emitter.emit('leftSendMsgToBottom', promptingMsg.value)
})

onMounted(()=>{
    //监听工具栏显示控制信息
    emitter.on('leftToolsShow', (value)=>{
        isShow.value = value
    })
})

onBeforeUnmount(()=>{
    emitter.off('leftToolsShow')
})

</script>

<style scoped>
.showControl{
    display: none;
}
.box {
    position: relative;
    width: 100%;
    height: 100%;
    background-repeat: no-repeat;
    background-size: cover;
    background-image: url("../images/backgroundImg/3.jpg");
    opacity: 0.8;
}
.left-top{
    position: absolute;
    left: 0.4rem;
    top: 0;
}
.left-bottom{
    position: absolute;
    left: 0.4rem;
    bottom: 0;
}
.appControl{
    position: relative;
    margin: 1rem auto;
    width: 2rem;
    height: 2rem;
    /* background-color: crimson; */
}

.appControl:hover{
    cursor: pointer;
    background-color: darkgray;
}

.bottomIcon{
    position: relative;
    margin: 1rem auto;
    width: 2.5rem;
    height: 2.5rem;
}

.bottomIcon:hover{
    cursor: pointer;
    background-color: darkgray;
}
</style>