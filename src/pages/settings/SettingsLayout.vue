<template>
  <div class="settings-shell">
    <aside class="settings-sidebar glass-card">
      <div class="settings-brand">
        <div>
          <p class="eyebrow">SETTINGS CENTER</p>
          <h1>系统设置中心</h1>
        </div>
        <router-link to="/" class="nav-chip primary">
          <i class="fa-solid fa-comments"></i>
          <span>返回聊天</span>
        </router-link>
      </div>

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
            <span class="nav-hint">{{ item.hint }}</span>
          </div>
        </router-link>
      </nav>

      <div class="settings-footer glass-card">
        <div class="footer-copy">
          <span class="footer-title">当前身份</span>
          <strong>{{ auth.user.value?.nickname || auth.user.value?.username || '用户' }}</strong>
        </div>
        <router-link v-if="auth.isAdmin.value" to="/admin/dashboard" class="nav-chip accent">
          <i class="fa-solid fa-shield-halved"></i>
          <span>进入后台</span>
        </router-link>
      </div>
    </aside>

    <main class="settings-main">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/composables/useAuthStore'

const route = useRoute()
const auth = useAuthStore()

const navItems = [
  { path: '/settings/general', label: '通用设置', hint: '主题、界面与默认偏好入口', icon: 'fa-solid fa-sliders' },
  { path: '/settings/account', label: '账号管理', hint: '资料维护与密码安全', icon: 'fa-solid fa-user-gear' },
  { path: '/settings/stats', label: '数据统计', hint: '个人使用概览与后续真实指标入口', icon: 'fa-solid fa-chart-line' },
  { path: '/settings/models', label: '模型服务', hint: '默认模型与服务偏好骨架', icon: 'fa-solid fa-microchip' },
  { path: '/settings/agents', label: '智能体', hint: '官方与个人智能体容器', icon: 'fa-solid fa-sparkles' },
]

const isActive = (path: string) => route.path === path || route.path.startsWith(`${path}/`)
</script>

<style scoped>
.settings-shell {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 320px minmax(0, 1fr);
  gap: 20px;
  padding: 20px;
}

.settings-sidebar {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 24px;
}

.settings-brand {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.eyebrow {
  margin: 0 0 8px;
  font-size: 11px;
  letter-spacing: 0.24em;
  color: var(--text-secondary);
}

.settings-brand h1 {
  margin: 0;
  font-size: 30px;
  line-height: 1.1;
}

.settings-nav {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.nav-item {
  display: flex;
  gap: 14px;
  align-items: flex-start;
  padding: 16px;
  border-radius: 18px;
  text-decoration: none;
  color: var(--text-secondary);
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid transparent;
  transition: all 0.2s ease;
}

.nav-item:hover,
.nav-item.active {
  color: var(--text-primary);
  border-color: rgba(168, 199, 250, 0.22);
  background: rgba(168, 199, 250, 0.08);
  transform: translateY(-1px);
}

.nav-icon-wrap {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  background: rgba(255, 255, 255, 0.06);
}

.nav-copy {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nav-label {
  font-weight: 600;
}

.nav-hint {
  font-size: 12px;
  line-height: 1.5;
}

.settings-footer {
  margin-top: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.footer-copy {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.footer-title {
  font-size: 12px;
  color: var(--text-secondary);
}

.nav-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 42px;
  padding: 0 14px;
  text-decoration: none;
  border-radius: 999px;
  border: 1px solid var(--glass-border);
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.05);
}

.nav-chip.primary {
  background: rgba(168, 199, 250, 0.12);
  border-color: rgba(168, 199, 250, 0.22);
}

.nav-chip.accent {
  background: rgba(234, 179, 8, 0.12);
  border-color: rgba(234, 179, 8, 0.22);
}

.settings-main {
  min-width: 0;
}

@media (max-width: 980px) {
  .settings-shell {
    grid-template-columns: 1fr;
  }
}
</style>
