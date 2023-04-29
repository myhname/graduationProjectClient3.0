<template>
    <div ref="mdContainer">
        <v-md-preview :text="markdown"></v-md-preview>
    </div>
</template>

<script setup>

import {computed,ref} from 'vue'

import VMdPreview from '@kangc/v-md-editor/lib/preview';
import '@kangc/v-md-editor/lib/style/preview.css';
import githubTheme from '@kangc/v-md-editor/lib/theme/github.js';
import '@kangc/v-md-editor/lib/theme/style/github.css';

// highlightjs
import hljs from 'highlight.js';

import html2pdf from 'html2pdf.js';

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

const mdContainer = ref()
const options = {
  margin: 1,
  filename: '导出PDF.pdf',
  image: { type: 'jpeg', quality: 0.98 },
  html2canvas: { dpi: 192, letterRendering: true },
  jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
};

const exportPDF = ()=>{
  html2pdf().set(options).from(mdContainer.value).save();
}

defineExpose({
    exportPDF,
})

</script>