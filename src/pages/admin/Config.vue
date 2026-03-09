<template>
  <div class="admin-page">
    <div class="page-header glass-card">
      <div class="header-title">
        <i class="fa-solid fa-gear"></i>
        <h1>系统配置</h1>
      </div>
      <p class="header-desc">统一管理默认模型、限流策略和聊天记录保留周期。</p>
    </div>

    <div class="config-grid">
      <section class="config-container glass-card">
        <div class="section-title">
          <i class="fa-solid fa-sliders"></i>
          <span>基础设置</span>
        </div>

        <div class="config-form">
          <div class="form-group">
            <label class="form-label">
              <i class="fa-solid fa-microchip"></i>
              <span>默认模型</span>
            </label>
            <select v-model="form.defaultModelId" class="form-select">
              <option value="">请选择模型</option>
              <option v-for="model in models" :key="model.id" :value="model.modelId">
                {{ model.name }}（{{ model.modelId }}）
              </option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">
              <i class="fa-solid fa-bullhorn"></i>
              <span>系统公告</span>
            </label>
            <textarea
              v-model="form.announcement"
              rows="4"
              class="form-textarea"
              placeholder="输入首页公告"
            />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">
                <i class="fa-solid fa-calendar-day"></i>
                <span>每日对话上限</span>
              </label>
              <el-input-number v-model="form.dailyLimit" :min="0" :max="100000" style="width: 100%" />
            </div>

            <div class="form-group">
              <label class="form-label">
                <i class="fa-solid fa-gauge-high"></i>
                <span>每分钟请求上限</span>
              </label>
              <el-input-number v-model="form.perMinuteLimit" :min="0" :max="10000" style="width: 100%" />
            </div>
          </div>

          <div class="form-actions">
            <button class="primary-btn" :disabled="saving" @click="save">
              <i class="fa-solid fa-check"></i>
              <span>{{ saving ? '保存中...' : '保存配置' }}</span>
            </button>
          </div>
        </div>
      </section>

      <section class="config-container glass-card retention-card">
        <div class="section-title">
          <i class="fa-solid fa-database"></i>
          <span>聊天记录保留</span>
        </div>

        <div class="config-form">
          <div class="form-group">
            <label class="form-label">
              <i class="fa-solid fa-calendar-xmark"></i>
              <span>保留天数</span>
            </label>
            <el-input-number v-model="form.chatRetentionDays" :min="1" :max="3650" style="width: 100%" />
            <p class="form-hint">系统会以此天数作为聊天记录清理基准，默认保留最近 30 天。</p>
          </div>

          <div class="retention-summary">
            <span>当前策略</span>
            <strong>保留最近 {{ form.chatRetentionDays }} 天聊天记录</strong>
          </div>

          <div class="form-actions compact">
            <button class="primary-btn" :disabled="saving" @click="save">
              <i class="fa-solid fa-floppy-disk"></i>
              <span>保存保留策略</span>
            </button>
            <button class="danger-btn" :disabled="cleaning" @click="cleanup">
              <i class="fa-solid fa-trash"></i>
              <span>{{ cleaning ? '清理中...' : '按当前策略立即清理' }}</span>
            </button>
          </div>

          <p v-if="lastCleanupText" class="cleanup-result">{{ lastCleanupText }}</p>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { adminAPI, type AdminModelItem } from '@/utils/api'

const form = ref({
  defaultModelId: '',
  announcement: '',
  dailyLimit: 100,
  perMinuteLimit: 20,
  chatRetentionDays: 30,
})
const models = ref<AdminModelItem[]>([])
const saving = ref(false)
const cleaning = ref(false)
const lastCleanupText = ref('')

const load = async () => {
  try {
    const [configData, modelResult] = await Promise.all([
      adminAPI.getConfig() as Promise<Record<string, any>>,
      adminAPI.listModels('', 1, 100),
    ])

    form.value = {
      defaultModelId: String(configData?.defaultModelId || ''),
      announcement: String(configData?.announcement || ''),
      dailyLimit: Number(configData?.dailyLimit ?? 100),
      perMinuteLimit: Number(configData?.perMinuteLimit ?? 20),
      chatRetentionDays: Number(configData?.chatRetentionDays ?? 30),
    }
    models.value = modelResult.items
  } catch (loadError: any) {
    ElMessage.error(loadError?.message || '配置加载失败')
  }
}

const save = async () => {
  saving.value = true
  try {
    await adminAPI.updateConfig(form.value)
    ElMessage.success('配置已保存')
  } catch (saveError: any) {
    ElMessage.error(saveError?.message || '配置保存失败')
  } finally {
    saving.value = false
  }
}

const cleanup = async () => {
  try {
    await ElMessageBox.confirm(
      `将按“保留最近 ${form.value.chatRetentionDays} 天聊天记录”的策略执行清理，确认继续？`,
      '确认清理',
      {
        type: 'warning',
        confirmButtonText: '立即清理',
        cancelButtonText: '取消',
      },
    )
  } catch {
    return
  }

  cleaning.value = true
  try {
    const result = await adminAPI.cleanupChatRecords() as { removed?: number; retentionDays?: number }
    const removed = Number(result?.removed || 0)
    const retentionDays = Number(result?.retentionDays || form.value.chatRetentionDays)
    lastCleanupText.value = `本次已按 ${retentionDays} 天策略清理 ${removed} 条过期会话。`
    ElMessage.success('聊天记录清理完成')
  } catch (cleanupError: any) {
    ElMessage.error(cleanupError?.message || '聊天记录清理失败')
  } finally {
    cleaning.value = false
  }
}

onMounted(load)
</script>

<style scoped>
.admin-page {
  width: 100%;
  box-sizing: border-box;
}

.page-header,
.config-container {
  border-radius: 16px;
}

.page-header {
  padding: 24px;
  margin-bottom: 24px;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 14px;
}

.header-title i {
  font-size: 28px;
  color: var(--accent-primary);
}

.header-title h1 {
  margin: 0;
  color: var(--text-primary);
  font-size: var(--page-title-size);
  font-weight: var(--page-title-weight);
}

.header-desc {
  margin: 12px 0 0;
  color: var(--text-secondary);
  font-size: 14px;
}

.config-grid {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(320px, 1fr);
  gap: 20px;
}

.config-container {
  padding: 28px;
}

.section-title {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
  color: var(--text-primary);
  font-weight: 600;
}

.section-title i {
  color: var(--accent-primary);
}

.config-form {
  display: grid;
  gap: 24px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.form-group {
  display: grid;
  gap: 10px;
}

.form-label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--text-primary);
  font-weight: 600;
}

.form-label i {
  color: var(--accent-primary);
}

.form-select,
.form-textarea {
  width: 100%;
  border-radius: 10px;
  border: 1px solid var(--glass-border);
  background: rgba(0, 0, 0, 0.3);
  color: var(--text-primary);
  font-family: inherit;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s ease;
  box-sizing: border-box;
}

.form-select {
  padding: 12px 36px 12px 14px;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%239ca3af' stroke-width='1.5' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: calc(100% - 14px) center;
  appearance: none;
}

.form-textarea {
  min-height: 112px;
  resize: vertical;
  padding: 12px 14px;
}

.form-select:hover,
.form-textarea:hover,
.form-select:focus,
.form-textarea:focus {
  border-color: rgba(168, 199, 250, 0.35);
}

.form-hint,
.cleanup-result {
  margin: 0;
  font-size: 13px;
  line-height: 1.6;
}

.form-hint {
  color: var(--text-secondary);
}

.retention-card {
  align-self: start;
}

.retention-summary {
  padding: 16px 18px;
  border-radius: 14px;
  background: rgba(168, 199, 250, 0.08);
  border: 1px solid rgba(168, 199, 250, 0.16);
  color: var(--text-secondary);
  display: grid;
  gap: 6px;
}

.retention-summary strong {
  color: var(--text-primary);
  font-size: 16px;
}

.form-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.form-actions.compact {
  justify-content: flex-start;
}

.primary-btn,
.danger-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 42px;
  padding: 0 18px;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  font-family: inherit;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s ease;
}

.primary-btn {
  background: var(--accent-primary);
  color: #0a0a0a;
}

.danger-btn {
  background: rgba(239, 68, 68, 0.14);
  border: 1px solid rgba(239, 68, 68, 0.26);
  color: #fca5a5;
}

.primary-btn:disabled,
.danger-btn:disabled {
  opacity: 0.6;
  cursor: wait;
}

.cleanup-result {
  color: var(--text-secondary);
}

@media (max-width: 1024px) {
  .config-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
