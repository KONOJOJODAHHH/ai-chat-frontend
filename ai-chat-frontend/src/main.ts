import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { useAuthStore } from './composables/useAuthStore'
import { authAPI } from './utils/api'

// 创建Vue应用实例
const app = createApp(App)

// 注册Element Plus图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 使用路由和Element Plus
app.use(router)
app.use(ElementPlus)

const auth = useAuthStore()

// 初始化认证状态后再挂载应用
auth.init(async () => await authAPI.profile()).then(() => {
  // 挂载应用
  app.mount('#app')
})
