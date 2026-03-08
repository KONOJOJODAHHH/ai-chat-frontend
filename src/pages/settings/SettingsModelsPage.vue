<template>
  <section class="settings-page glass-card">
    <header class="page-header">
      <div>
        <p class="eyebrow">MODEL SERVICE</p>
        <h2>模型服务</h2>
        <p>这里只提供真实有效的默认模型与默认 temperature 偏好，不再出现 API Key、baseUrl 这类用户侧假配置。</p>
      </div>
    </header>

    <div class="settings-grid">
      <article class="runtime-panel">
        <div class="panel-header">
          <h3>默认运行时偏好</h3>
          <span>保存后用于新会话默认值</span>
        </div>

        <div class="form-group">
          <label>默认模型</label>
          <select class="form-select" v-model="draft.modelId">
            <option value="">请选择模型</option>
            <option v-for="model in chat.models.value" :key="model.id" :value="model.id">
              {{ model.name }}（{{ model.provider }}）
            </option>
          </select>
        </div>

        <button class="primary-btn" @click="saveDefaults">
          <i class="fa-solid fa-check"></i>
          <span>保存默认偏好</span>
        </button>
      </article>

      <article class="runtime-panel">
        <div class="panel-header">
          <h3>当前配置解析</h3>
          <span>统一配置容器</span>
        </div>

        <div class="runtime-row">
          <span>当前有效模型</span>
          <strong>{{ resolvedModelName }}</strong>
        </div>
        <div class="runtime-row">
          <span>当前 Temperature</span>
          <strong>模块 C 接入后生效</strong>
        </div>
        <div class="runtime-row">
          <span>配置层级</span>
          <strong>system → user → agent → conversation</strong>
        </div>

        <p class="runtime-note">当前默认模型会立即作用于新会话；temperature 已在统一运行时容器中预留，但在聊天链路真实消费前保持只读说明，避免形成假配置。</p>
      </article>
    </div>

    <div class="model-list">
      <article v-for="model in chat.models.value" :key="model.id" class="model-card">
        <div>
          <h3>{{ model.name }}</h3>
          <p>{{ model.provider }}</p>
        </div>
        <span class="model-badge" :class="{ active: resolvedConfig.modelId === model.id }">
          {{ resolvedConfig.modelId === model.id ? '当前默认' : '可用模型' }}
        </span>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { useChatStore } from '@/composables/useChatStore'

const chat = useChatStore()
const resolvedConfig = computed(() => chat.resolveRuntimeConfig(chat.currentConversation.value?.id))
const draft = reactive({
  modelId: chat.runtimeConfig.value.userDefaults.modelId || chat.currentModel.value.id || '',
})

const resolvedModelName = computed(() => {
  const matchedModel = chat.models.value.find((item) => item.id === resolvedConfig.value.modelId)
  return matchedModel?.name || chat.currentModel.value.name || '未配置'
})

const saveDefaults = () => {
  if (!draft.modelId) {
    ElMessage.warning('请先选择默认模型')
    return
  }

  chat.setUserRuntimeDefaults({
    modelId: draft.modelId,
  })
  ElMessage.success('默认模型偏好已保存')
}
</script>

<style scoped>
.settings-page { min-height: calc(100vh - 40px); padding: 32px; }
.page-header { margin-bottom: 28px; }
.eyebrow { margin: 0 0 10px; font-size: 11px; letter-spacing: 0.24em; color: var(--text-secondary); }
h2 { margin: 0 0 12px; font-size: 30px; }
.page-header p { margin: 0; color: var(--text-secondary); line-height: 1.7; }
.settings-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; margin-bottom: 16px; }
.runtime-panel { padding: 24px; border-radius: 20px; background: rgba(255,255,255,0.04); border: 1px solid var(--glass-border); display: flex; flex-direction: column; gap: 18px; }
.panel-header { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.panel-header h3 { margin: 0; }
.panel-header span { font-size: 12px; color: var(--text-secondary); }
.form-group { display: flex; flex-direction: column; gap: 8px; }
.form-group label { color: var(--text-secondary); font-size: 14px; }
.form-select { min-height: 48px; padding: 0 14px; border-radius: 14px; border: 1px solid var(--glass-border); background: rgba(255,255,255,0.03); color: var(--text-primary); }
.primary-btn { min-height: 48px; border-radius: 14px; border: 1px solid rgba(168, 199, 250, 0.22); background: rgba(168, 199, 250, 0.12); color: var(--accent-primary); display: inline-flex; align-items: center; justify-content: center; gap: 10px; cursor: pointer; }
.runtime-row { display: flex; justify-content: space-between; gap: 16px; padding-bottom: 14px; border-bottom: 1px solid rgba(255,255,255,0.06); }
.runtime-note { color: var(--text-secondary); line-height: 1.7; }
.model-list { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
.model-card { padding: 18px 20px; border-radius: 18px; border: 1px solid var(--glass-border); background: rgba(255,255,255,0.03); display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.model-card h3 { margin: 0 0 6px; font-size: 16px; }
.model-card p { margin: 0; color: var(--text-secondary); }
.model-badge { display: inline-flex; align-items: center; min-height: 32px; padding: 0 12px; border-radius: 999px; background: rgba(255,255,255,0.06); color: var(--text-secondary); font-size: 12px; }
.model-badge.active { background: rgba(168, 199, 250, 0.12); color: var(--accent-primary); }
@media (max-width: 900px) { .settings-grid, .model-list { grid-template-columns: 1fr; } }
</style>
