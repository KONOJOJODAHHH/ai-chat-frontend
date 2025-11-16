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
            <input v-model="q" placeholder="搜索模型" @input="load" />
          </div>
          <button class="primary-btn" @click="openCreate">
            <i class="fa-solid fa-plus"></i>
            <span>新增模型</span>
          </button>
        </div>
      </div>
    </div>

    <div class="models-grid">
      <div v-for="row in items" :key="row.id" class="model-card glass-card">
        <div class="model-header">
          <div class="model-info">
            <h3>{{ row.name }}</h3>
            <span class="model-type">{{ row.provider }}</span>
          </div>
          <div class="model-status">
            <span class="status-badge" :class="{ active: row.enabled }">
              <i class="fa-solid fa-circle"></i>
              {{ row.enabled ? '启用' : '禁用' }}
            </span>
          </div>
        </div>

        <div class="model-body">
          <div class="model-field">
            <label>API地址</label>
            <div class="field-value">{{ row.baseUrl }}</div>
          </div>
          <div class="model-field" v-if="row.remark">
            <label>备注</label>
            <div class="field-value">{{ row.remark }}</div>
          </div>
        </div>

        <div class="model-actions">
          <button class="action-btn" @click="openEdit(row)">
            <i class="fa-solid fa-edit"></i>
            <span>编辑</span>
          </button>
          <button class="action-btn" @click="toggle(row)">
            <i :class="row.enabled ? 'fa-solid fa-toggle-on' : 'fa-solid fa-toggle-off'"></i>
            <span>{{ row.enabled ? '禁用' : '启用' }}</span>
          </button>
          <button class="action-btn" @click="setDefault(row)" :class="{ primary: row.isDefault }">
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

    <div class="pagination" v-if="total > size">
      <el-pagination 
        layout="prev, pager, next" 
        :total="total" 
        :page-size="size" 
        :current-page="page" 
        @current-change="p=>{page=p;load()}" 
      />
    </div>

    <el-dialog v-model="visible" :title="editingId ? '编辑模型' : '新增模型'" width="600px" class="admin-dialog">
      <el-form :model="form" label-width="120px" label-position="top">
        <el-form-item label="模型名称">
          <el-input v-model="form.name" placeholder="例如：DeepSeek-Chat" />
        </el-form-item>
        <el-form-item label="类型">
          <el-input v-model="form.provider" placeholder="例如：deepseek" />
        </el-form-item>
        <el-form-item label="API基础地址">
          <el-input v-model="form.baseUrl" placeholder="https://api.deepseek.com" />
        </el-form-item>
        <el-form-item label="API Key">
          <el-input v-model="form.apiKey" type="password" show-password placeholder="输入API密钥" />
        </el-form-item>
        <div class="form-row">
          <el-form-item label="请求方式" class="half">
            <el-select v-model="form.method" style="width: 100%">
              <el-option label="POST" value="POST" />
              <el-option label="GET" value="GET" />
            </el-select>
          </el-form-item>
          <el-form-item label="Temperature" class="half">
            <el-input-number v-model="form.temperature" :min="0" :max="1" :step="0.1" style="width: 100%" />
          </el-form-item>
        </div>
        <el-form-item label="是否启用">
          <el-switch v-model="form.enabled" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="模型描述或备注信息" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <button class="secondary-btn" @click="visible=false">取消</button>
          <button class="primary-btn" @click="save">
            <i class="fa-solid fa-check"></i>
            <span>保存</span>
          </button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { adminAPI } from '@/utils/api'
import { ElMessage } from 'element-plus'

const q = ref('')
const items = ref<any[]>([])
const total = ref(0)
const page = ref(1)
const size = ref(10)
const visible = ref(false)
const editingId = ref<string | null>(null)
const form = ref<any>({ name: '', provider: '', baseUrl: '', apiKey: '', method: 'POST', temperature: 0.7, enabled: true, remark: '' })

const load = async () => { 
  try {
    const res: any = await adminAPI.listModels(q.value, page.value, size.value)
    items.value = res.items
    total.value = res.total
  } catch (e) {
    ElMessage.error('加载失败')
  }
}

const openCreate = () => { 
  editingId.value = null
  form.value = { name: '', provider: '', baseUrl: '', apiKey: '', method: 'POST', temperature: 0.7, enabled: true, remark: '' }
  visible.value = true 
}

const openEdit = (row: any) => { 
  editingId.value = row.id
  form.value = { ...row }
  visible.value = true 
}

const save = async () => { 
  try {
    if (editingId.value) {
      await adminAPI.updateModel(editingId.value, form.value)
      ElMessage.success('更新成功')
    } else {
      await adminAPI.createModel(form.value)
      ElMessage.success('创建成功')
    }
    visible.value = false
    await load()
  } catch (e) {
    ElMessage.error('保存失败')
  }
}

const toggle = async (row: any) => { 
  try {
    await adminAPI.toggleModel(row.id, !row.enabled)
    ElMessage.success(row.enabled ? '已禁用' : '已启用')
    await load()
  } catch (e) {
    ElMessage.error('操作失败')
  }
}

const setDefault = async (row: any) => { 
  try {
    await adminAPI.setDefaultModel(row.id)
    ElMessage.success('已设为默认模型')
    await load()
  } catch (e) {
    ElMessage.error('操作失败')
  }
}

const test = async (row: any) => { 
  try {
    await adminAPI.testModel(row.id)
    ElMessage.success('连接成功')
  } catch (e) {
    ElMessage.error('连接失败')
  }
}

const remove = async (row: any) => { 
  try {
    await adminAPI.deleteModel(row.id)
    ElMessage.success('删除成功')
    await load()
  } catch (e) {
    ElMessage.error('删除失败')
  }
}

onMounted(load)
</script>

<style scoped>
.admin-page {
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  padding: 24px;
  margin-bottom: 24px;
  border-radius: 16px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-title i {
  font-size: 28px;
  color: var(--accent-primary);
}

.header-title h1 {
  font-size: 24px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
}

.search-box i {
  position: absolute;
  left: 16px;
  color: var(--text-muted);
  font-size: 14px;
}

.search-box input {
  width: 240px;
  padding: 10px 16px 10px 40px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--glass-border);
  border-radius: 10px;
  color: var(--text-primary);
  font-size: 14px;
  transition: all 0.2s;
}

.search-box input:focus {
  background: rgba(255, 255, 255, 0.08);
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px rgba(168, 199, 250, 0.1);
}

.search-box input::placeholder {
  color: var(--text-muted);
}

.primary-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: var(--accent-primary);
  color: #0a0a0a;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.primary-btn:hover {
  background: var(--accent-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(168, 199, 250, 0.3);
}

.secondary-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-primary);
  border: 1px solid var(--glass-border);
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.secondary-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: var(--accent-primary);
}

.models-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.model-card {
  padding: 20px;
  border-radius: 16px;
  transition: all 0.3s var(--ease-out);
}

.model-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.model-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--glass-border);
}

.model-info h3 {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 8px 0;
}

.model-type {
  display: inline-block;
  padding: 4px 10px;
  background: rgba(168, 199, 250, 0.1);
  border: 1px solid rgba(168, 199, 250, 0.2);
  border-radius: 6px;
  font-size: 12px;
  color: var(--accent-primary);
  font-weight: 500;
}

.status-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
  background: rgba(107, 114, 128, 0.2);
  color: var(--text-muted);
}

.status-badge.active {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.status-badge i {
  font-size: 8px;
}

.model-body {
  margin-bottom: 16px;
}

.model-field {
  margin-bottom: 12px;
}

.model-field:last-child {
  margin-bottom: 0;
}

.model-field label {
  display: block;
  font-size: 12px;
  color: var(--text-muted);
  margin-bottom: 4px;
  font-weight: 500;
}

.field-value {
  font-size: 13px;
  color: var(--text-secondary);
  word-break: break-all;
}

.model-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding-top: 16px;
  border-top: 1px solid var(--glass-border);
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--glass-border);
  border-radius: 8px;
  color: var(--text-secondary);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  color: var(--text-primary);
  border-color: var(--accent-primary);
}

.action-btn.primary {
  background: var(--accent-subtle);
  color: var(--accent-primary);
  border-color: var(--accent-primary);
}

.action-btn.danger:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border-color: #ef4444;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.dialog-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

/* Element Plus 样式覆盖 */
:deep(.el-dialog) {
  background: var(--glass-bg);
  backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
}

:deep(.el-dialog__header) {
  border-bottom: 1px solid var(--glass-border);
  padding: 20px 24px;
}

:deep(.el-dialog__title) {
  color: var(--text-primary);
  font-size: 18px;
  font-weight: 600;
}

:deep(.el-dialog__body) {
  padding: 24px;
}

:deep(.el-form-item__label) {
  color: var(--text-primary);
  font-weight: 500;
  margin-bottom: 8px;
}

:deep(.el-input__wrapper) {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--glass-border);
  box-shadow: none;
  border-radius: 10px;
}

:deep(.el-input__wrapper:hover) {
  background: rgba(255, 255, 255, 0.08);
}

:deep(.el-input__wrapper.is-focus) {
  background: rgba(255, 255, 255, 0.08);
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px rgba(168, 199, 250, 0.1);
}

:deep(.el-input__inner) {
  color: var(--text-primary);
}

:deep(.el-textarea__inner) {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--glass-border);
  color: var(--text-primary);
  border-radius: 10px;
}

:deep(.el-textarea__inner:focus) {
  background: rgba(255, 255, 255, 0.08);
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px rgba(168, 199, 250, 0.1);
}

:deep(.el-select .el-input__wrapper) {
  background: rgba(255, 255, 255, 0.05);
}

:deep(.el-input-number) {
  width: 100%;
}

:deep(.el-input-number .el-input__wrapper) {
  background: rgba(255, 255, 255, 0.05);
}

:deep(.el-pagination) {
  --el-pagination-bg-color: transparent;
  --el-pagination-button-bg-color: rgba(255, 255, 255, 0.05);
  --el-pagination-hover-color: var(--accent-primary);
}

:deep(.el-pagination button) {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--glass-border);
  color: var(--text-secondary);
}

:deep(.el-pagination button:hover) {
  color: var(--accent-primary);
  border-color: var(--accent-primary);
}

:deep(.el-pager li) {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--glass-border);
  color: var(--text-secondary);
  margin: 0 4px;
  border-radius: 6px;
}

:deep(.el-pager li:hover) {
  color: var(--accent-primary);
  border-color: var(--accent-primary);
}

:deep(.el-pager li.is-active) {
  background: var(--accent-primary);
  color: #0a0a0a;
  border-color: var(--accent-primary);
}
</style>