<template>
    <div class="box" :class="{notShow: docDialogShow}">
        <ul>
            <li>
                <span>名称</span>
                <span>权限</span>
                <span>作者</span>
                <span>打开</span>
            </li>
            <li v-for="item in docList" :key="item.docUID">
                <span>{{item.title}}.{{ item.format }}</span>
                <span>{{item.permissionType}}</span>
                <span>{{ item.username }}</span>
                <button @click="openDoc(item.docUID)">打开</button>
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

const openDoc = (value)=>{
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
    width: 25%;
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
    width: 25%;
    text-align: center;
}
button:hover{
    background-color: crimson;
    color: aliceblue;
}
</style>