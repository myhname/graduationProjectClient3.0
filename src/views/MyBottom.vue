<template>
    <div class="box">
        <div class="time"> {{ nowTime }} 星期{{ NowDay }}</div>
        <div class="editor" :class="{showControl:!isShow}"></div>
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
const isShow = ref(true)

//获取日期
const getNowTime = () => {
    let date = new Date();
    nowTime.value = date.toLocaleString();
    NowDay.value = day[date.getDay()]
}

onMounted(() => {
    nowTimer.value = setInterval(() => {
        getNowTime()
    }, 1000)
    // emitter.on('lineNumberChange', (value) => {
    //     lineNumbers.value = value
    // })
    // emitter.on('modeChange', (value) => {
    //     mode.value = value
    // })
})

// onBeforeUnmount(() => {
//     emitter.off('lineNumberChange')
//     emitter.off('modeChange')
// })

onUnmounted(() => {
    clearTimeout(nowTimer.value)
})

</script>

<style scoped>
.showControl{
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
</style>