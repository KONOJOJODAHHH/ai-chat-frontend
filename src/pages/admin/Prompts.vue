<template>
  <div class="admin-page">
    <div class="page-header glass-card">
      <div class="header-content">
        <div class="header-title">
          <i class="fa-solid fa-wand-magic-sparkles"></i>
          <h1>Prompt管理</h1>
        </div>
        <button class="primary-btn" @click="openCreate">
          <i class="fa-solid fa-plus"></i>
          <span>新增Prompt</span>
        </button>
      </div>
    </div>

    <div class="prompts-grid">
      <div v-for="row in items" :key="row.id" class="prompt-card glass-card">
        <div class="prompt-header">
          <div class="prompt-icon">
            <i class="fa-solid fa-sparkles"></i>
          </div>
          <h3>{{ row.title }}</h3>
        </div>
        <div class="prompt-content">
          {{ row.content }}
        </div>
        <div class="prompt-actions">
          <button class="action-btn" @click="openEdit(row)">
            <i class="fa-solid fa-edit"></i>
            <span>编辑</span>
          </button>
          <button class="action-btn danger" @click="remove(row)">
            <i class="fa-solid fa-trash"></i>
            <span>删除</span>
          </button>
        </div>
      </div>
    </div>

    <div v-if="items.length === 0" class="empty-state">
      <i class="fa-solid fa-wand-magic-sparkles"></i>
      <p>暂无Prompt模板</p>
      <button class="primary-btn" @click="openCreate">
        <i class="fa-solid fa-plus"></i>
        <span>创建第一个Prompt</span>
      </button>
    </div>

    <el-dialog v-model="visible" :title="editingId ? '编辑Prompt' : '新增Prompt'" width="700px" class="admin-dialog">
      <div class="dialog-form">
        <div class="form-group">
          <label class="form-label">
            <i class="fa-solid fa-heading"></i>
            <span>标题</span>
          </label>
          <input v-model="form.title" class="form-input" placeholder="输入Prompt标题" />
        </div>
        <div class="form-group">
          <label class="form-label">
            <i class="fa-solid fa-align-left"></i>
            <span>内容</span>
          </label>
          <textarea v-model="form.content" class="form-textarea" rows="8" placeholder="输入Prompt内容"></textarea>
        </div>
      </div>
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

const items = ref<any[]>([])
const visible = ref(false)
const editingId = ref<string | null>(null)
const form = ref<any>({ title: '', content: '' })

const load = async () => { 
  try {
    items.value = await adminAPI.listPrompts()
  } catch (e) {
    ElMessage.error('加载失败')
  }
}

const openCreate = () => { 
  editingId.value = null
  form.value = { title: '', content: '' }
  visible.value = true 
}

const openEdit = (row: any) => { 
  editingId.value = row.id
  form.value = { title: row.title, content: row.content }
  visible.value = true 
}

const save = async () => { 
  try {
    if (editingId.value) {
      await adminAPI.updatePrompt(editingId.value, form.value)
      ElMessage.success('更新成功')
    } else {
      await adminAPI.createPrompt(form.value)
      ElMessage.success('创建成功')
    }
    visible.value = false
    await load()
  } catch (e) {
    ElMessage.error('保存失败')
  }
}

const remove = async (row: any) => { 
  try {
    await adminAPI.deletePrompt(row.id)
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

.prompts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.prompt-card {
  padding: 20px;
  border-radius: 16px;
  transition: all 0.3s var(--ease-out);
  display: flex;
  flex-direction: column;
}

.prompt-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.prompt-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--glass-border);
}

.prompt-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-hover));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: #0a0a0a;
}

.prompt-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.prompt-content {
  flex: 1;
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 16px;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.prompt-actions {
  display: flex;
  gap: 8px;
  padding-top: 16px;
  border-top: 1px solid var(--glass-border);
}

.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
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

.action-btn.danger:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border-color: #ef4444;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  color: var(--text-muted);
}

.empty-state i {
  font-size: 64px;
  margin-bottom: 20px;
  opacity: 0.3;
}

.empty-state p {
  font-size: 16px;
  margin: 0 0 24px 0;
}

.dialog-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.form-label i {
  font-size: 16px;
  color: var(--accent-primary);
}

.form-input,
.form-textarea {
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--glass-border);
  border-radius: 10px;
  color: var(--text-primary);
  font-size: 14px;
  transition: all 0.2s;
  font-family: inherit;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  background: rgba(255, 255, 255, 0.08);
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px rgba(168, 199, 250, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 120px;
}

.dialog-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

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
</style>