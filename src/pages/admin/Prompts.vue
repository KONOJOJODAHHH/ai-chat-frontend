<template>
  <div class="admin-page">
    <div class="page-header glass-card">
      <div class="header-content">
        <div class="header-title">
          <i class="fa-solid fa-wand-magic-sparkles"></i>
          <div>
            <h1>Prompt 管理</h1>
            <p>维护系统预置提示词</p>
          </div>
        </div>

        <button class="primary-btn" @click="openCreate">
          <i class="fa-solid fa-plus"></i>
          <span>新增 Prompt</span>
        </button>
      </div>
    </div>

    <div v-if="items.length" class="prompts-grid">
      <div v-for="row in items" :key="row.id" class="prompt-card glass-card">
        <div class="prompt-header">
          <div class="prompt-icon">
            <i class="fa-solid fa-sparkles"></i>
          </div>
          <div>
            <h3>{{ row.title }}</h3>
            <p>ID：{{ row.id }}</p>
          </div>
        </div>

        <div class="prompt-content">{{ row.content }}</div>

        <div class="prompt-actions">
          <button class="action-btn" @click="openEdit(row)">
            <i class="fa-solid fa-pen"></i>
            <span>编辑</span>
          </button>
          <button class="action-btn danger" @click="remove(row)">
            <i class="fa-solid fa-trash"></i>
            <span>删除</span>
          </button>
        </div>
      </div>
    </div>

    <div v-else class="empty-state glass-card">
      <i class="fa-solid fa-wand-magic-sparkles"></i>
      <p>暂无 Prompt 模板</p>
    </div>

    <el-dialog v-model="visible" :title="editingId ? '编辑 Prompt' : '新增 Prompt'" width="720px">
      <div class="dialog-form">
        <div class="form-group">
          <label class="form-label">标题</label>
          <input v-model="form.title" class="form-input" placeholder="请输入标题" />
        </div>
        <div class="form-group">
          <label class="form-label">内容</label>
          <textarea v-model="form.content" rows="8" class="form-textarea" placeholder="请输入 Prompt 内容"></textarea>
        </div>
      </div>

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
import { adminAPI, type AdminPromptItem } from '@/utils/api'

const items = ref<AdminPromptItem[]>([])
const visible = ref(false)
const editingId = ref<string | null>(null)
const form = ref({ title: '', content: '' })

const load = async () => {
  try {
    items.value = await adminAPI.listPrompts()
  } catch (loadError: any) {
    ElMessage.error(loadError?.message || 'Prompt 列表加载失败')
  }
}

const openCreate = () => {
  editingId.value = null
  form.value = { title: '', content: '' }
  visible.value = true
}

const openEdit = (row: AdminPromptItem) => {
  editingId.value = row.id
  form.value = { title: row.title, content: row.content }
  visible.value = true
}

const save = async () => {
  if (!form.value.title || !form.value.content) {
    ElMessage.warning('请先填写标题和内容')
    return
  }

  try {
    if (editingId.value) {
      await adminAPI.updatePrompt(editingId.value, form.value)
      ElMessage.success('Prompt 已更新')
    } else {
      await adminAPI.createPrompt(form.value)
      ElMessage.success('Prompt 已创建')
    }
    visible.value = false
    await load()
  } catch (saveError: any) {
    ElMessage.error(saveError?.message || '保存失败')
  }
}

const remove = async (row: AdminPromptItem) => {
  try {
    await adminAPI.deletePrompt(row.id)
    ElMessage.success('Prompt 已删除')
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
.prompt-card,
.empty-state {
  border-radius: 16px;
}

.page-header {
  padding: 24px;
  margin-bottom: 24px;
}

.header-content,
.prompt-actions,
.dialog-footer {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
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
}

.header-title p {
  margin: 6px 0 0;
  color: var(--text-muted);
  font-size: 14px;
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
  color: var(--text-secondary);
  border: 1px solid var(--glass-border);
}

.action-btn.danger {
  color: #f87171;
  border-color: rgba(248, 113, 113, 0.2);
}

.prompts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 20px;
}

.prompt-card {
  padding: 20px;
  display: flex;
  flex-direction: column;
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
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #0a0a0a;
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-hover));
}

.prompt-header h3,
.prompt-header p {
  margin: 0;
}

.prompt-header p {
  margin-top: 4px;
  color: var(--text-muted);
  font-size: 12px;
}

.prompt-content {
  flex: 1;
  color: var(--text-secondary);
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.6;
  margin-bottom: 16px;
}

.prompt-actions {
  justify-content: flex-end;
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

.dialog-form {
  display: grid;
  gap: 16px;
}

.form-group {
  display: grid;
  gap: 8px;
}

.form-label {
  color: var(--text-primary);
  font-weight: 600;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 12px 14px;
  border-radius: 10px;
  border: 1px solid var(--glass-border);
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-primary);
}

.form-textarea {
  resize: vertical;
}

:deep(.el-dialog) {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
}

:deep(.el-dialog__title) {
  color: var(--text-primary);
}
</style>