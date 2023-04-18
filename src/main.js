import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import axios from 'axios'

const app = createApp(App)

axios.defaults.baseURL = '/api'

//挂载路由
app.use(router)
//挂载界面
app.mount('#app')
