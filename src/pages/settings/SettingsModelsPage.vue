<template>
  <section class="settings-page">
    <h2 class="page-title">模型服务</h2>

    <!-- 默认模型 -->
    <div class="settings-section">
      <div class="section-header">
        <h3>默认偏好</h3>
      </div>

      <div class="setting-row">
        <div class="setting-label-wrap">
          <span class="setting-label">默认模型</span>
          <span class="setting-desc">新建会话时自动使用的模型</span>
        </div>
        <select class="row-select glass-select-native" v-model="draft.modelId">
          <option value="">请选择模型</option>
          <optgroup v-if="chat.officialModels.value.length" label="官方预设">
            <option v-for="model in chat.officialModels.value" :key="model.id" :value="model.id">
              {{ model.name }}（{{ model.provider }}）
            </option>
          </optgroup>
          <optgroup v-if="chat.userModels.value.length" label="我的自定义">
            <option v-for="model in chat.userModels.value" :key="model.id" :value="model.id">
              {{ model.name }}（{{ model.provider }}）
            </option>
          </optgroup>
        </select>
      </div>

      <div class="section-footer">
        <button class="primary-btn" @click="saveDefaults">
          <i class="fa-solid fa-check"></i>
          <span>保存偏好</span>
        </button>
      </div>
    </div>

    <!-- 官方预设模型 -->
    <div class="settings-section">
      <div class="section-header">
        <h3>官方预设模型</h3>
        <span class="section-badge">由管理员配置</span>
      </div>

      <div
        v-for="model in chat.officialModels.value"
        :key="model.id"
        class="setting-row"
      >
        <div class="setting-label-wrap">
          <span class="setting-label">{{ model.name }}</span>
          <span class="setting-desc">{{ model.provider }}</span>
        </div>
        <span class="model-badge official">官方</span>
      </div>

      <div v-if="!chat.officialModels.value.length" class="empty-row">
        暂无官方预设模型
      </div>
    </div>

    <!-- 我的自定义模型 -->
    <div class="settings-section">
      <div class="section-header">
        <h3>我的自定义模型</h3>
        <button class="add-btn" @click="openAddDialog">
          <i class="fa-solid fa-plus"></i>
          <span>添加模型</span>
        </button>
      </div>

      <div
        v-for="model in chat.userModels.value"
        :key="model.id"
        class="setting-row"
      >
        <div class="setting-label-wrap">
          <span class="setting-label">{{ model.name }}</span>
          <span class="setting-desc">{{ model.provider }}</span>
        </div>
        <div class="row-actions">
          <button class="action-btn" @click="openEditDialog(model)" title="编辑">
            <i class="fa-solid fa-pen"></i>
          </button>
          <button class="action-btn danger" @click="confirmDelete(model)" title="删除">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      </div>

      <div v-if="!chat.userModels.value.length" class="empty-row">
        还没有自定义模型，点击右上角「添加模型」
      </div>
    </div>

    <!-- 添加/编辑弹窗 -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div class="dialog-overlay" v-if="showDialog" @click.self="closeDialog">
          <div class="dialog-box">
            <div class="dialog-header">
              <span>{{ editingModel ? '编辑模型' : '添加自定义模型' }}</span>
              <button class="close-btn" @click="closeDialog"><i class="fa-solid fa-xmark"></i></button>
            </div>

            <div class="dialog-body">
              <div class="form-group">
                <label>显示名称 <span class="required">*</span></label>
                <input class="form-input" v-model="form.name" placeholder="例：My GPT-4o" />
              </div>
              <div class="form-group">
                <label>提供商</label>
                <input class="form-input" v-model="form.provider" placeholder="例：openai / deepseek" />
              </div>
              <div class="form-group">
                <label>模型标识（Model ID）</label>
                <input class="form-input" v-model="form.modelId" placeholder="例：gpt-4o / deepseek-chat" />
              </div>
              <div class="form-group">
                <label>API Base URL</label>
                <input class="form-input" v-model="form.baseUrl" placeholder="兼容 OpenAI 格式的接口地址（可选）" />
              </div>
              <div class="form-group">
                <label>API Key <span class="required">*</span></label>
                <input class="form-input" type="password" v-model="form.apiKey" :placeholder="editingModel ? '留空不更改' : '请输入 API Key'" autocomplete="new-password" />
              </div>
              <div class="form-group">
                <label>温度（Temperature）</label>
                <input class="form-input" type="number" min="0" max="2" step="0.1" v-model.number="form.temperature" placeholder="0.7" />
              </div>
            </div>

            <div class="dialog-footer">
              <button class="cancel-btn" @click="closeDialog">取消</button>
              <button class="submit-btn" @click="submitDialog" :disabled="submitting">
                <i class="fa-solid fa-check"></i>
                {{ submitting ? '保存中…' : '保存' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </section>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useChatStore, type AIModel } from '@/composables/useChatStore'
import { chatAPI } from '@/utils/api'

const chat = useChatStore()

const draft = reactive({
  modelId: chat.runtimeConfig.value.userDefaults.modelId || chat.currentModel.value.id || '',
})

const saveDefaults = () => {
  if (!draft.modelId) {
    ElMessage.warning('请先选择默认模型')
    return
  }
  chat.setUserRuntimeDefaults({ modelId: draft.modelId })
  ElMessage.success('默认模型偏好已保存')
}

// ---- 弹窗逻辑 ----

const showDialog = ref(false)
const submitting = ref(false)
const editingModel = ref<AIModel | null>(null)

const form = reactive({
  name: '',
  provider: '',
  modelId: '',
  baseUrl: '',
  apiKey: '',
  temperature: 0.7 as number | undefined,
})

const resetForm = () => {
  form.name = ''
  form.provider = ''
  form.modelId = ''
  form.baseUrl = ''
  form.apiKey = ''
  form.temperature = 0.7
}

const openAddDialog = () => {
  editingModel.value = null
  resetForm()
  showDialog.value = true
}

const openEditDialog = (model: AIModel) => {
  editingModel.value = model
  form.name = model.name
  form.provider = model.provider
  form.modelId = model.id
  form.baseUrl = ''
  form.apiKey = ''
  form.temperature = model.temperature ?? 0.7
  showDialog.value = true
}

const closeDialog = () => {
  showDialog.value = false
}

const submitDialog = async () => {
  if (!form.name.trim()) {
    ElMessage.warning('请填写显示名称')
    return
  }
  if (!editingModel.value && !form.apiKey.trim()) {
    ElMessage.warning('请填写 API Key')
    return
  }

  submitting.value = true
  try {
    if (editingModel.value) {
      const payload: any = {
        name: form.name,
        provider: form.provider,
        modelId: form.modelId,
        baseUrl: form.baseUrl || undefined,
        temperature: form.temperature,
      }
      if (form.apiKey.trim()) payload.apiKey = form.apiKey
      await chatAPI.updateUserModel(editingModel.value.id, payload)
      ElMessage.success('模型已更新')
    } else {
      await chatAPI.createUserModel({
        name: form.name,
        provider: form.provider,
        modelId: form.modelId,
        baseUrl: form.baseUrl || undefined,
        apiKey: form.apiKey,
        temperature: form.temperature,
      })
      ElMessage.success('模型已添加')
    }
    closeDialog()
    await refreshUserModels()
  } catch (err: any) {
    ElMessage.error(err?.message || '操作失败')
  } finally {
    submitting.value = false
  }
}

const confirmDelete = async (model: AIModel) => {
  try {
    await ElMessageBox.confirm(
      `确认删除「${model.name}」？此操作不可撤销。`,
      '删除确认',
      { type: 'warning', confirmButtonText: '删除', cancelButtonText: '取消' }
    )
    await chatAPI.deleteUserModel(model.id)
    ElMessage.success('模型已删除')
    await refreshUserModels()
  } catch {
    // 取消
  }
}

const refreshUserModels = async () => {
  const items = await chatAPI.getUserModels()
  chat.setUserModels(items.map(m => ({
    id: m.id,
    name: m.name,
    provider: m.provider,
    temperature: m.temperature,
    isActive: m.isActive,
    official: false,
  })))
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
  display: flex;
  align-items: center;
  gap: 10px;
}

.section-header h3 {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  flex: 1;
}

.section-badge {
  font-size: 11px;
  color: var(--text-muted);
  background: rgba(255,255,255,0.05);
  border: 1px solid var(--glass-border);
  padding: 2px 8px;
  border-radius: 999px;
}

.add-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 12px;
  border-radius: 8px;
  border: 1px solid rgba(168, 199, 250, 0.25);
  background: rgba(168, 199, 250, 0.1);
  color: var(--accent-primary);
  cursor: pointer;
  font-size: 13px;
  font-family: inherit;
  transition: all 0.18s;
}

.add-btn:hover {
  background: rgba(168, 199, 250, 0.18);
}

.setting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 16px 24px;
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

.row-select {
  max-width: 280px;
  min-height: 38px;
  padding: 0 36px 0 14px;
  appearance: none;
  -webkit-appearance: none;
  border-radius: 10px;
  border: 1px solid var(--glass-border);
  background-color: rgba(0, 0, 0, 0.3);
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%239ca3af' stroke-width='1.5' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: calc(100% - 12px) center;
  color: var(--text-primary);
  font-family: inherit;
  font-size: 14px;
  outline: none;
  cursor: pointer;
  transition: border-color 0.2s;
}

.row-select:hover {
  border-color: rgba(168, 199, 250, 0.3);
}

.row-select:focus {
  border-color: var(--accent-primary);
}

.row-select option {
  background: #18181b;
  color: var(--text-primary);
}

.model-badge {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 0 12px;
  border-radius: 999px;
  font-size: 12px;
  flex-shrink: 0;
}

.model-badge.official {
  background: rgba(168, 199, 250, 0.1);
  color: var(--accent-primary);
  border: 1px solid rgba(168, 199, 250, 0.2);
}

.row-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid var(--glass-border);
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.18s;
  font-size: 13px;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-primary);
}

.action-btn.danger:hover {
  background: rgba(239, 68, 68, 0.15);
  border-color: rgba(239, 68, 68, 0.3);
  color: #ef4444;
}

.section-footer {
  padding: 16px 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  justify-content: flex-end;
}

.primary-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 38px;
  padding: 0 18px;
  border-radius: 10px;
  border: 1px solid rgba(168, 199, 250, 0.25);
  background: rgba(168, 199, 250, 0.12);
  color: var(--accent-primary);
  cursor: pointer;
  font-size: 14px;
  font-family: inherit;
  font-weight: 500;
  transition: all 0.18s ease;
}

.primary-btn:hover {
  background: rgba(168, 199, 250, 0.2);
}

.empty-row {
  padding: 20px 24px;
  color: var(--text-muted);
  font-size: 14px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

/* 弹窗 */
.dialog-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.75);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
}

.modal-fade-enter-active,
.modal-fade-leave-active { transition: opacity 0.25s; }
.modal-fade-enter-from,
.modal-fade-leave-to { opacity: 0; }

.dialog-box {
  width: 480px;
  max-width: 96vw;
  background: rgba(24, 24, 27, 0.97);
  border: 1px solid var(--glass-border);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0,0,0,0.6);
}

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid var(--glass-border);
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
}

.close-btn {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  font-size: 16px;
  padding: 4px;
  transition: color 0.18s;
}

.close-btn:hover { color: var(--text-primary); }

.dialog-body {
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 13px;
  color: var(--text-secondary);
  font-weight: 500;
}

.required {
  color: #ef4444;
}

.form-input {
  height: 38px;
  padding: 0 12px;
  border-radius: 10px;
  border: 1px solid var(--glass-border);
  background: rgba(255,255,255,0.05);
  color: var(--text-primary);
  font-family: inherit;
  font-size: 14px;
  outline: none;
  transition: border-color 0.18s;
}

.form-input:focus {
  border-color: rgba(168, 199, 250, 0.4);
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 24px;
  border-top: 1px solid var(--glass-border);
}

.cancel-btn {
  height: 38px;
  padding: 0 16px;
  border-radius: 10px;
  border: 1px solid var(--glass-border);
  background: rgba(255,255,255,0.05);
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 14px;
  font-family: inherit;
  transition: all 0.18s;
}

.cancel-btn:hover { background: rgba(255,255,255,0.1); }

.submit-btn {
  height: 38px;
  padding: 0 18px;
  border-radius: 10px;
  border: 1px solid rgba(168, 199, 250, 0.25);
  background: rgba(168, 199, 250, 0.12);
  color: var(--accent-primary);
  cursor: pointer;
  font-size: 14px;
  font-family: inherit;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.18s;
}

.submit-btn:hover:not(:disabled) { background: rgba(168, 199, 250, 0.2); }
.submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.row-value {
  font-size: 14px;
  color: var(--text-primary);
  font-weight: 500;
}

.row-value.muted {
  color: var(--text-secondary);
  font-weight: 400;
}

.model-badge.active {
  background: rgba(168, 199, 250, 0.12);
  color: var(--accent-primary);
}

@media (max-width: 900px) {
  .settings-page { padding: 20px 16px; }
  .setting-row { flex-direction: column; align-items: flex-start; gap: 10px; }
  .row-select { max-width: 100%; width: 100%; }
}
</style>


