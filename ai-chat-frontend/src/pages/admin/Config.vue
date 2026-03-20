<template>
  <div class="config-page">
    <!-- Header -->
    <div class="page-head">
      <div>
        <h1 class="page-title">系统配置</h1>
      </div>
    </div>

    <div class="config-grid">
      <!-- Left: Basic Settings -->
      <section class="panel">
        <div class="panel-head">
          <span class="section-label">基础设置</span>
        </div>

        <div class="config-form">
          <div class="form-group">
            <label class="form-label">默认模型</label>
            <select v-model="form.defaultModelId" class="form-select">
              <option value="">请选择模型</option>
              <optgroup v-for="group in modelGroups" :key="group.provider" :label="group.provider">
                <option v-for="model in group.items" :key="model.id" :value="model.modelId">
                  {{ model.name }}（{{ model.modelId }}）
                </option>
              </optgroup>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">系统公告</label>
            <textarea
              v-model="form.announcement"
              rows="4"
              class="form-textarea"
              placeholder="输入首页公告内容（留空则不显示）"
            />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">每日对话上限</label>
              <el-input-number v-model="form.dailyLimit" :min="0" :max="100000" style="width: 100%" />
            </div>

            <div class="form-group">
              <label class="form-label">每分钟请求上限</label>
              <el-input-number v-model="form.perMinuteLimit" :min="0" :max="10000" style="width: 100%" />
            </div>
          </div>

          <div class="form-actions">
            <button class="save-btn" :disabled="saving" @click="save">
              <i class="fa-solid fa-check"></i>
              <span>{{ saving ? '保存中…' : '保存配置' }}</span>
            </button>
          </div>
        </div>
      </section>

      <!-- Right: Retention Policy -->
      <section class="panel retention-panel">
        <div class="panel-head">
          <span class="section-label">聊天记录保留</span>
        </div>

        <div class="config-form">
          <div class="form-group">
            <label class="form-label">保留天数</label>
            <el-input-number v-model="form.chatRetentionDays" :min="1" :max="3650" style="width: 100%" />
          </div>

          <div class="retention-summary">
            <span class="rs-label">当前策略</span>
            <strong class="rs-value">保留最近 {{ form.chatRetentionDays }} 天聊天记录</strong>
          </div>

          <div class="form-actions">
            <button class="save-btn" :disabled="saving" @click="save">
              <i class="fa-solid fa-floppy-disk"></i>
              <span>保存策略</span>
            </button>
            <button class="danger-btn" :disabled="cleaning" @click="cleanup">
              <i class="fa-solid fa-trash-can"></i>
              <span>{{ cleaning ? '清理中…' : '立即清理' }}</span>
            </button>
          </div>

          <p v-if="lastCleanupText" class="cleanup-result">{{ lastCleanupText }}</p>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { adminAPI, type AdminModelItem } from '@/utils/api'
import { groupModelsByProvider } from '@/utils/modelGroups'

const form = ref({
  defaultModelId: '',
  announcement: '',
  dailyLimit: 100,
  perMinuteLimit: 20,
  chatRetentionDays: 30,
})
const models = ref<AdminModelItem[]>([])
const modelGroups = computed(() => groupModelsByProvider(models.value))
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
.config-page {
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* ── Header ── */
.page-head {
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.page-title {
  margin: 0 0 4px;
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.3px;
}

.page-caption {
  font-size: 14px;
  color: var(--text-muted);
}

/* ── Layout ── */
.config-grid {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(300px, 1fr);
  gap: 20px;
  align-items: start;
}

/* ── Panel ── */
.panel {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.045), rgba(255, 255, 255, 0.028));
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 14px;
  padding: 22px 26px;
  box-shadow: 0 10px 26px rgba(0, 0, 0, 0.22);
}

.panel-head {
  margin-bottom: 20px;
  padding-bottom: 14px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.09);
}

.section-label {
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--text-muted);
  font-weight: 600;
}

/* ── Form ── */
.config-form {
  display: grid;
  gap: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-secondary);
}

.form-select,
.form-textarea {
  width: 100%;
  border-radius: 9px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.03);
  color: var(--text-primary);
  font-family: inherit;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.form-select {
  padding: 10px 36px 10px 13px;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%236b7280' stroke-width='1.5' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: calc(100% - 12px) center;
  appearance: none;
  cursor: pointer;
}

.form-textarea {
  min-height: 96px;
  resize: vertical;
  padding: 10px 13px;
}

.form-select:hover,
.form-textarea:hover,
.form-select:focus,
.form-textarea:focus {
  border-color: rgba(168, 199, 250, 0.35);
}

.form-hint {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: var(--text-muted);
}

.form-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  padding-top: 4px;
}

/* ── Buttons ── */
.save-btn,
.danger-btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 9px 16px;
  border-radius: 9px;
  border: none;
  cursor: pointer;
  font-family: inherit;
  font-size: 14px;
  font-weight: 600;
  transition: opacity 0.15s;
}

.save-btn {
  background: var(--accent-primary);
  color: #0a0a0a;
}

.danger-btn {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.22);
  color: #fca5a5;
}

.save-btn:hover,
.danger-btn:hover {
  opacity: 0.82;
}

.save-btn:disabled,
.danger-btn:disabled {
  opacity: 0.5;
  cursor: wait;
}

/* ── Retention summary ── */
.retention-panel {
  align-self: start;
}

.retention-summary {
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: 14px 16px;
  border-radius: 10px;
  background: rgba(168, 199, 250, 0.06);
  border: 1px solid rgba(168, 199, 250, 0.14);
}

.rs-label {
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-muted);
}

.rs-value {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
}

.cleanup-result {
  margin: 0;
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.6;
}

/* ── Responsive ── */
@media (max-width: 1024px) {
  .config-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
