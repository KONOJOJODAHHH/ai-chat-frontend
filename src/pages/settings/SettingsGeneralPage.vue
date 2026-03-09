<template>
  <section class="settings-page">
    <h2 class="page-title">通用设置</h2>

    <!-- 主题模式 -->
    <div class="settings-section">
      <div class="section-header">
        <h3>外观</h3>
      </div>

      <div class="setting-row">
        <div class="setting-label-wrap">
          <span class="setting-label">主题模式</span>
          <span class="setting-desc">选择界面的明暗风格</span>
        </div>
        <div class="inline-option-group">
          <button
            v-for="option in themeOptions"
            :key="option.value"
            class="opt-btn"
            :class="{ active: theme.themeMode.value === option.value }"
            @click="theme.setThemeMode(option.value)"
          >
            <i :class="option.icon"></i>
            <span>{{ option.label }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 会话 -->
    <div class="settings-section">
      <div class="section-header">
        <h3>会话</h3>
      </div>

      <div class="setting-row">
        <div class="setting-label-wrap">
          <span class="setting-label">列表密度</span>
          <span class="setting-desc">调整左侧会话列表的显示紧凑程度</span>
        </div>
        <div class="inline-option-group">
          <button
            v-for="option in densityOptions"
            :key="option.value"
            class="opt-btn"
            :class="{ active: preferences.conversationDensity === option.value }"
            @click="updatePreference('conversationDensity', option.value)"
          >
            <i :class="option.icon"></i>
            <span>{{ option.label }}</span>
          </button>
        </div>
      </div>

      <div class="setting-row">
        <div class="setting-label-wrap">
          <span class="setting-label">发送快捷键</span>
          <span class="setting-desc">按下该键发送消息</span>
        </div>
        <div class="inline-option-group">
          <button
            v-for="option in shortcutOptions"
            :key="option.value"
            class="opt-btn"
            :class="{ active: preferences.sendShortcut === option.value }"
            @click="updatePreference('sendShortcut', option.value)"
          >
            <i :class="option.icon"></i>
            <span>{{ option.label }}</span>
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTheme } from '@/composables/useTheme'
import { useChatStore, type UserPreferenceState } from '@/composables/useChatStore'

const chat = useChatStore()
const theme = useTheme()
const preferences = computed(() => chat.preferences.value)

const themeOptions = [
  { value: 'system', label: '跟随系统', icon: 'fa-solid fa-desktop' },
  { value: 'dark', label: '深色', icon: 'fa-solid fa-moon' },
  { value: 'light', label: '浅色', icon: 'fa-solid fa-sun' },
] as const

const densityOptions = [
  { value: 'comfortable', label: '舒适', icon: 'fa-solid fa-grip-lines' },
  { value: 'compact', label: '紧凑', icon: 'fa-solid fa-list' },
] as const

const shortcutOptions = [
  { value: 'enter', label: 'Enter 发送', icon: 'fa-solid fa-arrow-turn-down' },
  { value: 'ctrl-enter', label: 'Ctrl + Enter 发送', icon: 'fa-solid fa-keyboard' },
] as const

const updatePreference = <TKey extends keyof UserPreferenceState>(key: TKey, value: UserPreferenceState[TKey]) => {
  chat.setPreferences({ [key]: value })
}
</script>

<style scoped>
.settings-page {
  padding: 28px 32px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-height: 100%;
  box-sizing: border-box;
}

.page-title {
  margin: 0 0 4px;
  font-size: var(--page-title-size);
  font-weight: var(--page-title-weight);
}

.settings-section {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--glass-border);
  border-radius: 20px;
  overflow: hidden;
}

.section-header {
  padding: 18px 24px 0;
}

.section-header h3 {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.setting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 18px 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.setting-row:first-of-type {
  margin-top: 12px;
}

.setting-label-wrap {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.setting-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
}

.setting-desc {
  font-size: 12px;
  color: var(--text-secondary);
}

.inline-option-group {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.opt-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 36px;
  padding: 0 14px;
  border-radius: 10px;
  border: 1px solid var(--glass-border);
  background: rgba(255, 255, 255, 0.04);
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 13px;
  font-family: inherit;
  transition: all 0.18s ease;
  white-space: nowrap;
}

.opt-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  color: var(--text-primary);
}

.opt-btn.active {
  background: rgba(168, 199, 250, 0.12);
  border-color: rgba(168, 199, 250, 0.35);
  color: var(--accent-primary);
}

@media (max-width: 900px) {
  .settings-page { padding: 20px 16px; }
  .setting-row { flex-direction: column; align-items: flex-start; gap: 12px; }
  .inline-option-group { flex-wrap: wrap; }
}
</style>
