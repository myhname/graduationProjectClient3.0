<script setup>

import { parse, HtmlGenerator } from 'latex.js';
import { ref, computed, watch } from 'vue';

import emitter from '../untils/eventBus'

import html2pdf from 'html2pdf.js'

const props = defineProps({
  latex: {
    type: String,
    required: true
  }
});

const currLaTex = computed(() => {
  return props.latex
})

const latexContainer = ref();

let svgElement

const LaTexRender = () => {
  try {
    let generator = new HtmlGenerator({ hyphenate: false })
    let doc = parse(currLaTex.value, { generator: generator }).htmlDocument()
    svgElement = doc.documentElement.outerHTML
  } catch (error) {
    if(error.message.substr(0,8) === 'Expected'){
      //提示信息·
      emitter.emit('LaTexPreviewSendMsgToBottom', "格式不符，很遗憾我们不支持此类型语法的实时编译")
    }
    console.log(error.message)
  }
}

LaTexRender()

watch(currLaTex, () => {
  //需要用新的实例
  LaTexRender()
})

const options = {
  margin: 1,
  filename: '导出PDF.pdf',
  image: { type: 'jpeg', quality: 0.98 },
  html2canvas: { dpi: 192, letterRendering: true },
  jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
};

const exportPDF = ()=>{
  html2pdf().set(options).from(latexContainer.value).save();
}

defineExpose({
    exportPDF,
})


</script>

<template>
  <div ref="latexContainer" style="text-align: left;">
    <div v-html="svgElement"></div>
  </div>
</template>

<style scoped>
@import url("../../node_modules/latex.js/dist/css/katex.css");
@import url("../../node_modules/latex.js/dist/css/article.css");
@import url("../../node_modules/latex.js/dist/css/base.css");
@import url("../../node_modules/latex.js/dist/css/book.css");
</style>