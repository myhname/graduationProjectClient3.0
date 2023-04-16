import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

const app = createApp(App)
//挂载路由
app.use(router)
//挂载界面
app.mount('#app')
