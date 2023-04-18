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

//引入固定位置的视图
import MyHeader from "./views/MyHeader.vue";
import MyLeft from './views/MyLeft.vue';
import MyBottom from './views/MyBottom.vue'

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
