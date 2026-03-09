<template>
  <div class="admin-layout">
    <aside class="admin-sidebar">
      <div class="sidebar-header">
        <div class="logo-area">
          <div class="logo-icon-wrapper">
            <i class="fa-solid fa-cube logo-icon"></i>
          </div>
          <span class="logo-text">管理控制台</span>
        </div>
      </div>

      <nav class="sidebar-nav">
        <div class="nav-section-title">概览与管理</div>
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
        <router-link to="/" class="footer-btn primary-btn">
          <i class="fa-solid fa-arrow-left"></i>
          <span>返回应用</span>
        </router-link>
        <router-link to="/settings/general" class="footer-btn secondary-btn">
          <i class="fa-solid fa-gear"></i>
          <span>系统设置</span>
        </router-link>
      </div>
    </aside>

    <main class="admin-content">
      <div class="content-wrapper">
        <router-view />
      </div>
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
  box-sizing: border-box;
  background: var(--bg-color);
  color: var(--text-primary);
  font-family: inherit;
  overflow: hidden;
}

.admin-sidebar {
  width: 240px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  background: var(--glass-bg);
  border-right: 1px solid var(--glass-border);
  z-index: 10;
}

.sidebar-header {
  padding: 24px 20px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo-area {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: var(--text-primary);
  border-radius: 8px;
  color: var(--bg-color);
}

.logo-icon {
  font-size: 16px;
}

.logo-text {
  font-size: 16px;
  font-weight: 600;
  letter-spacing: -0.01em;
  color: var(--text-primary);
}

.sidebar-nav {
  flex: 1;
  padding: 16px 12px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nav-section-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 8px 12px 4px;
  margin-bottom: 4px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: var(--border-radius-base);
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.15s ease;
  cursor: pointer;
  border: 1px solid transparent;
}

.nav-item:hover {
  color: var(--text-primary);
  background: var(--accent-subtle);
}

.nav-item.active {
  color: var(--text-primary);
  background: var(--accent-subtle);
  font-weight: 600;
}

.nav-item i {
  width: 20px;
  font-size: 15px;
  text-align: center;
  opacity: 0.8;
}

.nav-item.active i {
  opacity: 1;
}

.sidebar-footer {
  padding: 16px;
  border-top: 1px solid var(--glass-border);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.footer-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px;
  border-radius: var(--border-radius-base);
  font-size: 13px;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.15s;
  cursor: pointer;
}

.primary-btn {
  background: var(--text-primary);
  color: var(--bg-color);
}

.primary-btn:hover {
  opacity: 0.9;
}

.secondary-btn {
  background: transparent;
  color: var(--text-secondary);
  border: 1px solid var(--glass-border);
}

.secondary-btn:hover {
  background: var(--accent-subtle);
  color: var(--text-primary);
}

.admin-content {
  flex: 1;
  overflow-y: auto;
  position: relative;
  background: var(--bg-color);
}

.content-wrapper {
  max-width: 1440px;
  margin: 0 auto;
  padding: 40px;
}

@media (max-width: 768px) {
  .admin-layout {
    flex-direction: column;
  }
  .admin-sidebar {
    width: 100%;
    height: auto;
    border-right: none;
    border-bottom: 1px solid var(--glass-border);
  }
  .sidebar-nav {
    flex-direction: row;
    overflow-x: auto;
  }
  .nav-section-title, .sidebar-footer {
    display: none;
  }
  .content-wrapper {
    padding: 20px;
  }
}
</style>
