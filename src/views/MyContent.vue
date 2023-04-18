<template>
    <div class="box">
        <div> this is my content </div>
        <div class="left-editor">
            <MyEditor />
        </div>
    </div>
</template>

<script setup>

import {ref,onMounted} from 'vue'

import emitter from '../untils/eventBus';

//编辑渲染组件
import MyEditor from '@/components/MyEditor.vue';


onMounted(()=>{
    emitter.emit('leftToolsShow',true)
})
</script>