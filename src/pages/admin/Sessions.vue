<template>
  <div class="admin-page">
    <div class="page-header glass-card">
      <div class="header-title">
        <i class="fa-solid fa-comments"></i>
        <h1>会话管理</h1>
      </div>
      <div class="filter-bar">
        <select v-model="filterUser" class="filter-select">
          <option value="">全部用户</option>
          <option v-for="u in users" :key="u.id" :value="u.id">{{ u.username }}</option>
        </select>
        <select v-model="filterModel" class="filter-select">
          <option value="">全部模型</option>
          <option v-for="m in models" :key="m.id" :value="m.id">{{ m.name }}</option>
        </select>
        <el-date-picker v-model="filterDate" type="date" placeholder="选择日期" />
        <button class="primary-btn" @click="load">
          <i class="fa-solid fa-filter"></i>
          <span>筛选</span>
        </button>
        <button class="danger-btn" @click="cleanup">
          <i class="fa-solid fa-trash"></i>
          <span>清理30天前</span>
        </button>
      </div>
    </div>

    <div class="sessions-list">
      <div v-for="row in items" :key="row.id" class="session-card glass-card">
        <div class="session-header">
          <div class="session-icon">
            <i class="fa-solid fa-message"></i>
          </div>
          <div class="session-info">
            <h3>会话 {{ row.id }}</h3>
            <div class="session-meta">
              <span class="meta-item">
                <i class="fa-solid fa-user"></i>
                {{ row.userId }}
              </span>
              <span class="meta-item">
                <i class="fa-solid fa-microchip"></i>
                {{ row.modelId }}
              </span>
            </div>
          </div>
          <div class="session-stats">
            <div class="stat-item">
              <i class="fa-solid fa-comments"></i>
              <span>{{ row.messageCount }} 消息</span>
            </div>
          </div>
        </div>
        <div class="session-footer">
          <span class="update-time">
            <i class="fa-solid fa-clock"></i>
            {{ new Date(row.updatedAt).toLocaleString() }}
          </span>
          <button class="action-btn" @click="view(row)">
            <i class="fa-solid fa-eye"></i>
            <span>查看详情</span>
          </button>
        </div>
      </div>
    </div>

    <div class="pagination" v-if="total > size">
      <el-pagination layout="prev, pager, next" :total="total" :page-size="size" :current-page="page" @current-change="p=>{page=p;load()}" />
    </div>

    <el-dialog v-model="visible" title="会话详情" width="700px" class="admin-dialog">
      <div class="dialog-messages">
        <div v-for="(m, i) in detail?.messages || []" :key="i" class="message-item" :class="m.role">
          <div class="message-header">
            <span class="role-tag" :class="m.role">
              <i :class="m.role === 'user' ? 'fa-solid fa-user' : 'fa-solid fa-robot'"></i>
              {{ m.role === 'user' ? '用户' : 'AI' }}
            </span>
          </div>
          <div class="message-content">{{ m.content }}</div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { adminAPI } from '@/utils/api'
import { ElMessage } from 'element-plus'

const filterUser = ref('')
const filterModel = ref('')
const filterDate = ref<any>('')
const users = ref<any[]>([])
const models = ref<any[]>([])
const items = ref<any[]>([])
const detail = ref<any>(null)
const visible = ref(false)
const total = ref(0)
const page = ref(1)
const size = ref(10)

const load = async () => { 
  try {
    const res: any = await adminAPI.listSessions({ userId: filterUser.value, modelId: filterModel.value, date: filterDate.value }, page.value, size.value)
    items.value = res.items
    total.value = res.total
  } catch (e) {
    ElMessage.error('加载失败')
  }
}

const view = async (row: any) => { 
  try {
    detail.value = await adminAPI.sessionDetail(row.id)
    visible.value = true
  } catch (e) {
    ElMessage.error('获取详情失败')
  }
}

const cleanup = async () => { 
  try {
    const before = Date.now() - 30 * 24 * 3600 * 1000
    await adminAPI.cleanupSessions(before)
    ElMessage.success('清理成功')
    await load()
  } catch (e) {
    ElMessage.error('清理失败')
  }
}

onMounted(async () => { 
  const ur: any = await adminAPI.listUsers()
  users.value = ur.items || ur
  const mr: any = await adminAPI.listModels()
  models.value = mr.items || mr
  await load()
})
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

.header-title {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
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

.filter-bar {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.filter-select {
  padding: 10px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--glass-border);
  border-radius: 10px;
  color: var(--text-primary);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 160px;
}

.filter-select:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: var(--accent-primary);
}

.filter-select:focus {
  outline: none;
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px rgba(168, 199, 250, 0.1);
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

.danger-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.danger-btn:hover {
  background: rgba(239, 68, 68, 0.2);
  border-color: #ef4444;
}

.sessions-list {
  display: grid;
  gap: 16px;
  margin-bottom: 24px;
}

.session-card {
  padding: 20px;
  border-radius: 16px;
  transition: all 0.3s var(--ease-out);
}

.session-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.session-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.session-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: rgba(168, 199, 250, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: var(--accent-primary);
}

.session-info {
  flex: 1;
}

.session-info h3 {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 8px 0;
}

.session-meta {
  display: flex;
  gap: 16px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--text-muted);
}

.meta-item i {
  font-size: 12px;
}

.session-stats {
  display: flex;
  gap: 16px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  font-size: 14px;
  color: var(--text-secondary);
}

.stat-item i {
  color: var(--accent-primary);
}

.session-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid var(--glass-border);
}

.update-time {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--text-muted);
}

.update-time i {
  font-size: 12px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
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
  color: var(--accent-primary);
  border-color: var(--accent-primary);
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}

.dialog-messages {
  max-height: 500px;
  overflow-y: auto;
  padding: 12px;
}

.message-item {
  margin-bottom: 20px;
  padding: 16px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--glass-border);
}

.message-item.user {
  background: rgba(168, 199, 250, 0.05);
  border-color: rgba(168, 199, 250, 0.2);
}

.message-item.assistant {
  background: rgba(34, 197, 94, 0.05);
  border-color: rgba(34, 197, 94, 0.2);
}

.message-header {
  margin-bottom: 12px;
}

.role-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
}

.role-tag.user {
  background: rgba(168, 199, 250, 0.1);
  color: var(--accent-primary);
}

.role-tag.assistant {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
}

.message-content {
  color: var(--text-primary);
  line-height: 1.6;
  font-size: 14px;
  white-space: pre-wrap;
  word-break: break-word;
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

:deep(.el-date-editor) {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--glass-border);
}

:deep(.el-date-editor .el-input__wrapper) {
  background: transparent;
  box-shadow: none;
}

:deep(.el-date-editor:hover) {
  border-color: var(--accent-primary);
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