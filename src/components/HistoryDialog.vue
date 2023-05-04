<template>
    <div class="box" :class="{notShow: docDialogShow}">
        <ul>
            <li>
                <span>时间</span>
                <span>回退</span>
            </li>
            <li v-for="item in docList" :key="item.uid">
                <span>{{ item.time }}</span>
                <button @click="getBack(item.uid)">回退</button>
            </li>
        </ul>
    </div>
</template>

<script setup>
import {ref,watch,computed} from 'vue'

const props = defineProps({
    docShow: {
        type: Boolean
    },
    contentList: {
        type: Array
    }
})

const isShow = computed(() => {
    return props.docShow
})
const docList = computed(()=>{
    return props.contentList
})

const docDialogShow = ref(true)

watch(isShow, () => {
    docDialogShow.value = isShow.value
})

const emit = defineEmits(["getWhich","showChange"])

const getBack = (value)=>{
    emit("getWhich",value)
    docDialogShow.value = true
    emit("showChange", docDialogShow.value)
}
</script>

<style scoped>
.notShow {
    display: none;
}

.box{
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    position: relative;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: auto;
}

ul{
    width: 100%;
    height: 100%;
    overflow-x: hidden;
    overflow-y: auto;
}

li {
    box-sizing:border-box;
    display: flex;
    flex-direction:row;
    width: 100%;
    background-color: aliceblue;
}

span {
    box-sizing: border-box;
    width: 50%;
    text-align: center;
    color:black;
    font-size: larger;
    font-weight: bolder;
    border-color: black;
    border-width: 0.1rem;
    border-style:solid;
}

button{
    box-sizing: border-box;
    width: 50%;
    text-align: center;
}
button:hover{
    background-color: crimson;
    color: aliceblue;
}
</style>