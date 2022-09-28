import { createApp } from 'vue'
import App from './App.vue'
import '@/assets/styles/common.css'
import '@/assets/styles/animation.css'
import router from './router/index'
const app = createApp(App)
app.use(router)
app.mount('#app')