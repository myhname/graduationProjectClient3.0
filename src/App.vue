<template>

    <!-- 头部菜单栏 -->
    <div class="header">
      <MyHeader />
    </div>
    <!-- 左侧工具栏 -->
    <div class="left">
      <MyLeft />
    </div>
    <!-- 底部状态栏 -->
    <div class="bottom">
      <MyBottom />
    </div>
    <!-- 内容 -->
    <div class="content">
      <router-view v-slot="{ Component }">
        <transition name="slide-fade">
          <component class="child-view" :is="Component" />
        </transition>
      </router-view>
    </div>

</template>

<script setup>
import { ref,reactive,watch,onMounted,onBeforeUnmount } from "vue";

import emitter from "./untils/eventBus";

//导入路由
import { useRouter } from "vue-router";

//引入固定位置的视图
import MyHeader from "./views/MyHeader.vue";
import MyLeft from './views/MyLeft.vue';
import MyBottom from './views/MyBottom.vue';

// 设置路由
const router = useRouter()
const pages = reactive([
  {
    name: 'home',
    path: '/'
  },{
    name: 'editor',
    path: '/editor'
  },{
    name: 'account',
    path: '/account'
  },
])
const changePage = (pageIndex) => {
  router.push(pages[pageIndex].path)
}
//操作路由，并定位当前界面，操作顶部菜单栏显示，0home,1editor,2editor
//初始设4是为了避免重新编辑初始化后导致当前页面地址和要跳转的地址一致从而导致跳转失败
const currView = ref(4)
watch(currView,()=>{
  changePage(currView.value)
  //这里用同名通信事件会有问题，所以用两个事件分别向两个页面发送信息，从而同步页面地址状态
  emitter.emit('syncWhichView', currView.value)
  emitter.emit('syncWhichViewLeft', currView.value)
})

onMounted(()=>{
  //接收页面跳转信息
  emitter.on('toWhichView', (value)=>{
    currView.value = value
  })
  emitter.on('toWhichViewLeft', (value)=>{
    currView.value = value
  })
})

onBeforeUnmount(()=>{
  //注销监听事件
  emitter.off('toWhichView')
  emitter.off('toWhichViewLeft')
})

</script>

<style>
/*基础样式*/
#app {
  padding: 0;
  margin: 0;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: left;
  color: #2c3e50;
}
/*总体布局*/
.header{
  width: 100%;
  height: 2.25rem;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 9;
}
.left{
  position: fixed;
  top: 2.25rem;
  left: 0;
  width: 3.125rem;
  height: calc(100% - 3.5rem);
  z-index: 9;
}
.content{
  position: absolute;
  top: 2.25rem;
  left: 3.125rem;
  width: calc(100% - 3.125rem);
  height: calc(100% - 3.5rem);
  margin: 0;
  padding: 0;
  z-index: 1;
}
.bottom{
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 1.25rem;
  z-index: 9;
}

/*过渡动画*/
.child-view {
  position: absolute;
  width:100%;
  overflow: hidden;
  transition: all .8s cubic-bezier(.55, 0, .1, 1);
}

/* 离开 */
.slide-fade-leave-to {
  opacity: 0;
  transform: translateX(50px)
}
/* 进入 */
.slide-fade-enter-from {
  opacity: 0;
  transform: translateX(-50px)
}
</style>
