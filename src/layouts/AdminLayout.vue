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
        <div class="switch-stack">
          <router-link to="/" class="back-btn primary">
            <i class="fa-solid fa-comments"></i>
            <span>返回聊天</span>
          </router-link>
          <router-link to="/settings/general" class="back-btn">
            <i class="fa-solid fa-sliders"></i>
            <span>设置中心</span>
          </router-link>
        </div>
      </div>
    </aside>

    <main class="admin-content">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()

const menuItems = [
  { path: '/admin/dashboard', label: '仪表盘', icon: 'fa-solid fa-chart-line' },
  { path: '/admin/users', label: '用户管理', icon: 'fa-solid fa-users' },
  { path: '/admin/models', label: '模型管理', icon: 'fa-solid fa-microchip' },
  { path: '/admin/prompts', label: '官方预设', icon: 'fa-solid fa-wand-magic-sparkles' },
  { path: '/admin/config', label: '系统配置', icon: 'fa-solid fa-gear' },
  { path: '/admin/logs', label: '调用日志', icon: 'fa-solid fa-chart-pie' },
]

const isActive = (path: string) => route.path === path || route.path.startsWith(`${path}/`)
</script>

<style scoped>
.admin-layout {
  display: flex;
  height: 100vh;
  width: 100vw;
  box-sizing: border-box;
  padding: var(--app-shell-padding);
  gap: var(--app-shell-gap);
  background: var(--bg-color);
  position: relative;
}

.admin-sidebar {
  width: var(--app-sidebar-width);
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
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

.switch-stack {
  display: flex;
  flex-direction: column;
  gap: 10px;
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

.back-btn.primary {
  background: rgba(168, 199, 250, 0.12);
  border-color: rgba(168, 199, 250, 0.24);
  color: var(--text-primary);
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  color: var(--accent-primary);
  border-color: var(--accent-primary);
}

.admin-content {
  flex: 1;
  overflow: auto;
  padding: 0;
  padding-right: 8px;
  box-sizing: border-box;
}

.admin-content::-webkit-scrollbar {
  width: 6px;
}

.admin-content::-webkit-scrollbar-track {
  background: transparent;
}

.admin-content::-webkit-scrollbar-thumb {
  background: var(--glass-border);
  border-radius: 10px;
}

.admin-content::-webkit-scrollbar-thumb:hover {
  background: rgba(168, 199, 250, 0.2);
}

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
