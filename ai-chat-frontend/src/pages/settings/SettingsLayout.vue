<template>
  <div class="settings-shell">
    <aside class="settings-sidebar glass-card">
      <div class="settings-brand">
        <i class="fa-solid fa-gear brand-icon"></i>
        <span>设置中心</span>
      </div>

      <router-link to="/" class="back-btn">
        <i class="fa-solid fa-arrow-left"></i>
        <span>返回聊天</span>
      </router-link>

      <nav class="settings-nav">
        <router-link
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="nav-item"
          :class="{ active: isActive(item.path) }"
        >
          <div class="nav-icon-wrap">
            <i :class="item.icon"></i>
          </div>
          <div class="nav-copy">
            <span class="nav-label">{{ item.label }}</span>
          </div>
        </router-link>
      </nav>

      <div class="user-bar" @click="toggleUserMenu">
        <div class="user-avatar">
          {{ username.charAt(0).toUpperCase() }}
        </div>
        <span class="user-name">{{ username }}</span>
        <i class="fa-solid fa-chevron-down" style="font-size: 12px; margin-left: auto; color: var(--text-muted);"></i>
      </div>

      <div class="user-dropdown-menu" v-show="showUserMenu">
        <div class="user-menu-item" @click.stop="goToChat">
          <i class="fa-solid fa-comments"></i>
          <span>返回聊天</span>
        </div>
        <div v-if="auth.isAdmin.value" class="user-menu-item" @click.stop="goToAdmin">
          <i class="fa-solid fa-shield-halved"></i>
          <span>管理后台</span>
        </div>
        <div class="user-menu-divider"></div>
        <div class="user-menu-item danger" @click.stop="handleLogout">
          <i class="fa-solid fa-right-from-bracket"></i>
          <span>退出登录</span>
        </div>
      </div>
    </aside>

    <main class="settings-main">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useAuthStore } from '@/composables/useAuthStore'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const showUserMenu = ref(false)
const username = computed(() => auth.user.value?.nickname || auth.user.value?.username || '用户')

const toggleUserMenu = () => { showUserMenu.value = !showUserMenu.value }
const goToChat = () => { showUserMenu.value = false; router.push('/') }
const goToAdmin = () => { showUserMenu.value = false; router.push('/admin/dashboard') }
const handleLogout = () => {
  showUserMenu.value = false
  ElMessageBox.confirm('确定要退出登录吗？', '退出确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    auth.logout()
    ElMessage.success('已注销')
    router.replace('/login')
  }).catch(() => {})
}
const handleOutsideClick = (e: MouseEvent) => {
  const target = e.target as HTMLElement
  if (!target.closest('.user-bar') && !target.closest('.user-dropdown-menu')) {
    showUserMenu.value = false
  }
}
onMounted(() => document.addEventListener('click', handleOutsideClick))
onUnmounted(() => document.removeEventListener('click', handleOutsideClick))

const navItems = [
  { path: '/settings/general', label: '通用设置', icon: 'fa-solid fa-sliders' },
  { path: '/settings/account', label: '账号管理', icon: 'fa-solid fa-user-gear' },
  { path: '/settings/stats', label: '数据统计', icon: 'fa-solid fa-chart-line' },
  { path: '/settings/models', label: '模型服务', icon: 'fa-solid fa-microchip' },
  { path: '/settings/agents', label: '智能体', icon: 'fa-solid fa-robot' },
]

const isActive = (path: string) => route.path === path || route.path.startsWith(`${path}/`)
</script>

<style scoped>
.settings-shell {
  height: 100vh;
  width: 100vw;
  box-sizing: border-box;
  display: flex;
  gap: var(--app-shell-gap);
  padding: var(--app-shell-padding);
  overflow: hidden;
}

.settings-sidebar {
  width: var(--app-sidebar-width);
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 0;
  padding: 20px;
  height: 100%;
  box-sizing: border-box;
  overflow-y: auto;
}

.settings-sidebar::-webkit-scrollbar {
  display: none;
}
.settings-sidebar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.settings-brand {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 0.5px;
  color: var(--text-primary);
  margin-bottom: 30px;
}

.brand-icon {
  color: var(--accent-primary);
  font-size: 20px;
}

.back-btn {
  width: 100%;
  padding: 14px;
  background: rgba(168, 199, 250, 0.08);
  border: 1px solid rgba(168, 199, 250, 0.15);
  color: var(--text-primary);
  border-radius: 12px;
  text-decoration: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 25px;
  box-sizing: border-box;
  transition: all 0.2s;
}

.back-btn:hover {
  background: rgba(168, 199, 250, 0.12);
  border-color: rgba(168, 199, 250, 0.25);
}

.back-btn i {
  color: var(--accent-primary);
  font-size: 16px;
}

.settings-nav {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}

.nav-item {
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 12px;
  border-radius: 10px;
  text-decoration: none;
  color: var(--text-secondary);
  background: transparent;
  border: none;
  transition: background 0.2s, color 0.2s;
  margin-bottom: 2px;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-primary);
}

.nav-item.active {
  background: rgba(255, 255, 255, 0.08);
  color: var(--text-primary);
  font-weight: 500;
}

.nav-icon-wrap {
  width: 20px;
  display: grid;
  place-items: center;
  font-size: 16px;
  flex-shrink: 0;
}

.nav-copy {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.nav-label {
  font-size: 14px;
  font-weight: 400;
}

.user-bar {
  margin-top: auto;
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  border-radius: 10px;
  transition: all 0.2s;
  background: rgba(255,255,255,0.03);
  border: 1px solid var(--glass-border);
  position: relative;
}

.user-bar:hover {
  background: rgba(255,255,255,0.06);
}

.user-avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: linear-gradient(135deg, #404040, #707070);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 14px;
  color: white;
  flex-shrink: 0;
}

.user-name {
  flex: 1;
  font-size: 14px;
  color: var(--text-primary);
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-dropdown-menu {
  position: absolute;
  bottom: 70px;
  left: 20px;
  right: 20px;
  background: rgba(24, 24, 27, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  padding: 8px;
  box-shadow: 0 -10px 30px rgba(0,0,0,0.5);
  z-index: 200;
}

.user-menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
  color: var(--text-primary);
}

.user-menu-item:hover {
  background: rgba(255,255,255,0.08);
}

.user-menu-item.danger {
  color: #ef4444;
}

.user-menu-item i {
  width: 16px;
  text-align: center;
}

.user-menu-divider {
  height: 1px;
  background: var(--glass-border);
  margin: 6px 0;
}

.settings-main {
  flex: 1;
  min-width: 0;
  height: 100%;
  box-sizing: border-box;
  overflow-y: auto;
  padding-right: 4px;
}

/* Elegant scrollbar for main panel */
.settings-main::-webkit-scrollbar {
  width: 6px;
}
.settings-main::-webkit-scrollbar-track {
  background: transparent;
}
.settings-main::-webkit-scrollbar-thumb {
  background: var(--glass-border);
  border-radius: 10px;
}
.settings-main::-webkit-scrollbar-thumb:hover {
  background: rgba(168, 199, 250, 0.2);
}

@media (max-width: 980px) {
  .settings-shell {
    flex-direction: column;
    height: auto;
    overflow: visible;
    padding: 12px;
  }
  .settings-sidebar {
    width: 100%;
  }
  .settings-sidebar, .settings-main {
    height: auto;
    overflow: visible;
  }
}
</style>
