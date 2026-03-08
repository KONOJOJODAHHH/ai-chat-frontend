<template>
  <section class="settings-page glass-card">
    <header class="page-header">
      <div>
        <h2>通用设置</h2>
        <p>调整主题风格、界面布局与快捷键偏好，所有改动将立即生效。</p>
      </div>
    </header>

    <div class="section-grid">
      <article class="settings-card">
        <div class="section-title">
          <h3>主题模式</h3>
          <span>即时生效</span>
        </div>
        <div class="option-group three-col">
          <button
            v-for="option in themeOptions"
            :key="option.value"
            class="option-btn"
            :class="{ active: theme.themeMode.value === option.value }"
            @click="theme.setThemeMode(option.value)"
          >
            <i :class="option.icon"></i>
            <span>{{ option.label }}</span>
          </button>
        </div>
      </article>

      <article class="settings-card">
        <div class="section-title">
          <h3>会话列表密度</h3>
          <span>已保存</span>
        </div>
        <div class="option-group">
          <button
            v-for="option in densityOptions"
            :key="option.value"
            class="option-btn"
            :class="{ active: preferences.conversationDensity === option.value }"
            @click="updatePreference('conversationDensity', option.value)"
          >
            <i :class="option.icon"></i>
            <span>{{ option.label }}</span>
          </button>
        </div>
      </article>

      <article class="settings-card full-width">
        <div class="section-title">
          <h3>发送快捷键</h3>
          <span>将作用于后续统一输入体验</span>
        </div>
        <div class="option-group">
          <button
            v-for="option in shortcutOptions"
            :key="option.value"
            class="option-btn"
            :class="{ active: preferences.sendShortcut === option.value }"
            @click="updatePreference('sendShortcut', option.value)"
          >
            <i :class="option.icon"></i>
            <span>{{ option.label }}</span>
          </button>
        </div>
      </article>
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
  chat.setPreferences({
    [key]: value,
  })
}
</script>

<style scoped>
.settings-page { min-height: 100%; box-sizing: border-box; padding: 20px; }
.page-header { margin-bottom: 28px; }
h2 { margin: 0 0 12px; font-size: 26px; font-weight: 700; }
.page-header p { margin: 0; color: var(--text-secondary); line-height: 1.7; }
.section-grid { display: grid; grid-template-columns: 1fr; gap: 16px; }
.settings-card { padding: 24px; border-radius: 20px; background: rgba(255,255,255,0.04); border: 1px solid var(--glass-border); display: flex; flex-direction: column; gap: 18px; }
.settings-card.full-width { grid-column: 1 / -1; }
.section-title { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.section-title h3 { margin: 0; font-size: 18px; }
.section-title span { color: var(--text-secondary); font-size: 12px; }
.option-group { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
.option-group.three-col { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.option-btn { min-height: 56px; border-radius: 16px; border: 1px solid var(--glass-border); background: rgba(255,255,255,0.03); color: var(--text-primary); display: inline-flex; align-items: center; justify-content: center; gap: 10px; cursor: pointer; transition: all 0.2s ease; }
.option-btn.active { background: rgba(168, 199, 250, 0.12); border-color: rgba(168, 199, 250, 0.28); color: var(--accent-primary); }
.option-btn:hover { transform: translateY(-1px); }
@media (max-width: 900px) { .section-grid, .option-group, .option-group.three-col { grid-template-columns: 1fr; } }
</style>
