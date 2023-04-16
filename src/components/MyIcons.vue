<script setup>
//使用阿里字库

import '../images/iconImg/iconfont'
import { defineProps, computed } from "vue";

const props = defineProps({
    icon: {
        type: String,
        required: true
    },
    Style: {
        type: String
    }
})
const iconName = computed(() => {
    return `#icon-${props.icon}`
})
const size = computed(() => {
    return `${props.Style}`
})
</script>
  
<template>
    <svg class="svg-icon" aria-hidden="true" :style="size">
        <use :xlink:href="iconName"></use>
    </svg>
</template>
  
<style scoped>
.svg-icon {
    width: 1em;
    height: 1em;
    fill: currentColor;
    overflow: hidden;
}
</style>