<template>
    <div class="box" :class="{notShow: docDialogShow}">
        <ul>
            <li>
                <span class="hangshu">行数</span>
                <span>内容</span>
                <span class="anniu">删除</span>
            </li>
            <li v-for="item in docList" :key="item.uid">
                <span class="hangshu">{{item.rowNumber}}</span>
                <span>{{item.content}}</span>
                <button @click="deleteCommend(item.uid)">删除</button>
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

const deleteCommend = (value)=>{
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

.hangshu{
    width: 10%;
}
.anniu{
    width: 20%;
}

span {
    box-sizing: border-box;
    width: 70%;
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
    width: 20%;
    text-align: center;
}
button:hover{
    background-color: crimson;
    color: aliceblue;
}
</style>