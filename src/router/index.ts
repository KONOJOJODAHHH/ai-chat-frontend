import { createRouter, createWebHistory } from 'vue-router'
import ChatPage from '@/pages/ChatPage.vue'
import LoginPage from '@/pages/LoginPage.vue'
import RegisterPage from '@/pages/RegisterPage.vue'
import { useAuthStore } from '@/composables/useAuthStore'
import AdminLayout from '@/layouts/AdminLayout.vue'
import AdminDashboard from '@/pages/admin/Dashboard.vue'
import AdminModels from '@/pages/admin/Models.vue'
import AdminUsers from '@/pages/admin/Users.vue'
import AdminSessions from '@/pages/admin/Sessions.vue'
import AdminConfig from '@/pages/admin/Config.vue'
import AdminLogs from '@/pages/admin/Logs.vue'
import AdminPrompts from '@/pages/admin/Prompts.vue'

// 定义路由配置
const routes: any = [
  { path: '/', name: 'chat', component: ChatPage, meta: { requiresAuth: true } },
  { path: '/login', name: 'login', component: LoginPage },
  { path: '/register', name: 'register', component: RegisterPage },
  {
    path: '/admin',
    component: AdminLayout,
    meta: { requiresAuth: true, requireAdmin: true },
    redirect: '/admin/dashboard',
    children: [
      { path: 'dashboard', component: AdminDashboard },
      { path: 'models', component: AdminModels },
      { path: 'users', component: AdminUsers },
      { path: 'sessions', component: AdminSessions },
      { path: 'config', component: AdminConfig },
      { path: 'logs', component: AdminLogs },
      { path: 'prompts', component: AdminPrompts },
    ],
  },
]

// 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to) => {
  const auth = useAuthStore()
  
  // 调试日志
  console.log('路由守卫:', {
    path: to.path,
    requiresAuth: to.meta?.requiresAuth,
    requireAdmin: (to.meta as any)?.requireAdmin,
    isAuthenticated: auth.isAuthenticated.value,
    userRole: auth.user.value?.role,
    user: auth.user.value
  })
  
  if (to.meta?.requiresAuth && !auth.isAuthenticated.value) {
    console.log('未登录，跳转到登录页')
    return { path: '/login' }
  }
  if ((to.meta as any)?.requireAdmin && auth.user.value?.role !== 'admin') {
    console.log('非管理员，跳转到首页')
    return { path: '/' }
  }
  return true
})

export default router
