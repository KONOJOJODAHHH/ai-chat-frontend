<template>
  <div class="admin-page">
    <div class="page-header glass-card">
      <div class="header-content">
        <div class="header-title">
          <i class="fa-solid fa-users"></i>
          <h1>用户管理</h1>
        </div>
        <div class="search-box">
          <i class="fa-solid fa-search"></i>
          <input
            v-model.trim="q"
            placeholder="搜索用户名或昵称"
            @input="handleSearch"
            @keyup.enter="load"
          />
        </div>
      </div>
    </div>

    <div class="users-grid" v-if="items.length">
      <div v-for="row in items" :key="row.id" class="user-card glass-card">
        <div class="user-header">
          <div class="user-avatar">
            <i class="fa-solid fa-user"></i>
          </div>
          <div class="user-info">
            <h3>{{ row.username }}</h3>
            <p>{{ row.nickname || '未设置昵称' }}</p>
          </div>
          <div class="user-badges">
            <span class="role-badge" :class="row.role">
              <i :class="row.role === 'admin' ? 'fa-solid fa-shield-halved' : 'fa-solid fa-user'"></i>
              {{ row.role === 'admin' ? '管理员' : '普通用户' }}
            </span>
            <span class="status-badge" :class="{ active: row.status === 'normal' }">
              <i class="fa-solid fa-circle"></i>
              {{ row.status === 'normal' ? '正常' : '禁用' }}
            </span>
          </div>
        </div>

        <div class="user-body">
          <div class="user-field">
            <label>用户 ID</label>
            <div class="field-value">{{ row.id }}</div>
          </div>
          <div class="user-field">
            <label>注册时间</label>
            <div class="field-value">{{ formatDateTime(row.createdAt || row.registeredAt) }}</div>
          </div>
          <div class="user-field">
            <label>最近登录</label>
            <div class="field-value">{{ formatDateTime(row.lastLoginAt) }}</div>
          </div>
        </div>

        <div class="user-actions">
          <button class="action-btn" @click="toggle(row)">
            <i :class="row.status === 'normal' ? 'fa-solid fa-ban' : 'fa-solid fa-check'"></i>
            <span>{{ row.status === 'normal' ? '禁用' : '启用' }}</span>
          </button>
          <button class="action-btn" @click="reset(row)">
            <i class="fa-solid fa-key"></i>
            <span>重置密码</span>
          </button>
          <select class="role-select" :value="row.role" @change="changeRole(row, $event)">
            <option value="user">普通用户</option>
            <option value="admin">管理员</option>
          </select>
        </div>
      </div>
    </div>

    <div v-else class="empty-state glass-card">
      <i class="fa-solid fa-user-slash"></i>
      <p>{{ loading ? '加载中...' : '暂无用户数据' }}</p>
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
import { adminAPI, type AdminUserItem } from '@/utils/api'

const q = ref('')
const items = ref<AdminUserItem[]>([])
const total = ref(0)
const page = ref(1)
const size = ref(10)
const loading = ref(false)
let searchTimer: ReturnType<typeof setTimeout> | null = null

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
    const result = await adminAPI.listUsers(q.value, page.value, size.value)
    items.value = result.items
    total.value = result.total
  } catch (loadError: any) {
    ElMessage.error(loadError?.message || '用户列表加载失败')
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

const toggle = async (row: AdminUserItem) => {
  try {
    const nextStatus = row.status === 'normal' ? 'disabled' : 'normal'
    await adminAPI.toggleUser(row.id, nextStatus)
    ElMessage.success(nextStatus === 'normal' ? '用户已启用' : '用户已禁用')
    await load()
  } catch (actionError: any) {
    ElMessage.error(actionError?.message || '状态更新失败')
  }
}

const reset = async (row: AdminUserItem) => {
  try {
    const result: any = await adminAPI.resetPassword(row.id)
    const password = result?.defaultPassword ? `，临时密码：${result.defaultPassword}` : ''
    ElMessage.success(`密码已重置${password}`)
  } catch (actionError: any) {
    ElMessage.error(actionError?.message || '重置密码失败')
  }
}

const changeRole = async (row: AdminUserItem, event: Event) => {
  const target = event.target as HTMLSelectElement
  const nextRole = target.value

  try {
    await adminAPI.setRole(row.id, nextRole)
    ElMessage.success('角色已更新')
    await load()
  } catch (actionError: any) {
    target.value = row.role
    ElMessage.error(actionError?.message || '角色更新失败')
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
.user-card,
.empty-state {
  border-radius: 16px;
}

.page-header {
  padding: 24px;
  margin-bottom: 24px;
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
  width: 280px;
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

.users-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 20px;
}

.user-card {
  padding: 20px;
}

.user-header,
.user-actions {
  display: flex;
  gap: 12px;
}

.user-header {
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--glass-border);
}

.user-avatar {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #0a0a0a;
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-hover));
}

.user-info {
  flex: 1;
}

.user-info h3,
.user-info p {
  margin: 0;
}

.user-info h3 {
  color: var(--text-primary);
  font-size: 16px;
}

.user-info p {
  color: var(--text-muted);
  font-size: 13px;
  margin-top: 4px;
}

.user-badges {
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: flex-end;
}

.role-badge,
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
}

.role-badge.admin {
  background: rgba(168, 199, 250, 0.1);
  color: var(--accent-primary);
}

.role-badge.user {
  background: rgba(107, 114, 128, 0.14);
  color: var(--text-secondary);
}

.status-badge {
  background: rgba(239, 68, 68, 0.12);
  color: #ef4444;
}

.status-badge.active {
  background: rgba(34, 197, 94, 0.12);
  color: #22c55e;
}

.status-badge i {
  font-size: 8px;
}

.user-body {
  display: grid;
  gap: 12px;
}

.user-field label {
  display: block;
  margin-bottom: 4px;
  color: var(--text-muted);
  font-size: 12px;
}

.field-value {
  color: var(--text-secondary);
  font-variant-numeric: tabular-nums;
}

.user-actions {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--glass-border);
}

.action-btn,
.role-select {
  border-radius: 10px;
  border: 1px solid var(--glass-border);
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-secondary);
  transition: all 0.18s;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-primary);
}

.role-select {
  flex: 1;
  padding: 8px 36px 8px 12px;
  appearance: none;
  -webkit-appearance: none;
  background-color: rgba(0, 0, 0, 0.3);
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%239ca3af' stroke-width='1.5' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: calc(100% - 12px) center;
  color: var(--text-secondary);
  font-family: inherit;
  font-size: 14px;
  outline: none;
  cursor: pointer;
  transition: border-color 0.2s, color 0.2s;
}

.role-select:hover {
  border-color: rgba(168, 199, 250, 0.3);
  color: var(--text-primary);
}

.role-select:focus {
  border-color: var(--accent-primary);
  color: var(--text-primary);
}

.role-select option {
  background: #18181b;
  color: var(--text-primary);
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
  .header-content,
  .user-header,
  .user-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .search-box input {
    width: 100%;
  }
}
</style>
