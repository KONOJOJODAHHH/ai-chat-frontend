<template>
  <div class="admin-page">
    <div class="page-header glass-card">
      <div class="header-content">
        <div class="header-title">
          <i class="fa-solid fa-microchip"></i>
          <h1>模型管理</h1>
        </div>

        <div class="header-actions">
          <div class="search-box">
            <i class="fa-solid fa-search"></i>
            <input v-model.trim="q" placeholder="搜索模型名称或 modelId" @input="handleSearch" />
          </div>
          <button class="primary-btn" @click="openCreate">
            <i class="fa-solid fa-plus"></i>
            <span>新增模型</span>
          </button>
        </div>
      </div>
    </div>

    <div v-if="items.length" class="models-grid">
      <div v-for="row in items" :key="row.id" class="model-card glass-card">
        <div class="model-header">
          <div>
            <h3>{{ row.name }}</h3>
            <div class="model-tags">
              <span class="tag">{{ row.modelId }}</span>
              <span class="tag tag-provider">{{ row.provider || '未设置提供商' }}</span>
              <span class="tag" :class="row.enabled ? 'tag-success' : 'tag-muted'">
                {{ row.enabled ? '已启用' : '已禁用' }}
              </span>
              <span v-if="row.isDefault" class="tag tag-default">默认模型</span>
            </div>
          </div>
        </div>

        <div class="model-body">
          <div class="model-field">
            <label>接口地址</label>
            <div class="field-value">{{ row.baseUrl || '--' }}</div>
          </div>
          <div class="model-field">
            <label>温度参数</label>
            <div class="field-value">{{ row.temperature ?? '--' }}</div>
          </div>
          <div class="model-field">
            <label>备注</label>
            <div class="field-value">{{ row.remark || '--' }}</div>
          </div>
        </div>

        <div class="model-actions">
          <button class="action-btn" @click="openEdit(row)">
            <i class="fa-solid fa-pen"></i>
            <span>编辑</span>
          </button>
          <button class="action-btn" @click="toggle(row)">
            <i :class="row.enabled ? 'fa-solid fa-toggle-on' : 'fa-solid fa-toggle-off'"></i>
            <span>{{ row.enabled ? '禁用' : '启用' }}</span>
          </button>
          <button class="action-btn" :class="{ primary: row.isDefault }" @click="setDefault(row)">
            <i class="fa-solid fa-star"></i>
            <span>设为默认</span>
          </button>
          <button class="action-btn" @click="test(row)">
            <i class="fa-solid fa-plug"></i>
            <span>测试连接</span>
          </button>
          <button class="action-btn danger" @click="remove(row)">
            <i class="fa-solid fa-trash"></i>
            <span>删除</span>
          </button>
        </div>
      </div>
    </div>

    <div v-else class="empty-state glass-card">
      <i class="fa-solid fa-microchip"></i>
      <p>{{ loading ? '加载中...' : '暂无模型数据' }}</p>
    </div>

    <div class="pagination" v-if="total > size">
      <el-pagination
        layout="prev, pager, next"
        :total="total"
        :page-size="size"
        :current-page="page"
        @current-change="handlePageChange"
      />
    </div>

    <el-dialog v-model="visible" :title="editingId ? '编辑模型' : '新增模型'" width="640px">
      <el-form label-position="top">
        <div class="form-grid">
          <el-form-item label="模型名称">
            <el-input v-model="form.name" placeholder="例如：Qwen 3.5 Flash" />
          </el-form-item>
          <el-form-item label="模型标识">
            <el-input v-model="form.modelId" placeholder="例如：qwen3.5-flash" />
          </el-form-item>
        </div>

        <div class="form-grid">
          <el-form-item label="提供商">
            <el-input v-model="form.provider" placeholder="例如：Alibaba Cloud" />
          </el-form-item>
          <el-form-item label="温度参数">
            <el-input-number v-model="form.temperature" :min="0" :max="2" :step="0.1" style="width: 100%" />
          </el-form-item>
        </div>

        <el-form-item label="接口地址">
          <el-input v-model="form.baseUrl" placeholder="https://dashscope.aliyuncs.com/compatible-mode/v1" />
        </el-form-item>

        <el-form-item label="API Key">
          <el-input v-model="form.apiKey" type="password" show-password placeholder="请输入 API Key" />
        </el-form-item>

        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="可选备注" />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <button class="secondary-btn" @click="visible = false">取消</button>
          <button class="primary-btn" @click="save">保存</button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { adminAPI, type AdminModelItem } from '@/utils/api'

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
const size = ref(10)
const loading = ref(false)
const visible = ref(false)
const editingId = ref<string | null>(null)
const form = ref<ModelForm>(createEmptyForm())
let searchTimer: ReturnType<typeof setTimeout> | null = null

const load = async () => {
  loading.value = true
  try {
    const result = await adminAPI.listModels(q.value, page.value, size.value)
    items.value = result.items
    total.value = result.total
  } catch (loadError: any) {
    ElMessage.error(loadError?.message || '模型列表加载失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  page.value = 1
  if (searchTimer) {
    clearTimeout(searchTimer)
  }
  searchTimer = setTimeout(() => {
    load()
  }, 250)
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
    apiKey: row.apiKey || '',
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
  } catch (saveError: any) {
    ElMessage.error(saveError?.message || '保存失败')
  }
}

const toggle = async (row: AdminModelItem) => {
  try {
    await adminAPI.toggleModel(row.id, !row.enabled)
    ElMessage.success(row.enabled ? '模型已禁用' : '模型已启用')
    await load()
  } catch (actionError: any) {
    ElMessage.error(actionError?.message || '状态更新失败')
  }
}

const setDefault = async (row: AdminModelItem) => {
  try {
    await adminAPI.setDefaultModel(row.id)
    ElMessage.success('默认模型已更新')
    await load()
  } catch (actionError: any) {
    ElMessage.error(actionError?.message || '设置默认模型失败')
  }
}

const test = async (row: AdminModelItem) => {
  try {
    const result: any = await adminAPI.testModel(row.id)
    if (result?.success === false) {
      ElMessage.error(result?.message || '连接测试失败')
      return
    }
    ElMessage.success('连接测试成功')
  } catch (actionError: any) {
    ElMessage.error(actionError?.message || '连接测试失败')
  }
}

const remove = async (row: AdminModelItem) => {
  try {
    await adminAPI.deleteModel(row.id)
    ElMessage.success('模型已删除')
    await load()
  } catch (actionError: any) {
    ElMessage.error(actionError?.message || '删除失败')
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
.model-card,
.empty-state {
  border-radius: 16px;
}

.page-header {
  padding: 24px;
  margin-bottom: 24px;
}

.header-content,
.header-actions,
.model-actions,
.dialog-footer {
  display: flex;
  gap: 12px;
}

.header-content {
  justify-content: space-between;
  align-items: center;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 14px;
}

.header-title i {
  color: var(--accent-primary);
  font-size: 28px;
}

.header-title h1 {
  margin: 0;
  color: var(--text-primary);
  font-size: var(--page-title-size);
  font-weight: var(--page-title-weight);
}

.search-box {
  position: relative;
}

.search-box i {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
}

.search-box input {
  width: 260px;
  padding: 10px 14px 10px 40px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid var(--glass-border);
  border-radius: 10px;
  color: var(--text-primary);
  font-family: inherit;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}

.search-box input::placeholder {
  color: var(--text-muted);
}

.search-box input:hover {
  border-color: rgba(168, 199, 250, 0.3);
}

.search-box input:focus {
  border-color: var(--accent-primary);
}

.primary-btn,
.secondary-btn,
.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 10px;
  cursor: pointer;
}

.primary-btn {
  background: var(--accent-primary);
  color: #0a0a0a;
  border: none;
}

.secondary-btn,
.action-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--glass-border);
  color: var(--text-secondary);
}

.action-btn.primary {
  color: var(--accent-primary);
  border-color: rgba(168, 199, 250, 0.4);
}

.action-btn.danger {
  color: #f87171;
  border-color: rgba(248, 113, 113, 0.2);
}

.models-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 20px;
}

.model-card {
  padding: 20px;
}

.model-header {
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--glass-border);
}

.model-header h3 {
  margin: 0 0 10px;
  color: var(--text-primary);
}

.model-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
  color: var(--text-secondary);
  font-size: 12px;
}

.tag-provider {
  color: var(--accent-primary);
}

.tag-success {
  color: #22c55e;
}

.tag-muted {
  color: #f87171;
}

.tag-default {
  color: #fbbf24;
}

.model-body {
  display: grid;
  gap: 12px;
}

.model-field label {
  display: block;
  margin-bottom: 4px;
  color: var(--text-muted);
  font-size: 12px;
}

.field-value {
  color: var(--text-secondary);
  word-break: break-all;
}

.model-actions {
  flex-wrap: wrap;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--glass-border);
}

.empty-state {
  padding: 60px 20px;
  text-align: center;
  color: var(--text-muted);
}

.empty-state i {
  font-size: 48px;
  margin-bottom: 12px;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

:deep(.el-dialog) {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
}

:deep(.el-dialog__title),
:deep(.el-form-item__label) {
  color: var(--text-primary);
}

:deep(.el-input__wrapper),
:deep(.el-textarea__inner),
:deep(.el-input-number .el-input__wrapper) {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--glass-border);
  box-shadow: none;
}

:deep(.el-pagination) {
  --el-pagination-bg-color: transparent;
  --el-pagination-button-bg-color: rgba(255, 255, 255, 0.05);
  --el-pagination-hover-color: var(--accent-primary);
}

@media (max-width: 768px) {
  .header-content,
  .header-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .search-box input {
    width: 100%;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
