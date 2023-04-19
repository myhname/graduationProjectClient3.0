<template>
    <v-md-preview :text="markdown"></v-md-preview>
</template>

<script setup>

import {computed} from 'vue'

import VMdPreview from '@kangc/v-md-editor/lib/preview';
import '@kangc/v-md-editor/lib/style/preview.css';
import githubTheme from '@kangc/v-md-editor/lib/theme/github.js';
import '@kangc/v-md-editor/lib/theme/style/github.css';

// highlightjs
import hljs from 'highlight.js';

VMdPreview.use(githubTheme, {
  Hljs: hljs,
});

const props = defineProps({
    md: {
        type:String
    }
})

const markdown = computed(()=>{
    return props.md
})


</script>