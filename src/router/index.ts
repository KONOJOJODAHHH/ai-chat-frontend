import { createRouter, createWebHistory } from 'vue-router'
import ChatPage from '@/pages/ChatPage.vue'
import LoginPage from '@/pages/LoginPage.vue'
import RegisterPage from '@/pages/RegisterPage.vue'
import { useAuthStore } from '@/composables/useAuthStore'
import AdminLayout from '@/layouts/AdminLayout.vue'
import AdminDashboard from '@/pages/admin/Dashboard.vue'
import AdminModels from '@/pages/admin/Models.vue'
import AdminUsers from '@/pages/admin/Users.vue'
import AdminConfig from '@/pages/admin/Config.vue'
import AdminLogs from '@/pages/admin/Logs.vue'
import AdminPrompts from '@/pages/admin/Prompts.vue'
import SettingsLayout from '@/pages/settings/SettingsLayout.vue'
import SettingsLandingPage from '@/pages/settings/SettingsLandingPage.vue'
import SettingsGeneralPage from '@/pages/settings/SettingsGeneralPage.vue'
import SettingsAccountPage from '@/pages/settings/SettingsAccountPage.vue'
import SettingsStatsPage from '@/pages/settings/SettingsStatsPage.vue'
import SettingsModelsPage from '@/pages/settings/SettingsModelsPage.vue'
import SettingsAgentsPage from '@/pages/settings/SettingsAgentsPage.vue'

// 定义路由配置
const routes: any = [
  { path: '/', name: 'chat', component: ChatPage, meta: { requiresAuth: true } },
  { path: '/login', name: 'login', component: LoginPage },
  { path: '/register', name: 'register', component: RegisterPage },
  {
    path: '/settings',
    component: SettingsLayout,
    meta: { requiresAuth: true },
    redirect: '/settings/general',
    children: [
      { path: '', redirect: '/settings/general' },
      { path: 'general', name: 'settings-general', component: SettingsGeneralPage },
      { path: 'account', name: 'settings-account', component: SettingsAccountPage },
      { path: 'stats', name: 'settings-stats', component: SettingsStatsPage },
      { path: 'models', name: 'settings-models', component: SettingsModelsPage },
      { path: 'agents', name: 'settings-agents', component: SettingsAgentsPage },
      { path: ':pathMatch(.*)*', name: 'settings-landing', component: SettingsLandingPage },
    ],
  },
  {
    path: '/admin',
    component: AdminLayout,
    meta: { requiresAuth: true, requireAdmin: true },
    redirect: '/admin/dashboard',
    children: [
      { path: 'dashboard', component: AdminDashboard },
      { path: 'models', component: AdminModels },
      { path: 'users', component: AdminUsers },
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

  if ((to.path === '/login' || to.path === '/register') && auth.isAuthenticated.value) {
    return { path: '/' }
  }

  if (to.meta?.requiresAuth && !auth.isAuthenticated.value) {
    return { path: '/login' }
  }
  if ((to.meta as any)?.requireAdmin && !auth.isAdmin.value) {
    return { path: '/' }
  }
  return true
})

export default router
