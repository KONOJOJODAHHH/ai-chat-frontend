<template>
  <div class="admin-page">
    <div class="page-header glass-card">
      <div class="header-title">
        <i class="fa-solid fa-comments"></i>
        <div>
          <h1>会话管理</h1>
          <p>查看对话列表与会话详情</p>
        </div>
      </div>

      <div class="filter-bar">
        <select v-model="filterUser" class="filter-select">
          <option value="">全部用户</option>
          <option v-for="user in users" :key="user.id" :value="user.id">{{ user.username }}</option>
        </select>

        <select v-model="filterModel" class="filter-select">
          <option value="">全部模型</option>
          <option v-for="model in models" :key="model.id" :value="model.modelId">
            {{ model.name }}
          </option>
        </select>

        <button class="primary-btn" @click="applyFilters">
          <i class="fa-solid fa-filter"></i>
          <span>筛选</span>
        </button>
        <button class="danger-btn" @click="cleanup">
          <i class="fa-solid fa-trash"></i>
          <span>清理 30 天前会话</span>
        </button>
      </div>
    </div>

    <div v-if="items.length" class="sessions-list">
      <div v-for="row in items" :key="row.id" class="session-card glass-card">
        <div class="session-header">
          <div class="session-icon">
            <i class="fa-solid fa-message"></i>
          </div>
          <div class="session-info">
            <h3>{{ row.title || `会话 ${row.id}` }}</h3>
            <div class="session-meta">
              <span class="meta-item">
                <i class="fa-solid fa-hashtag"></i>
                ID {{ row.id }}
              </span>
              <span class="meta-item" v-if="row.userId">
                <i class="fa-solid fa-user"></i>
                用户 {{ row.userId }}
              </span>
              <span class="meta-item" v-if="row.modelId">
                <i class="fa-solid fa-microchip"></i>
                {{ row.modelId }}
              </span>
            </div>
          </div>
          <div class="session-stats">
            <div class="stat-chip">
              <i class="fa-solid fa-comments"></i>
              <span>{{ row.messageCount || 0 }} 条消息</span>
            </div>
          </div>
        </div>

        <div class="session-footer">
          <span class="update-time">
            <i class="fa-solid fa-clock"></i>
            {{ formatDateTime(row.updatedAt || row.createdAt) }}
          </span>
          <span class="meta-note">后台默认仅展示会话元数据</span>
        </div>
      </div>
    </div>

    <div v-else class="empty-state glass-card">
      <i class="fa-solid fa-inbox"></i>
      <p>{{ loading ? '加载中...' : '暂无会话数据' }}</p>
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

  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { adminAPI, type AdminModelItem, type AdminSessionItem, type AdminUserItem } from '@/utils/api'

const filterUser = ref('')
const filterModel = ref('')
const users = ref<AdminUserItem[]>([])
const models = ref<AdminModelItem[]>([])
const items = ref<AdminSessionItem[]>([])
const total = ref(0)
const page = ref(1)
const size = ref(10)
const loading = ref(false)

const formatDateTime = (value?: string) => {
  if (!value) {
    return '--'
  }

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString()
}

const load = async () => {
  loading.value = true
  try {
    const result = await adminAPI.listSessions(
      {
        userId: filterUser.value,
        modelId: filterModel.value,
      },
      page.value,
      size.value,
    )
    items.value = result.items
    total.value = result.total
  } catch (loadError: any) {
    ElMessage.error(loadError?.message || '会话列表加载失败')
  } finally {
    loading.value = false
  }
}

const loadOptions = async () => {
  try {
    const [userResult, modelResult] = await Promise.all([
      adminAPI.listUsers('', 1, 100),
      adminAPI.listModels('', 1, 100),
    ])
    users.value = userResult.items
    models.value = modelResult.items
  } catch (loadError: any) {
    ElMessage.error(loadError?.message || '筛选项加载失败')
  }
}

const applyFilters = () => {
  page.value = 1
  load()
}

const handlePageChange = (nextPage: number) => {
  page.value = nextPage
  load()
}

const cleanup = async () => {
  try {
    const beforeTs = Date.now() - 30 * 24 * 60 * 60 * 1000
    await adminAPI.cleanupSessions(beforeTs)
    ElMessage.success('已清理 30 天前会话')
    await load()
  } catch (actionError: any) {
    ElMessage.error(actionError?.message || '清理失败')
  }
}

onMounted(async () => {
  await loadOptions()
  await load()
})
</script>

<style scoped>
.admin-page {
  max-width: 1400px;
  margin: 0 auto;
}

.page-header,
.session-card,
.empty-state {
  border-radius: 16px;
}

.page-header {
  padding: 24px;
  margin-bottom: 24px;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 20px;
}

.header-title i {
  font-size: 28px;
  color: var(--accent-primary);
}

.header-title h1 {
  margin: 0;
  color: var(--text-primary);
  font-size: 24px;
}

.header-title p {
  margin: 6px 0 0;
  color: var(--text-muted);
  font-size: 14px;
}

.filter-bar {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.filter-select,
.primary-btn,
.danger-btn {
  border-radius: 10px;
}

.filter-select {
  min-width: 180px;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--glass-border);
  color: var(--text-primary);
}

.primary-btn,
.danger-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  cursor: pointer;
  border: 1px solid transparent;
}

.primary-btn {
  background: var(--accent-primary);
  color: #0a0a0a;
}

.danger-btn {
  background: rgba(239, 68, 68, 0.12);
  color: #f87171;
  border-color: rgba(239, 68, 68, 0.25);
}

.sessions-list {
  display: grid;
  gap: 16px;
}

.session-card {
  padding: 20px;
}

.session-header,
.session-footer {
  display: flex;
  justify-content: space-between;
  gap: 16px;
}

.session-header {
  align-items: center;
  margin-bottom: 16px;
}

.session-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent-primary);
  background: rgba(168, 199, 250, 0.1);
}

.session-info {
  flex: 1;
}

.session-info h3 {
  margin: 0 0 8px;
  color: var(--text-primary);
}

.session-meta {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.meta-item,
.update-time,
.message-time {
  color: var(--text-muted);
  font-size: 13px;
}

.stat-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-secondary);
}

.session-footer {
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid var(--glass-border);
}

.meta-note {
  color: var(--text-muted);
  font-size: 13px;
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

:deep(.el-pagination) {
  --el-pagination-bg-color: transparent;
  --el-pagination-button-bg-color: rgba(255, 255, 255, 0.05);
  --el-pagination-hover-color: var(--accent-primary);
}

@media (max-width: 768px) {
  .session-header,
  .session-footer {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
