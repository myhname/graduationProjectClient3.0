<template>
    <!-- 背景改成毛玻璃会好一点，虚化看的有点费劲 -->
    <div class="box">
        <!-- 如果想效果更加完善的话，登录注册分成两个单独的组件，使用v-if来操作显示 -->
        <div class="content">
            <div class="login" :class="{ isShow: isShow }">
                <form>
                    <div>
                        <label for="accountValue">账 户：</label>
                        <input ref="account" type="text">
                    </div>
                    <div>
                        <label for="passwordValue">密 码：</label>
                        <!-- 单纯获取内容用v-model="password"更好 -->
                        <input ref="password" type="password">
                        <h5> 若忘记密码请联系管理员 </h5>
                    </div>
                </form>
            </div>
            <div class="register" :class="{ isShow: !isShow }">
                <form>
                    <div><label>用 户 名：</label><input ref="regUserName" type="text"></div>
                    <div><label>账    号： </label><input ref="regAccount" type="text"></div>
                    <div><label>密    码： </label><input ref="regPassword" type="password" @change="onChange"></div>
                    <div><label>确认密码：</label><input ref="confirmPassword" type="password" @change="onChange"></div>
                    <h5> {{ information }} </h5>
                </form>
            </div>
            <div class="btn">
                <button id="loginBtn" @click="getLogin" :class="{ btnColor: !isShow }">登录</button>
                <button id="registerBtn" @click="getRegister" :class="{ btnColor: isShow }">注册</button>
            </div>
        </div>
        <div class="disAccountControl">
            <button type="button" id="deleteBtn" @click="getDelete">注销账户</button>
        </div>
    </div>
</template>

<script setup>

import { ref, watch } from 'vue'

import emitter from "../untils/eventBus"

//引入方法以及路由
import { useRouter } from 'vue-router'

import { login,register,deleteUser } from '../request/user'

const router = useRouter()

//提示信息
const promptingMsg = ref()

//控制显示
const isShow = ref(false)

//绑定DOM元素
const account = ref()
const password = ref()

const regUserName = ref()
const regAccount = ref()
const regPassword = ref()
const confirmPassword = ref()

const information = ref("请输入密码")

const onChange = () => {
    if (regPassword.value.value != confirmPassword.value.value) {
        information.value = "密码不一致!"
    } else {
        information.value = ""
    }
}

//默认自动保存账号密码，没有设置有效时间
const getLogin = () => {
    if (isShow.value === false) {
        console.log("提交登录信息")
        login({
            "UUID": null,
            "name": null,
            "password": password.value.value,
            "account": account.value.value,
        }).then((res) => {
            let curr = res.object.split("|||")
            localStorage.setItem('token', curr[0])
            localStorage.setItem('userUID', curr[1])
            localStorage.setItem('account', account.value.value)
            localStorage.setItem('password', password.value.value)
            promptingMsg.value = "登录成功，开启在线编辑"
            emitter.emit('isOnlineReady', true)
            router.push('/editor')
        })
    } else {
        isShow.value = false
        promptingMsg.value = "请输入登录信息"
    }
}

const getRegister = () => {
    if (isShow.value === true) {
        console.log(("提交注册信息"))
        if (regPassword.value.value != confirmPassword.value.value) {
            window.alert("密码不一致")
            return
        } else {
            register({
                "account": regAccount.value.value,
                "username": regUserName.value.value,
                "password": regPassword.value.value
            }).then((res) => {
                let curr = res.object.split("|||")
                localStorage.setItem('token', curr[0])
                localStorage.setItem('userUID', curr[1])
                localStorage.setItem('account', regAccount.value.value)
                localStorage.setItem('password', regPassword.value.value)
                promptingMsg.value = "注册成功，开启在线编辑"
                emitter.emit('isOnlineReady', true)
                router.push('/editor')
            })
        }
    } else {
        isShow.value = true
        promptingMsg.value = "请输入注册信息"
    }
}

//没写弹窗、验证；注销当前账号，文章删除也没写
const getDelete = () => {
    if (!localStorage.getItem('userUID')) {
        console.assert("未登录无法注销！")
        return
    }
    let uid = localStorage.getItem('userUID')
    deleteUser(uid).then((res) => {
        console.log(res)
        localStorage.removeItem('token')
        localStorage.removeItem('userUID')
        localStorage.removeItem('account')
        localStorage.removeItem('password')
    })
}

watch(promptingMsg, () => {
    emitter.emit('userSendMsgToBottom', promptingMsg.value)
})

</script>

<style scoped>
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

.box {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
    background-position: center top;
    background-repeat: no-repeat;
    background-size: cover;
    background-image: url("../images/backgroundImg/2.jpg");
    opacity: .6;
}

.content {
    position: absolute;
    left: 25%;
    top: 20%;
    width: 50%;
    height: 60%;
    background-color: antiquewhite;
    background-color: rgba(250, 235, 215, 0.3);
    color: black;
    font-size: medium;
    font-weight: bolder;
}

.login {
    position: absolute;
    left: 20%;
    top: 20%;
    width: 60%;
    height: 60%;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
}

.register {
    position: absolute;
    left: 20%;
    top: 20%;
    width: 60%;
    height: 60%;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
}

form {
    border-radius: 10px;
    box-shadow: 0px 0px 0.6rem rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    width: 100%;
}

label{
    font-size: 1rem;
}

input[type="text"],
input[type="password"] {
    width: 70%;
    border: 1px solid #ddd;
    border-radius: 0.3rem;
    font-size: 1rem;
    margin-bottom: 1.3rem;
    padding: 0.6rem;
}

h5 {
    text-align: left;
    color: crimson;
}

.isShow {
    display: none;
}

.btn {
    position: absolute;
    right: 0;
    bottom: 0;
}

.missPassword {
    position: absolute;
    right: 0rem;
    bottom: 3rem;
}

.disAccountControl {
    position: absolute;
    right: 0rem;
    bottom: 0;
}

.btnColor {
    color: rgb(239, 239, 239);
    background-color: rgb(22, 138, 255)
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
</style>