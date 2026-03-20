<template>
  <section class="models-page">
    <div class="two-col">
      <aside class="col-providers">
        <div class="col-head">
          <span class="col-head-title">提供商</span>
          <button class="add-btn" @click="openAddDialog" title="添加自定义模型">
            <i class="fa-solid fa-plus"></i>
          </button>
        </div>
        <div class="provider-list">
          <button
            v-for="g in allGroups"
            :key="g.provider"
            class="provider-item"
            :class="{ active: selectedProvider === g.provider }"
            @click="selectProvider(g.provider)"
          >
            <span class="provider-name">{{ g.provider }}</span>
            <span class="provider-count">{{ g.items.length }}</span>
          </button>
          <div v-if="!allGroups.length" class="provider-empty">暂无模型</div>
        </div>
      </aside>

      <main class="col-main">
        <template v-if="selectedProvider">
          <header class="main-head">
            <div>
              <h2 class="main-title">{{ selectedProvider }}</h2>
              <p class="main-sub">共 {{ currentGroupItems.length }} 个模型</p>
            </div>
            <button class="add-model-btn" @click="openAddDialog">
              <i class="fa-solid fa-plus"></i>
              添加模型
            </button>
          </header>

          <section class="model-section">
            <div class="section-label">模型列表</div>
            <div class="model-list">
              <button
                v-for="model in currentGroupItems"
                :key="model.id"
                class="model-item"
                :class="{ active: selectedModelId === model.id }"
                @click="selectModel(model)"
              >
                <div class="model-item-main">
                  <span class="model-item-name">{{ model.name }}</span>
                  <span v-if="model.official" class="badge-official">官方</span>
                </div>
                <div class="model-item-id">{{ model.modelId || model.id }}</div>
              </button>
              <div v-if="!currentGroupItems.length" class="model-empty">该提供商下暂无模型</div>
            </div>
          </section>

          <section class="detail-panel" v-if="selectedModel">
            <div class="section-label">模型详情</div>
            <div class="detail-body">
              <div class="info-row">
                <span class="info-label">名称</span>
                <span class="info-value">{{ selectedModel.name }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Model ID</span>
                <span class="info-value detail-mono">{{ selectedModel.modelId || selectedModel.id }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">提供商</span>
                <span class="info-value">{{ selectedModel.provider || '—' }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">温度参数</span>
                <span class="info-value">{{ selectedModel.temperature ?? '0.7' }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">类型</span>
                <span class="info-value">{{ selectedModel.official ? '官方预设' : '我的自定义' }}</span>
              </div>
            </div>

            <div class="detail-actions" v-if="!selectedModel.official">
              <button class="action-btn" @click="openEditDialog(selectedModel)">
                <i class="fa-solid fa-pen"></i>
                编辑
              </button>
              <button class="action-btn danger" @click="confirmDelete(selectedModel)">
                <i class="fa-solid fa-trash"></i>
                删除
              </button>
            </div>

            <div class="detail-notice" v-else>
              <i class="fa-solid fa-circle-info"></i>
              官方预设模型由管理员维护，不可编辑。
            </div>
          </section>

          <div v-else class="detail-placeholder">
            <i class="fa-solid fa-cube"></i>
            <p>在列表中选择一个模型查看详情</p>
          </div>

        </template>

        <div v-else class="main-empty">
          <i class="fa-solid fa-layer-group"></i>
          <p>从左侧选择提供商后查看模型配置</p>
          <button class="submit-btn" @click="openAddDialog">
            <i class="fa-solid fa-plus"></i>
            添加第一个自定义模型
          </button>
        </div>
      </main>
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
              <div class="form-grid">
                <div class="form-group">
                  <label>显示名称 <span class="required">*</span></label>
                  <input class="form-input" v-model="form.name" placeholder="例：My GPT-4o" />
                </div>
                <div class="form-group">
                  <label>提供商</label>
                  <input class="form-input" v-model="form.provider" placeholder="例：openai / deepseek" />
                </div>
              </div>
              <div class="form-grid">
                <div class="form-group">
                  <label>模型标识（Model ID）</label>
                  <input class="form-input" v-model="form.modelId" placeholder="例：gpt-4o" />
                </div>
                <div class="form-group">
                  <label>温度（Temperature）</label>
                  <input class="form-input" type="number" min="0" max="2" step="0.1" v-model.number="form.temperature" placeholder="0.7" />
                </div>
              </div>
              <div class="form-group">
                <label>API Base URL</label>
                <input class="form-input" v-model="form.baseUrl" placeholder="兼容 OpenAI 格式的接口地址（可选）" />
              </div>
              <div class="form-group">
                <label>API Key <span class="required">*</span></label>
                <input class="form-input" type="password" v-model="form.apiKey" :placeholder="editingModel ? '留空不更改' : '请输入 API Key'" autocomplete="new-password" />
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
import { computed, reactive, ref, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useChatStore, type AIModel } from '@/composables/useChatStore'
import { chatAPI } from '@/utils/api'
import { groupModelsByProvider } from '@/utils/modelGroups'

const chat = useChatStore()

// 所有模型（官方 + 用户自定义）合并后按提供商分组
const allModels = computed<(AIModel & { modelId?: string })[]>(() => [
  ...chat.officialModels.value.map(m => ({ ...m, official: true })),
  ...chat.userModels.value.map(m => ({ ...m, official: false })),
])

const allGroups = computed(() => groupModelsByProvider(allModels.value))

// 三列选中状态
const selectedProvider = ref<string | null>(null)
const selectedModelId = ref<string | null>(null)

const currentGroupItems = computed(() => {
  if (!selectedProvider.value) return []
  const g = allGroups.value.find(g => g.provider === selectedProvider.value)
  return g ? g.items : []
})

const selectedModel = computed(() =>
  selectedModelId.value
    ? (allModels.value.find(m => m.id === selectedModelId.value) ?? null)
    : null
)

// 初始化：自动选中第一个提供商
watch(allGroups, (groups) => {
  if (!selectedProvider.value && groups.length) {
    selectedProvider.value = groups[0].provider
  }
}, { immediate: true })

const selectProvider = (provider: string) => {
  selectedProvider.value = provider
  selectedModelId.value = null
}

const selectModel = (model: AIModel) => {
  selectedModelId.value = model.id
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
  form.modelId = (model as any).modelId || model.id
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
    selectedModelId.value = null
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
.models-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

/* ── 两列容器 ── */
.two-col {
  display: grid;
  grid-template-columns: 220px 1fr;
  height: 100%;
  overflow: hidden;
}

.col-providers,
.col-main {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-right: 1px solid rgba(255, 255, 255, 0.06);
}

.col-main {
  border-right: none;
}

.col-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 16px 12px;
  flex-shrink: 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.col-head-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.07em;
}

/* ── 添加按钮 ── */
.add-btn {
  width: 24px;
  height: 24px;
  border-radius: 7px;
  border: 1px solid rgba(168, 199, 250, 0.2);
  background: rgba(168, 199, 250, 0.08);
  color: var(--accent-primary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  transition: all 0.18s;
  flex-shrink: 0;
}

.add-btn:hover {
  background: rgba(168, 199, 250, 0.18);
}

/* ── 提供商列表 ── */
.provider-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px 8px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.provider-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 9px 10px;
  border-radius: 9px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 13px;
  font-family: inherit;
  text-align: left;
  transition: background 0.15s, color 0.15s;
  gap: 8px;
}

.provider-item:hover {
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-primary);
}

.provider-item.active {
  background: rgba(168, 199, 250, 0.1);
  color: var(--accent-primary);
}

.provider-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.provider-count {
  font-size: 11px;
  color: var(--text-muted);
  background: rgba(255,255,255,0.05);
  border-radius: 99px;
  padding: 1px 6px;
  flex-shrink: 0;
}

.provider-item.active .provider-count {
  background: rgba(168, 199, 250, 0.15);
  color: var(--accent-primary);
}

.provider-empty {
  padding: 16px 10px;
  font-size: 12px;
  color: var(--text-muted);
  text-align: center;
}

/* ── 右侧工作区 ── */
.col-main {
  overflow-y: auto;
}

.main-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 22px 24px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  flex-shrink: 0;
}

.main-title {
  margin: 0;
  font-size: 21px;
  color: var(--text-primary);
  letter-spacing: -0.02em;
}

.main-sub {
  margin: 4px 0 0;
  font-size: 12px;
  color: var(--text-muted);
}

.add-model-btn {
  height: 34px;
  padding: 0 13px;
  border-radius: 9px;
  border: 1px solid rgba(168, 199, 250, 0.25);
  background: rgba(168, 199, 250, 0.1);
  color: var(--accent-primary);
  cursor: pointer;
  font-size: 13px;
  font-family: inherit;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all 0.18s;
}

.add-model-btn:hover {
  background: rgba(168, 199, 250, 0.18);
}

.model-section,
.detail-panel {
  padding: 16px 24px;
}

.section-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 10px;
}

.model-list {
  overflow-y: auto;
  max-height: 340px;
  padding: 6px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.02);
}

.model-item {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 10px 10px;
  border-radius: 9px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  text-align: left;
  font-family: inherit;
  transition: background 0.15s, color 0.15s;
}

.model-item:hover {
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-primary);
}

.model-item.active {
  background: rgba(168, 199, 250, 0.1);
  color: var(--text-primary);
}

.model-item-main {
  display: flex;
  align-items: center;
  gap: 6px;
}

.model-item-name {
  font-size: 13px;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

.model-item-id {
  font-size: 11px;
  color: var(--text-muted);
  font-family: inherit;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.model-empty {
  padding: 24px 10px;
  font-size: 12px;
  color: var(--text-muted);
  text-align: center;
  line-height: 1.5;
}

/* ── 官方徽章 ── */
.badge-official {
  display: inline-flex;
  align-items: center;
  padding: 1px 6px;
  border-radius: 99px;
  font-size: 10px;
  font-weight: 600;
  background: rgba(168, 199, 250, 0.12);
  color: var(--accent-primary);
  border: 1px solid rgba(168, 199, 250, 0.2);
  flex-shrink: 0;
  letter-spacing: 0.02em;
}

.detail-body {
  display: flex;
  flex-direction: column;
  gap: 0;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  padding: 2px 14px;
  background: rgba(255, 255, 255, 0.02);
}

.info-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 13px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
}

.info-row:last-child {
  border-bottom: none;
}

.info-label {
  font-size: 13px;
  color: var(--text-secondary);
  font-weight: 500;
}

.info-value {
  font-size: 13px;
  color: var(--text-primary);
}

.detail-mono {
  font-family: inherit;
}

.detail-actions {
  padding: 12px 0 0;
  display: flex;
  gap: 10px;
  flex-shrink: 0;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 9px 16px;
  border-radius: 10px;
  border: 1px solid var(--glass-border);
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 13px;
  font-family: inherit;
  font-weight: 500;
  transition: all 0.18s;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-primary);
}

.action-btn.danger:hover {
  background: rgba(239, 68, 68, 0.12);
  border-color: rgba(239, 68, 68, 0.3);
  color: #ef4444;
}

.detail-notice {
  margin: 12px 0 0;
  padding: 12px 16px;
  border-radius: 10px;
  background: rgba(168, 199, 250, 0.06);
  border: 1px solid rgba(168, 199, 250, 0.12);
  font-size: 12.5px;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.detail-notice i {
  color: var(--accent-primary);
  opacity: 0.7;
  flex-shrink: 0;
}

.detail-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  gap: 14px;
  color: var(--text-muted);
  padding: 28px 16px;
  border: 1px dashed rgba(255, 255, 255, 0.1);
  border-radius: 12px;
}

.detail-placeholder i {
  font-size: 26px;
  opacity: 0.25;
}

.detail-placeholder p {
  margin: 0;
  font-size: 13px;
  text-align: center;
  line-height: 1.7;
  opacity: 0.6;
}

.main-empty {
  flex: 1;
  min-height: 280px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: var(--text-muted);
}

.main-empty i {
  font-size: 30px;
  opacity: 0.35;
}

.main-empty p {
  margin: 0;
  font-size: 13px;
}

/* ── 弹窗 ── */
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
  width: 540px;
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

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
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

.required { color: #ef4444; }

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
  width: 100%;
  box-sizing: border-box;
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

/* ── 滚动条美化 ── */
.provider-list::-webkit-scrollbar,
.model-list::-webkit-scrollbar,
.col-main::-webkit-scrollbar {
  width: 4px;
}
.provider-list::-webkit-scrollbar-track,
.model-list::-webkit-scrollbar-track,
.col-main::-webkit-scrollbar-track {
  background: transparent;
}
.provider-list::-webkit-scrollbar-thumb,
.model-list::-webkit-scrollbar-thumb,
.col-main::-webkit-scrollbar-thumb {
  background: rgba(255,255,255,0.1);
  border-radius: 99px;
}

@media (max-width: 900px) {
  .two-col {
    grid-template-columns: 180px 1fr;
  }

  .main-head {
    padding: 18px 16px 12px;
  }

  .model-section,
  .detail-panel {
    padding: 12px 16px;
  }
}

@media (max-width: 640px) {
  .two-col {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
  }

  .col-providers {
    border-right: none;
    border-bottom: 1px solid rgba(255,255,255,0.06);
    height: auto;
    max-height: 180px;
  }

  .main-head {
    align-items: flex-start;
    flex-direction: column;
  }

  .add-model-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
