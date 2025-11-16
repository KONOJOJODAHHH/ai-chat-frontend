<template>
  <div class="admin-layout">
    <aside class="admin-sidebar glass-card">
      <div class="sidebar-header">
        <div class="logo-area">
          <i class="fa-solid fa-cube logo-icon"></i>
          <span class="logo-text">MATRIX OS</span>
        </div>
        <div class="admin-badge">
          <i class="fa-solid fa-shield-halved"></i>
          <span>管理后台</span>
        </div>
      </div>
      
      <nav class="sidebar-nav">
        <router-link
          v-for="item in menuItems"
          :key="item.path"
          :to="item.path"
          class="nav-item"
          :class="{ active: isActive(item.path) }"
        >
          <i :class="item.icon"></i>
          <span>{{ item.label }}</span>
        </router-link>
      </nav>

      <div class="sidebar-footer">
        <router-link to="/" class="back-btn">
          <i class="fa-solid fa-arrow-left"></i>
          <span>返回前台</span>
        </router-link>
      </div>
    </aside>
    
    <main class="admin-content">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const active = computed(() => route.path)

const menuItems = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: 'fa-solid fa-chart-line' },
  { path: '/admin/models', label: '模型管理', icon: 'fa-solid fa-microchip' },
  { path: '/admin/users', label: '用户管理', icon: 'fa-solid fa-users' },
  { path: '/admin/sessions', label: '会话管理', icon: 'fa-solid fa-comments' },
  { path: '/admin/config', label: '系统配置', icon: 'fa-solid fa-gear' },
  { path: '/admin/logs', label: '日志与统计', icon: 'fa-solid fa-chart-pie' },
  { path: '/admin/prompts', label: 'Prompt管理', icon: 'fa-solid fa-wand-magic-sparkles' },
]

const isActive = (path: string) => route.path === path || route.path.startsWith(path + '/')
</script>

<style scoped>
.admin-layout {
  display: flex;
  height: 100vh;
  background: var(--bg-color);
  position: relative;
}

.admin-sidebar {
  width: 260px;
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--glass-border);
  backdrop-filter: blur(20px);
  margin: 12px;
  margin-right: 0;
  border-radius: 16px 0 0 16px;
  overflow: hidden;
}

.sidebar-header {
  padding: 24px 20px;
  border-bottom: 1px solid var(--glass-border);
}

.logo-area {
  display: flex;
  align-items: center;
  gap: 12px;
  font-family: 'Orbitron', sans-serif;
  font-size: 20px;
  font-weight: 700;
  letter-spacing: 0.5px;
  margin-bottom: 16px;
}

.logo-icon {
  color: var(--accent-primary);
  font-size: 24px;
}

.logo-text {
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-hover));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.admin-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: rgba(168, 199, 250, 0.1);
  border: 1px solid rgba(168, 199, 250, 0.2);
  border-radius: 8px;
  font-size: 12px;
  color: var(--accent-primary);
  font-weight: 500;
}

.sidebar-nav {
  flex: 1;
  padding: 12px;
  overflow-y: auto;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  margin-bottom: 4px;
  border-radius: 10px;
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s var(--ease-out);
  cursor: pointer;
}

.nav-item i {
  width: 20px;
  font-size: 16px;
  text-align: center;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-primary);
}

.nav-item.active {
  background: var(--accent-subtle);
  color: var(--accent-primary);
  box-shadow: 0 0 20px rgba(168, 199, 250, 0.1);
}

.sidebar-footer {
  padding: 16px;
  border-top: 1px solid var(--glass-border);
}

.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--glass-border);
  border-radius: 10px;
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s var(--ease-out);
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  color: var(--accent-primary);
  border-color: var(--accent-primary);
}

.admin-content {
  flex: 1;
  overflow: auto;
  padding: 24px;
  margin: 12px 12px 12px 0;
}

/* 滚动条样式 */
.sidebar-nav::-webkit-scrollbar {
  width: 4px;
}

.sidebar-nav::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar-nav::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

.sidebar-nav::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}
</style>