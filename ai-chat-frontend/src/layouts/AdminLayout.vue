<template>
  <div class="admin-layout">
    <aside class="admin-sidebar glass-card">
      <div class="sidebar-head">
        <i class="fa-solid fa-shield-halved brand-icon"></i>
        <span class="brand-label">管理后台</span>
      </div>

      <nav class="sidebar-nav">
        <router-link
          v-for="item in menuItems"
          :key="item.path"
          :to="item.path"
          class="nav-link"
          :class="{ active: isActive(item.path) }"
        >
          <i :class="item.icon"></i>
          <span>{{ item.label }}</span>
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
          <span>聊天界面</span>
        </div>
        <div class="user-menu-item" @click.stop="goToSettings">
          <i class="fa-solid fa-gear"></i>
          <span>设置中心</span>
        </div>
        <div class="user-menu-divider"></div>
        <div class="user-menu-item danger" @click.stop="handleLogout">
          <i class="fa-solid fa-right-from-bracket"></i>
          <span>退出登录</span>
        </div>
      </div>
    </aside>

    <main class="admin-body">
      <div class="body-inner">
        <router-view />
      </div>
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
const goToSettings = () => { showUserMenu.value = false; router.push('/settings/general') }
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

const menuItems = [
  { path: '/admin/dashboard', label: '仪表盘', icon: 'fa-solid fa-chart-line' },
  { path: '/admin/users', label: '用户管理', icon: 'fa-solid fa-users' },
  { path: '/admin/models', label: '模型管理', icon: 'fa-solid fa-microchip' },
  { path: '/admin/prompts', label: '快捷短语', icon: 'fa-solid fa-wand-magic-sparkles' },
  { path: '/admin/config', label: '系统配置', icon: 'fa-solid fa-sliders' },
  { path: '/admin/logs', label: '日志审计', icon: 'fa-solid fa-list-check' },
]

const isActive = (path: string) => route.path === path || route.path.startsWith(`${path}/`)
</script>

<style scoped>
.admin-layout {
  display: flex;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  background: var(--bg-color);
  color: var(--text-primary);
  gap: var(--app-shell-gap);
  padding: var(--app-shell-padding);
  box-sizing: border-box;
}

/* ── Sidebar ── */
.admin-sidebar {
  width: var(--app-sidebar-width);
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  padding: 20px;
  height: 100%;
  box-sizing: border-box;
  overflow-y: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.admin-sidebar::-webkit-scrollbar {
  display: none;
}

.sidebar-head {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 0.5px;
  color: var(--text-primary);
  margin-bottom: 25px;
}

.brand-icon {
  color: var(--accent-primary);
  font-size: 20px;
}

.brand-label {
  font-size: 18px;
  font-weight: 700;
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

.back-btn {
  display: none;
}

/* Nav */
.sidebar-nav {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow-y: auto;
}

.nav-section-label {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.13em;
  text-transform: uppercase;
  color: var(--text-muted);
  padding: 0 4px 10px;
  margin: 0;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 400;
  color: var(--text-secondary);
  text-decoration: none;
  background: transparent;
  transition: color 0.2s, background 0.2s;
  margin-bottom: 2px;
}

.nav-link:hover {
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.05);
}

.nav-link.active {
  color: var(--text-primary);
  font-weight: 500;
  background: rgba(255, 255, 255, 0.08);
}

.nav-link i {
  width: 20px;
  font-size: 14px;
  text-align: center;
  color: inherit;
  flex-shrink: 0;
}

.user-bar {
  margin-top: 20px;
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

/* ── Main body ── */
.admin-body {
  flex: 1;
  overflow: hidden;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.02), rgba(255, 255, 255, 0.01));
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 18px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
  display: flex;
  flex-direction: column;
}

.body-inner {
  flex: 1;
  overflow-y: auto;
  padding: 40px 44px;
  box-sizing: border-box;
  height: 100%;
}

/* ── Responsive ── */
@media (max-width: 768px) {
  .admin-layout {
    flex-direction: column;
    padding: 12px;
  }

  .admin-sidebar {
    width: 100%;
    height: auto;
  }

  .sidebar-nav {
    flex-direction: row;
    flex-wrap: wrap;
    gap: 4px;
  }

  .nav-link {
    flex: 1;
    min-width: 80px;
    justify-content: center;
    padding: 10px 8px;
  }

  .nav-link span {
    display: none;
  }

  .body-inner {
    padding: 24px 16px;
  }
}
</style>
