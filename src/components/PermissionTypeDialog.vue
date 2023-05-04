<template>
    <div class="box" :class="{ notShow: dialogShow }">
        <div class="content">
            <form>
                <div>
                    <label for="document">文件：</label>
                    <input ref="docUID" type="text" name="docuid" />
                </div>
                <div>
                    <label for="user">用户：</label>
                    <input ref="userUID" type="text" name="uuid" />
                </div>
                <div>
                    <label for="permissionType">权限类型：</label>
                    <select ref="permissionType">
                        <option value="RO">只读</option>
                        <option value="RW">读写</option>
                        <option value="delete">撤销</option>
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
import { ref, defineProps, computed, watch} from 'vue'

const props = defineProps({
    show: {
        type: Boolean
    }
})

const isShow = computed(() => {
    return props.show
})

const dialogShow = ref(true)
const docUID = ref()
const userUID = ref()
const permissionType = ref()
let permission = {
    docUID:null,
    userUID:null,
    permissionType:null
}

watch(isShow, () => {
    dialogShow.value = isShow.value
})

const emit = defineEmits(["showChange", "newPerssion"])

const closeDialog = () => {
    dialogShow.value = true
    emit("showChange", dialogShow.value)
}

const newDialog = () => {
    if (!docUID.value.value || !userUID.value.value) {
        //弹窗
        console.log("值不能为空")
    } else {
        permission.docUID = docUID.value.value
        permission.userUID = userUID.value.value
        permission.permissionType = permissionType.value.value
        emit("newPermission", permission)
        docUID.value.value = null
        userUID.value.value = null
        permissionType.value.value = "RO"
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