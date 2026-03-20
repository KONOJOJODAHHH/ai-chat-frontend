<template>
  <div class="prompts-page">
    <!-- Header -->
    <div class="page-head">
      <div class="head-left">
        <h1 class="page-title">快捷短语</h1>
      </div>
      <div class="head-actions">
        <div class="search-wrap">
          <i class="fa-solid fa-magnifying-glass search-icon"></i>
          <input
            v-model.trim="searchQuery"
            class="search-input"
            placeholder="搜索标题或内容…"
          />
        </div>
        <button class="create-btn" @click="openCreate">
          <i class="fa-solid fa-plus"></i>
          <span>新增提示词</span>
        </button>
        <button 
          v-if="selectedIds.length > 0"
          class="create-btn danger-batch" 
          @click="batchRemove"
        >
          <i class="fa-solid fa-trash-can"></i>
          <span>批量删除 ({{ selectedIds.length }})</span>
        </button>
      </div>
    </div>

    <!-- List -->
    <div class="prompt-table-container">
      <el-table 
        :data="filteredItems" 
        style="width: 100%"
        class="custom-dark-table"
        @selection-change="handleSelectionChange"
        empty-text="暂无提示词"
      >
        <el-table-column type="selection" width="50" />
        <el-table-column prop="title" label="标题" sortable width="250">
          <template #default="{ row }">
            <div class="cell-title">
              <span class="title-text">{{ row.title }}</span>
              <span class="id-badge">#{{ row.id }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="content" label="内容预览">
          <template #default="{ row }">
            <span class="cell-preview">{{ row.content }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180">
          <template #default="{ row }">
            <div class="cell-actions">
              <button class="row-btn" @click="openEdit(row)">
                <i class="fa-solid fa-pen"></i>
                <span>编辑</span>
              </button>
              <button class="row-btn danger" @click="remove(row)">
                <i class="fa-solid fa-trash-can"></i>
                <span>删除</span>
              </button>
            </div>
          </template>
        </el-table-column>
        <template #empty>
          <div class="empty-state">
            <i class="fa-solid fa-file-lines"></i>
            <p>暂无提示词</p>
            <button v-if="!searchQuery" class="create-btn" @click="openCreate">新增第一个提示词</button>
          </div>
        </template>
      </el-table>
    </div>

    <!-- Dialog -->
    <el-dialog v-model="visible" :title="editingId ? '编辑提示词' : '新增提示词'" width="680px">
      <div class="dialog-form">
        <div class="form-group">
          <label class="form-label">标题</label>
          <input v-model="form.title" class="form-input" placeholder="请输入标题" />
        </div>
        <div class="form-group">
          <label class="form-label">内容</label>
          <textarea v-model="form.content" rows="9" class="form-textarea" placeholder="请输入 Prompt 内容"></textarea>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <button class="cancel-btn" @click="visible = false">取消</button>
          <button class="save-btn" @click="save">保存</button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { adminAPI, type AdminPromptItem } from '@/utils/api'

const items = ref<AdminPromptItem[]>([])
const visible = ref(false)
const editingId = ref<string | null>(null)
const form = ref({ title: '', content: '' })

const searchQuery = ref('')
const selectedIds = ref<string[]>([])

const filteredItems = computed(() => {
  const query = searchQuery.value.toLowerCase()
  if (!query) return items.value
  return items.value.filter(
    (item) =>
      item.title.toLowerCase().includes(query) ||
      item.content.toLowerCase().includes(query)
  )
})

const handleSelectionChange = (selection: AdminPromptItem[]) => {
  selectedIds.value = selection.map(item => item.id)
}

const load = async () => {
  try {
    items.value = await adminAPI.listPrompts()
  } catch (loadError: any) {
    ElMessage.error(loadError?.message || '提示词列表加载失败')
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
      ElMessage.success('提示词已更新')
    } else {
      await adminAPI.createPrompt(form.value)
      ElMessage.success('提示词已创建')
    }
    visible.value = false
    await load()
  } catch (saveError: any) {
    ElMessage.error(saveError?.message || '保存失败')
  }
}

const remove = async (row: AdminPromptItem) => {
  try {
    await ElMessageBox.confirm('确定要删除该提示词吗？此操作不可恢复。', '删除确认', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
      customClass: 'dark-message-box'
    })
    
    await adminAPI.deletePrompt(row.id)
    ElMessage.success('提示词已删除')
    await load()
  } catch (actionError: any) {
    if (actionError !== 'cancel') {
      ElMessage.error(actionError?.message || '删除失败')
    }
  }
}

const batchRemove = async () => {
  if (selectedIds.value.length === 0) return
  
  try {
    await ElMessageBox.confirm(`确定要删除选中的 ${selectedIds.value.length} 个提示词吗？此操作不可恢复。`, '批量删除确认', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
      customClass: 'dark-message-box'
    })
    
    // Simulate batch delete with multiple calls
    await Promise.all(selectedIds.value.map(id => adminAPI.deletePrompt(id)))
    ElMessage.success('批量删除成功')
    selectedIds.value = []
    await load()
  } catch (actionError: any) {
    if (actionError !== 'cancel') {
      ElMessage.error(actionError?.message || '批量删除部分或全部失败')
      await load()
    }
  }
}

onMounted(load)
</script>

<style scoped>
.prompts-page {
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* ── Header ── */
.page-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.head-left {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.page-title {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.3px;
}

.head-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.search-wrap {
  position: relative;
  width: 240px;
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
  width: 100%;
  box-sizing: border-box;
  padding: 8px 12px 8px 32px;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 14px;
  outline: none;
  transition: all 0.2s;
}

.search-input:focus {
  border-color: var(--accent-primary);
  background: rgba(0, 0, 0, 0.3);
}

.page-caption {
  font-size: 14px;
  color: var(--text-muted);
}

/* ── Buttons ── */
.create-btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 9px 16px;
  background: var(--accent-primary);
  border: none;
  border-radius: 9px;
  color: #0a0a0a;
  font-family: inherit;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.15s;
  white-space: nowrap;
}

.create-btn:hover {
  opacity: 0.85;
}

.danger-batch {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
}
.danger-batch:hover {
  background: rgba(239, 68, 68, 0.25);
  opacity: 1;
}

/* ── Table Container ── */
.prompt-table-container {
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  overflow: hidden;
}

.cell-title {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.title-text {
  font-weight: 500;
  color: var(--text-primary);
}
.id-badge {
  font-size: 12px;
  font-family: monospace;
  color: var(--text-muted);
}
.cell-preview {
  color: var(--text-regular);
  font-size: 14px;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.cell-actions {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;
}

.row-btn {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--text-regular);
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.row-btn:hover {
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-primary);
}
.row-btn.danger {
  border-color: rgba(239, 68, 68, 0.3);
  color: #ef4444;
}
.row-btn.danger:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #f87171;
}

/* Element Plus Table Overrides */
:deep(.custom-dark-table) {
  --el-table-bg-color: transparent !important;
  --el-table-tr-bg-color: transparent !important;
  --el-table-header-bg-color: transparent !important;
  --el-table-border-color: rgba(255, 255, 255, 0.05) !important;
  --el-table-border: none !important;
  --el-table-text-color: var(--text-regular) !important;
  --el-table-header-text-color: var(--text-muted) !important;
  --el-table-row-hover-bg-color: rgba(255, 255, 255, 0.02) !important;
  --el-fill-color-blank: transparent !important;
  --el-bg-color: transparent !important;
  background-color: transparent;
}
:deep(.custom-dark-table th.el-table__cell) {
  background-color: rgba(0, 0, 0, 0.2) !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
  font-weight: 600;
  font-size: 13px;
  padding: 12px 0;
}
:deep(.custom-dark-table td.el-table__cell) {
  border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
  padding: 16px 0;
}
:deep(.custom-dark-table .el-table__inner-wrapper::before) {
  display: none;
}
:deep(.custom-dark-table .el-checkbox__inner) {
  background-color: transparent;
  border-color: rgba(255, 255, 255, 0.3);
}

/* ── Empty State ── */
.empty-state {
  padding: 60px 0;
  text-align: center;
  color: var(--text-muted);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}
.empty-state i {
  font-size: 32px;
  opacity: 0.5;
}

/* ── Dialog ── */
.dialog-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
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

.form-input,
.form-textarea {
  width: 100%;
  padding: 10px 13px;
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

.form-textarea {
  line-height: 1.6;
  resize: vertical;
  min-height: 180px;
}

.form-input::placeholder,
.form-textarea::placeholder {
  color: var(--text-muted);
}

.form-input:focus,
.form-textarea:focus {
  border-color: rgba(168, 199, 250, 0.4);
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.cancel-btn,
.save-btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 9px 18px;
  border-radius: 9px;
  font-family: inherit;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.15s;
}

.cancel-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--text-secondary);
}

.save-btn {
  background: var(--accent-primary);
  border: none;
  color: #0a0a0a;
}

.cancel-btn:hover,
.save-btn:hover {
  opacity: 0.82;
}
</style>

