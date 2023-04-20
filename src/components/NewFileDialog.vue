<template>
    <div class="box" :class="{ notShow: dialogShow }">
        <div class="content">
            <form>
                <div>
                    <label for="fileName">文件名称：</label>
                    <input ref="fileName" type="text" name="fname" />
                </div>
                <div>
                    <label for="flieFormat">文件格式：</label>
                    <select ref="fileFormat">
                        <option value="md">.md</option>
                        <option value="latex">.latex</option>
                        <option value="txt">.txt</option>
                    </select>
                </div>
            </form>
        </div>
        <div class="bottom">
            <button id="canel" @click="closeDialog">取消</button>
            <button id="confirm" @click="newDialog">确认</button>
        </div>
    </div>
</template>
  
<script setup>
import MyIcons from './MyIcons.vue';

import { ref, defineProps, computed, watch, reactive } from 'vue'

const props = defineProps({
    show: {
        type: Boolean
    }
})

const isShow = computed(() => {
    return props.show
})

const dialogShow = ref(false)
const fileName = ref()
const fileFormat = ref()
const file = ref()

watch(isShow, () => {
    dialogShow.value = isShow.value
})

const emit = defineEmits(["showChange", "newFileName"])

const closeDialog = () => {
    dialogShow.value = true
    emit("showChange", dialogShow.value)
}

const newDialog = () => {
    if (!fileName.value.value) {
        //弹窗
        console.log("文件名不能为空")
    } else {
        file.value = fileName.value.value + "." + fileFormat.value.value
        emit("newFileName", file.value)
        fileName.value.value = ""
        fileFormat.value.value = "md"
        dialogShow.value = true
        emit("showChange", dialogShow.value)
    }
}

</script>
  
<style scoped>
.notShow {
    display: none;
}

.box {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    position: relative;
    left: 0;
    width: 100%;
    height: 100%;
}

.content {
    box-sizing: border-box;
    position: relative;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    padding-bottom: 3rem;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
}

form {
    display: flex;
    flex-direction: column;
    width: 100%;
}

label{
    font-size: 1rem;
    color: black;
    font-weight: bolder;
}

input[type="text"],
select {
    border: 1px solid #ddd;
    border-radius: 0.3rem;
    font-size: 1rem;
    margin-bottom: 1.3rem;
    padding: 0.6rem;
}

input[type="text"] {
    width: 20%;
}

select {
    width: 25%;
}

h5 {
    text-align: left;
    color: crimson;
}

.bottom {
    position: absolute;
    left: 60%;
    bottom: 0.2rem;
    height: 2.6rem;
}

button {
    margin-bottom: 0.5rem;
    margin-right: 1rem;
    width: 5rem;
    height: 2.5rem;
    color: black;
    font-size: medium;
    font-weight: bolder;
    border: 0.1rem solid;
    border-color: aliceblue;
    border-radius: 0.5rem;
    opacity: 0.7;
}

button:hover {
    opacity: 0.9;
    border-color: rgb(218, 99, 99);
    background-color: black;
    color: aliceblue;
}

#canel {
    color: rgb(239, 239, 239);
    background-color: rgb(133, 133, 133);
}

#confirm {
    color: rgb(239, 239, 239);
    background-color: rgb(22, 138, 255)
}
</style>