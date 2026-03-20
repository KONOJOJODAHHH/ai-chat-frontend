<template>
  <div class="admin-models">
    <!-- 顶部栏：标题 + 搜索 + 新增 -->
    <header class="page-head">
      <div class="head-left">
        <h1 class="page-title">模型管理</h1>
        <span v-if="total" class="total-badge">共 {{ total }} 个</span>
      </div>
      <div class="head-right">
        <div class="search-wrap">
          <i class="fa-solid fa-magnifying-glass search-icon"></i>
          <input v-model.trim="q" class="search-input" placeholder="搜索模型…" @input="handleSearch" />
        </div>
        <button class="primary-btn" @click="openCreate">
          <i class="fa-solid fa-plus"></i>
          新增模型
        </button>
      </div>
    </header>

    <!-- 三列主体 -->
    <div class="three-col">
      <!-- 左列：提供商 -->
      <div class="col-providers">
        <div class="col-head">
          <span class="col-head-title">提供商</span>
        </div>
        <div class="provider-list">
          <div v-if="loading && !groupedItems.length" class="col-empty">加载中…</div>
          <button
            v-for="g in groupedItems"
            :key="g.provider"
            class="provider-item"
            :class="{ active: selectedProvider === g.provider }"
            @click="selectProvider(g.provider)"
          >
            <span class="provider-name">{{ g.provider }}</span>
            <span class="provider-count">{{ g.items.length }}</span>
          </button>
          <div v-if="!loading && !groupedItems.length" class="col-empty">暂无模型</div>
        </div>
      </div>

      <!-- 中列：模型列表 -->
      <div class="col-models">
        <div class="col-head">
          <span class="col-head-title">{{ selectedProvider || '模型' }}</span>
          <span class="col-head-count" v-if="currentItems.length">{{ currentItems.length }} 个</span>
        </div>
        <div class="model-list">
          <button
            v-for="row in currentItems"
            :key="row.id"
            class="model-item"
            :class="{ active: selectedId === row.id }"
            @click="selectModel(row)"
          >
            <div class="model-item-main">
              <span class="model-item-name">{{ row.name }}</span>
              <span v-if="row.isDefault" class="badge-default">默认</span>
              <span class="badge-official">官方</span>
              <span class="status-dot" :class="{ active: row.enabled }"></span>
            </div>
            <div class="model-item-id">{{ row.modelId }}</div>
          </button>
          <div v-if="!currentItems.length && selectedProvider" class="col-empty">该提供商下暂无模型</div>
          <div v-if="!selectedProvider" class="col-empty">← 从左侧选择提供商</div>
        </div>
      </div>

      <!-- 右列：详情 -->
      <div class="col-detail">
        <template v-if="selectedModel">
          <!-- 标题区 -->
          <div class="detail-head">
            <div class="detail-title-row">
              <h2 class="detail-title">{{ selectedModel.name }}</h2>
              <span v-if="selectedModel.isDefault" class="badge-default">默认</span>
              <span class="badge-official">官方</span>
            </div>
            <p class="detail-sub">{{ selectedModel.modelId }}</p>
            <!-- 状态切换 -->
            <div class="detail-status-bar">
              <span class="status-dot" :class="{ active: selectedModel.enabled }"></span>
              <span class="status-text" :class="{ active: selectedModel.enabled }">
                {{ selectedModel.enabled ? '已启用' : '已禁用' }}
              </span>
            </div>
          </div>

          <!-- 信息行 -->
          <div class="detail-body">
            <div class="info-row">
              <span class="info-label">提供商</span>
              <span class="info-value">{{ selectedModel.provider || '—' }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">接口地址</span>
              <span class="info-value mono" :title="selectedModel.baseUrl || ''">{{ selectedModel.baseUrl || '—' }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">温度参数</span>
              <span class="info-value">{{ selectedModel.temperature ?? '0.7' }}</span>
            </div>
            <div class="info-row" v-if="selectedModel.remark">
              <span class="info-label">备注</span>
              <span class="info-value">{{ selectedModel.remark }}</span>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="detail-actions">
            <button class="action-btn" @click="openEdit(selectedModel)">
              <i class="fa-solid fa-pen"></i> 编辑
            </button>
            <button class="action-btn" @click="toggle(selectedModel)">
              <i :class="selectedModel.enabled ? 'fa-solid fa-ban' : 'fa-solid fa-check'"></i>
              {{ selectedModel.enabled ? '禁用' : '启用' }}
            </button>
            <button
              class="action-btn accent"
              @click="setDefault(selectedModel)"
              :disabled="selectedModel.isDefault"
            >
              <i class="fa-solid fa-star"></i>
              {{ selectedModel.isDefault ? '已是默认' : '设为默认' }}
            </button>
            <button class="action-btn" @click="testModel(selectedModel)">
              <i class="fa-solid fa-plug"></i> 测试连接
            </button>
            <button class="action-btn danger" @click="removeModel(selectedModel)">
              <i class="fa-solid fa-trash"></i> 删除
            </button>
          </div>
        </template>

        <div v-else class="detail-placeholder">
          <i class="fa-solid fa-microchip"></i>
          <p>从左侧选择一个模型<br>查看详情与操作</p>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div class="pagination" v-if="total > size">
      <el-pagination
        layout="prev, pager, next"
        :total="total"
        :page-size="size"
        :current-page="page"
        @current-change="handlePageChange"
      />
    </div>

    <!-- 编辑 / 新增弹窗 -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div class="dialog-overlay" v-if="visible" @click.self="visible = false">
          <div class="dialog-box">
            <div class="dialog-header">
              <span>{{ editingId ? '编辑模型' : '新增官方模型' }}</span>
              <button class="close-btn" @click="visible = false"><i class="fa-solid fa-xmark"></i></button>
            </div>

            <div class="dialog-body">
              <div class="form-grid">
                <div class="form-group">
                  <label>模型名称 <span class="required">*</span></label>
                  <input class="form-input" v-model="form.name" placeholder="例：Qwen 3.5 Flash" />
                </div>
                <div class="form-group">
                  <label>模型标识 <span class="required">*</span></label>
                  <input class="form-input" v-model="form.modelId" placeholder="例：qwen3.5-flash" />
                </div>
              </div>
              <div class="form-grid">
                <div class="form-group">
                  <label>提供商</label>
                  <input class="form-input" v-model="form.provider" placeholder="例：Alibaba Cloud" />
                </div>
                <div class="form-group">
                  <label>温度参数</label>
                  <input class="form-input" type="number" min="0" max="2" step="0.1" v-model.number="form.temperature" placeholder="0.7" />
                </div>
              </div>
              <div class="form-group">
                <label>接口地址</label>
                <input class="form-input" v-model="form.baseUrl" placeholder="https://dashscope.aliyuncs.com/compatible-mode/v1" />
              </div>
              <div class="form-group">
                <label>API Key</label>
                <input class="form-input" type="password" v-model="form.apiKey" placeholder="请输入 API Key" autocomplete="new-password" />
              </div>
              <div class="form-group">
                <label>备注</label>
                <input class="form-input" v-model="form.remark" placeholder="可选备注信息" />
              </div>
            </div>

            <div class="dialog-footer">
              <button class="cancel-btn" @click="visible = false">取消</button>
              <button class="submit-btn" @click="save">
                <i class="fa-solid fa-check"></i> 保存
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { adminAPI, type AdminModelItem } from '@/utils/api'
import { groupModelsByProvider } from '@/utils/modelGroups'

interface ModelForm {
  modelId: string
  name: string
  provider: string
  baseUrl: string
  apiKey: string
  temperature: number
  remark: string
}

const createEmptyForm = (): ModelForm => ({
  modelId: '',
  name: '',
  provider: '',
  baseUrl: '',
  apiKey: '',
  temperature: 0.7,
  remark: '',
})

const q = ref('')
const items = ref<AdminModelItem[]>([])
const total = ref(0)
const page = ref(1)
const size = ref(200) // 加载更多，减少分页干扰
const loading = ref(false)
const visible = ref(false)
const editingId = ref<string | null>(null)
const form = ref<ModelForm>(createEmptyForm())
let searchTimer: ReturnType<typeof setTimeout> | null = null

// 三列选中状态
const selectedProvider = ref<string | null>(null)
const selectedId = ref<string | null>(null)

const groupedItems = computed(() => groupModelsByProvider(items.value))

const currentItems = computed(() => {
  if (!selectedProvider.value) return []
  const g = groupedItems.value.find(g => g.provider === selectedProvider.value)
  return g ? g.items : []
})

const selectedModel = computed(() =>
  selectedId.value
    ? (items.value.find(m => m.id === selectedId.value) ?? null)
    : null
)

const selectProvider = (provider: string) => {
  selectedProvider.value = provider
  selectedId.value = null
}

const selectModel = (row: AdminModelItem) => {
  selectedId.value = row.id
}

const load = async () => {
  loading.value = true
  try {
    const result = await adminAPI.listModels(q.value, page.value, size.value)
    items.value = result.items
    total.value = result.total
    // 自动选中第一个提供商
    if (!selectedProvider.value && groupedItems.value.length) {
      selectedProvider.value = groupedItems.value[0].provider
    }
  } catch (err: any) {
    ElMessage.error(err?.message || '模型列表加载失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  page.value = 1
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(load, 250)
}

const handlePageChange = (nextPage: number) => {
  page.value = nextPage
  load()
}

const openCreate = () => {
  editingId.value = null
  form.value = createEmptyForm()
  visible.value = true
}

const openEdit = (row: AdminModelItem) => {
  editingId.value = row.id
  form.value = {
    modelId: row.modelId,
    name: row.name,
    provider: row.provider || '',
    baseUrl: row.baseUrl || '',
    apiKey: '',
    temperature: row.temperature ?? 0.7,
    remark: row.remark || '',
  }
  visible.value = true
}

const save = async () => {
  if (!form.value.name || !form.value.modelId) {
    ElMessage.warning('请先填写模型名称和模型标识')
    return
  }
  try {
    if (editingId.value) {
      await adminAPI.updateModel(editingId.value, form.value)
      ElMessage.success('模型已更新')
    } else {
      await adminAPI.createModel(form.value)
      ElMessage.success('模型已创建')
    }
    visible.value = false
    await load()
  } catch (err: any) {
    ElMessage.error(err?.message || '保存失败')
  }
}

const toggle = async (row: AdminModelItem) => {
  try {
    await adminAPI.toggleModel(row.id, !row.enabled)
    ElMessage.success(row.enabled ? '模型已禁用' : '模型已启用')
    await load()
  } catch (err: any) {
    ElMessage.error(err?.message || '状态更新失败')
  }
}

const setDefault = async (row: AdminModelItem) => {
  try {
    await adminAPI.setDefaultModel(row.id)
    ElMessage.success('默认模型已更新')
    await load()
  } catch (err: any) {
    ElMessage.error(err?.message || '设置默认模型失败')
  }
}

const testModel = async (row: AdminModelItem) => {
  try {
    const result: any = await adminAPI.testModel(row.id)
    if (result?.success === false) {
      ElMessage.error(result?.message || '连接测试失败')
      return
    }
    ElMessage.success('连接测试成功')
  } catch (err: any) {
    ElMessage.error(err?.message || '连接测试失败')
  }
}

const removeModel = async (row: AdminModelItem) => {
  try {
    await ElMessageBox.confirm(
      `确认删除「${row.name}」？此操作不可撤销。`,
      '删除确认',
      { type: 'warning', confirmButtonText: '删除', cancelButtonText: '取消' }
    )
    await adminAPI.deleteModel(row.id)
    ElMessage.success('模型已删除')
    selectedId.value = null
    await load()
  } catch {
    // 取消
  }
}

onMounted(load)
</script>

<style scoped>
.admin-models {
  display: flex;
  flex-direction: column;
  /* Break out of body-inner padding to fill full height */
  margin: -40px -44px;
  height: calc(100% + 80px);
  overflow: hidden;
  gap: 0;
}

/* ── Header ── */
.page-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 24px 28px 16px;
  flex-shrink: 0;
  flex-wrap: wrap;
}

.head-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.page-title {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--text-primary);
}

.total-badge {
  font-size: 12px;
  color: var(--text-muted);
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 99px;
  padding: 2px 9px;
}

.head-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* Search */
.search-wrap {
  position: relative;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
  font-size: 13px;
}

.search-input {
  width: 220px;
  padding: 8px 14px 8px 34px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 9px;
  color: var(--text-primary);
  font-family: inherit;
  font-size: 13px;
  outline: none;
  transition: border-color 0.15s;
}

.search-input::placeholder { color: var(--text-muted); }
.search-input:focus { border-color: rgba(168,199,250,0.4); }

/* Buttons */
.primary-btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 8px 15px;
  background: var(--accent-primary);
  color: #0a0a0a;
  border: none;
  border-radius: 9px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.15s;
  white-space: nowrap;
}
.primary-btn:hover { opacity: 0.88; }

/* ── 三列容器 ── */
.three-col {
  display: grid;
  grid-template-columns: 180px 240px 1fr;
  flex: 1;
  overflow: hidden;
  border-top: 1px solid rgba(255,255,255,0.08);
  border-bottom: 1px solid rgba(255,255,255,0.08);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.02);
}

/* ── 列通用 ── */
.col-providers,
.col-models,
.col-detail {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-right: 1px solid rgba(255,255,255,0.08);
  background: rgba(255, 255, 255, 0.022);
}
.col-detail { border-right: none; }

.col-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px 10px;
  flex-shrink: 0;
  border-bottom: 1px solid rgba(255,255,255,0.05);
}

.col-head-title {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.07em;
}

.col-head-count {
  font-size: 10px;
  color: var(--text-muted);
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 99px;
  padding: 1px 6px;
}

/* ── 提供商列表 ── */
.provider-list {
  flex: 1;
  overflow-y: auto;
  padding: 6px 8px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.provider-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 10px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 13px;
  font-family: inherit;
  text-align: left;
  transition: background 0.14s, color 0.14s;
  gap: 8px;
}
.provider-item:hover { background: rgba(255,255,255,0.05); color: var(--text-primary); }
.provider-item.active { background: rgba(168,199,250,0.08); color: var(--accent-primary); }

.provider-name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.provider-count {
  font-size: 10.5px;
  color: var(--text-muted);
  background: rgba(255,255,255,0.05);
  border-radius: 99px;
  padding: 1px 6px;
  flex-shrink: 0;
}
.provider-item.active .provider-count { background: rgba(168,199,250,0.12); color: var(--accent-primary); }

.col-empty {
  padding: 20px 10px;
  font-size: 12px;
  color: var(--text-muted);
  text-align: center;
  line-height: 1.6;
}

/* ── 模型列表 ── */
.model-list {
  flex: 1;
  overflow-y: auto;
  padding: 6px 8px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.model-item {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 9px 10px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  text-align: left;
  font-family: inherit;
  transition: background 0.14s, color 0.14s;
}
.model-item:hover { background: rgba(255,255,255,0.05); color: var(--text-primary); }
.model-item.active { background: rgba(168,199,250,0.08); color: var(--text-primary); }

.model-item-main {
  display: flex;
  align-items: center;
  gap: 5px;
}
.model-item-name {
  font-size: 12.5px;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}
.model-item-id {
  font-size: 11px;
  color: var(--text-muted);
  font-family: 'SF Mono', 'Fira Code', monospace;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ── 徽章 ── */
.badge-official {
  display: inline-flex;
  align-items: center;
  padding: 1px 5px;
  border-radius: 99px;
  font-size: 9.5px;
  font-weight: 600;
  background: rgba(168,199,250,0.1);
  color: var(--accent-primary);
  border: 1px solid rgba(168,199,250,0.18);
  flex-shrink: 0;
  letter-spacing: 0.02em;
}

.badge-default {
  display: inline-flex;
  align-items: center;
  padding: 1px 5px;
  border-radius: 99px;
  font-size: 9.5px;
  font-weight: 600;
  background: rgba(251,191,36,0.1);
  color: #fbbf24;
  border: 1px solid rgba(251,191,36,0.2);
  flex-shrink: 0;
}

/* 状态点 */
.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(239,68,68,0.7);
  flex-shrink: 0;
  margin-left: auto;
}
.status-dot.active { background: rgba(34,197,94,0.8); }

/* ── 详情面板 ── */
.col-detail {
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.detail-head {
  padding: 22px 24px 16px;
  border-bottom: 1px solid rgba(255,255,255,0.05);
  flex-shrink: 0;
}

.detail-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 5px;
}

.detail-title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.02em;
}

.detail-sub {
  margin: 0 0 10px;
  font-size: 12px;
  color: var(--text-muted);
  font-family: 'SF Mono', 'Fira Code', monospace;
}

.detail-status-bar {
  display: flex;
  align-items: center;
  gap: 6px;
}

.status-text {
  font-size: 12px;
  color: rgba(239,68,68,0.8);
}
.status-text.active { color: rgba(74,222,128,0.9); }

/* 信息行 */
.detail-body {
  padding: 16px 24px;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.info-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 11px 0;
  border-bottom: 1px solid rgba(255,255,255,0.04);
}
.info-row:last-child { border-bottom: none; }

.info-label {
  font-size: 12.5px;
  color: var(--text-secondary);
  font-weight: 500;
  flex-shrink: 0;
}

.info-value {
  font-size: 12.5px;
  color: var(--text-primary);
  text-align: right;
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: break-all;
}

.info-value.mono {
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-size: 11.5px;
}

/* 操作按钮 */
.detail-actions {
  padding: 0 24px 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  flex-shrink: 0;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 13px;
  border-radius: 8px;
  border: 1px solid rgba(255,255,255,0.09);
  background: rgba(255,255,255,0.04);
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 12.5px;
  font-family: inherit;
  font-weight: 500;
  transition: all 0.16s;
  white-space: nowrap;
}
.action-btn:hover:not(:disabled) { background: rgba(255,255,255,0.09); color: var(--text-primary); }
.action-btn:disabled { opacity: 0.4; cursor: not-allowed; }

.action-btn.accent {
  border-color: rgba(168,199,250,0.2);
  color: var(--accent-primary);
}
.action-btn.accent:hover:not(:disabled) { background: rgba(168,199,250,0.1); }

.action-btn.danger {
  border-color: rgba(248,113,113,0.15);
  color: rgba(248,113,113,0.8);
}
.action-btn.danger:hover:not(:disabled) {
  background: rgba(239,68,68,0.1);
  border-color: rgba(239,68,68,0.3);
  color: #f87171;
}

.detail-placeholder {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  color: var(--text-muted);
  padding: 40px;
}
.detail-placeholder i { font-size: 32px; opacity: 0.2; }
.detail-placeholder p { margin: 0; font-size: 13px; text-align: center; line-height: 1.7; opacity: 0.6; }

/* ── Pagination ── */
.pagination {
  display: flex;
  justify-content: center;
  padding: 14px 24px;
  border-top: 1px solid rgba(255,255,255,0.05);
  flex-shrink: 0;
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
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.22s; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }

.dialog-box {
  width: 560px;
  max-width: 96vw;
  background: rgba(20, 20, 23, 0.97);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 25px 60px rgba(0,0,0,0.6);
}

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 22px;
  border-bottom: 1px solid rgba(255,255,255,0.07);
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.close-btn {
  background: none; border: none;
  color: var(--text-muted); cursor: pointer;
  font-size: 15px; padding: 4px;
  transition: color 0.16s;
}
.close-btn:hover { color: var(--text-primary); }

.dialog-body {
  padding: 18px 22px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.form-group label {
  font-size: 12.5px;
  color: var(--text-secondary);
  font-weight: 500;
}
.required { color: #ef4444; }

.form-input {
  height: 36px;
  padding: 0 11px;
  border-radius: 9px;
  border: 1px solid rgba(255,255,255,0.09);
  background: rgba(255,255,255,0.04);
  color: var(--text-primary);
  font-family: inherit;
  font-size: 13px;
  outline: none;
  transition: border-color 0.15s;
  width: 100%;
  box-sizing: border-box;
}
.form-input:focus { border-color: rgba(168,199,250,0.4); }

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 14px 22px;
  border-top: 1px solid rgba(255,255,255,0.07);
}

.cancel-btn {
  height: 36px; padding: 0 15px;
  border-radius: 9px;
  border: 1px solid rgba(255,255,255,0.09);
  background: rgba(255,255,255,0.04);
  color: var(--text-secondary);
  cursor: pointer; font-size: 13px; font-family: inherit;
  transition: all 0.15s;
}
.cancel-btn:hover { background: rgba(255,255,255,0.08); }

.submit-btn {
  height: 36px; padding: 0 16px;
  border-radius: 9px;
  border: 1px solid rgba(168,199,250,0.22);
  background: rgba(168,199,250,0.1);
  color: var(--accent-primary);
  cursor: pointer; font-size: 13px; font-family: inherit; font-weight: 500;
  display: flex; align-items: center; gap: 6px;
  transition: all 0.15s;
}
.submit-btn:hover { background: rgba(168,199,250,0.18); }

/* 滚动条 */
.provider-list::-webkit-scrollbar,
.model-list::-webkit-scrollbar,
.col-detail::-webkit-scrollbar { width: 3px; }
.provider-list::-webkit-scrollbar-thumb,
.model-list::-webkit-scrollbar-thumb,
.col-detail::-webkit-scrollbar-thumb {
  background: rgba(255,255,255,0.1); border-radius: 99px;
}

@media (max-width: 1100px) {
  .three-col { grid-template-columns: 160px 200px 1fr; }
}
</style>
