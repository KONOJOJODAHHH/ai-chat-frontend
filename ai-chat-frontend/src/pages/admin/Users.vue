<template>
  <div class="admin-page">
    <!-- Flat page header -->
    <header class="page-head">
      <div class="head-left">
        <h1 class="page-title">用户管理</h1>
        <span v-if="total" class="total-badge">{{ total }} 位用户</span>
      </div>
      <div class="search-wrap">
        <i class="fa-solid fa-magnifying-glass search-icon"></i>
        <input
          v-model.trim="q"
          class="search-input"
          placeholder="搜索用户名或昵称…"
          @input="handleSearch"
          @keyup.enter="load"
        />
      </div>
    </header>

    <!-- User list table -->
    <div v-if="items.length" class="user-list-container">
      <el-table 
        :data="items" 
        style="width: 100%" 
        class="custom-dark-table"
        empty-text="暂无用户数据"
      >
        <!-- Avatar + name -->
        <el-table-column label="用户" min-width="200">
          <template #default="{ row }">
            <div class="user-cell">
              <div class="avatar" :class="row.role">
                {{ (row.username || '?')[0].toUpperCase() }}
              </div>
              <div class="user-info">
                <span class="username">{{ row.username }}</span>
                <span class="nickname">{{ row.nickname || '未设置昵称' }}</span>
              </div>
            </div>
          </template>
        </el-table-column>

        <!-- ID -->
        <el-table-column prop="id" label="ID" sortable min-width="120">
          <template #default="{ row }">
            <span class="mono-text">{{ row.id }}</span>
          </template>
        </el-table-column>

        <!-- Registered -->
        <el-table-column label="注册时间" sortable min-width="170" :sort-method="(a, b) => sortDate(a.createdAt || a.registeredAt, b.createdAt || b.registeredAt)">
          <template #default="{ row }">
            <span>{{ formatDateTime(row.createdAt || row.registeredAt) }}</span>
          </template>
        </el-table-column>

        <!-- Last login -->
        <el-table-column label="最近登录" sortable min-width="170" :sort-method="(a, b) => sortDate(a.lastLoginAt, b.lastLoginAt)">
          <template #default="{ row }">
            <span>{{ formatDateTime(row.lastLoginAt) }}</span>
          </template>
        </el-table-column>
          <!-- Role -->
          <el-table-column label="角色" min-width="90">
            <template #default="{ row }">
              <span class="role-tag" :class="row.role">
                {{ row.role === 'admin' ? '管理员' : '用户' }}
              </span>
            </template>
          </el-table-column>
        <!-- Status -->
        <el-table-column label="状态" min-width="100">
          <template #default="{ row }">
            <div class="status-cell">
              <span class="status-dot" :class="{ active: row.status === 'normal' }"></span>
              <span class="status-text" :class="{ active: row.status === 'normal' }">
                {{ row.status === 'normal' ? '正常' : '禁用' }}
              </span>
            </div>
          </template>
        </el-table-column>

        <!-- Actions -->
        <el-table-column label="操作" min-width="280">
          <template #default="{ row }">
            <div class="action-cell">
              <button class="row-btn" @click="toggle(row)">
                {{ row.status === 'normal' ? '禁用' : '启用' }}
              </button>
              <button class="row-btn" @click="reset(row)">重置密码</button>
              <select class="role-select" :value="row.role" @change="changeRole(row, $event)">
                <option value="user">普通用户</option>
                <option value="admin">管理员</option>
              </select>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- Empty state -->
    <div v-else class="empty-state">
      <i class="fa-solid fa-user-slash"></i>
      <p>{{ loading ? '加载中…' : '暂无用户数据' }}</p>
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
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
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

// Ensure proper sorting of empty dates
const sortDate = (a?: string, b?: string) => {
  const timeA = a ? new Date(a).getTime() : 0
  const timeB = b ? new Date(b).getTime() : 0
  return timeA - timeB
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
  const nextStatus = row.status === 'normal' ? 'disabled' : 'normal'
  const actionText = nextStatus === 'normal' ? '启用' : '禁用'
  
  try {
    await ElMessageBox.confirm(`确定要${actionText}用户 "${row.username}" 吗？`, '操作确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
      customClass: 'dark-message-box'
    })
    
    await adminAPI.toggleUser(row.id, nextStatus)
    ElMessage.success(`用户已${actionText}`)
    await load()
  } catch (actionError: any) {
    if (actionError !== 'cancel') {
      ElMessage.error(actionError?.message || '状态更新失败')
    }
  }
}

const reset = async (row: AdminUserItem) => {
  try {
    await ElMessageBox.confirm(`确定要重置用户 "${row.username}" 的密码吗？`, '重置密码确认', {
      confirmButtonText: '确认重置',
      cancelButtonText: '取消',
      type: 'warning',
      customClass: 'dark-message-box'
    })
    
    const result: any = await adminAPI.resetPassword(row.id)
    const password = result?.defaultPassword ? `，临时密码：${result.defaultPassword}` : ''
    ElMessage.success(`密码已重置${password}`)
  } catch (actionError: any) {
    if (actionError !== 'cancel') {
      ElMessage.error(actionError?.message || '重置密码失败')
    }
  }
}

const changeRole = async (row: AdminUserItem, event: Event) => {
  const target = event.target as HTMLSelectElement
  const nextRole = target.value
  const roleName = nextRole === 'admin' ? '管理员' : '普通用户'

  try {
    await ElMessageBox.confirm(`确定要将用户 "${row.username}" 的角色更改为 "${roleName}" 吗？`, '修改角色确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
      customClass: 'dark-message-box'
    })
    
    await adminAPI.setRole(row.id, nextRole)
    ElMessage.success('角色已更新')
    await load()
  } catch (actionError: any) {
    // Revert select visually
    target.value = row.role
    if (actionError !== 'cancel') {
      ElMessage.error(actionError?.message || '角色更新失败')
    }
  }
}

onMounted(load)
</script>

<style scoped>
.admin-page {
  width: 100%;
}

/* ── Header ── */
.page-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 28px;
}

.head-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.page-title {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  letter-spacing: -0.03em;
  color: var(--text-primary);
}

.total-badge {
  font-size: 14px;
  color: var(--text-muted);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  padding: 3px 10px;
}

/* Search */
.search-wrap {
  position: relative;
}

.search-icon {
  position: absolute;
  left: 13px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
  font-size: 14px;
}

.search-input {
  width: 260px;
  padding: 9px 14px 9px 38px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 9px;
  color: var(--text-primary);
  font-family: inherit;
  font-size: 13.5px;
  outline: none;
  transition: border-color 0.15s;
}

.search-input::placeholder {
  color: var(--text-muted);
}

.search-input:hover {
  border-color: rgba(168, 199, 250, 0.25);
}

.search-input:focus {
  border-color: rgba(168, 199, 250, 0.5);
}

/* ── List table container ── */
  .user-list-container {
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.02);
    overflow: hidden;
  }

  /* Element Plus Table Overrides */
  :deep(.custom-dark-table) {
    --el-table-bg-color: transparent !important;
    --el-table-tr-bg-color: transparent !important;
    --el-table-header-bg-color: rgba(255, 255, 255, 0.025) !important;
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
    background-color: rgba(255, 255, 255, 0.025) !important;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
    font-weight: 600;
    font-size: 13px;
    padding: 12px 0;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  :deep(.custom-dark-table td.el-table__cell) {
    border-bottom: 1px solid rgba(255, 255, 255, 0.04) !important;
    padding: 14px 0;
  }
  :deep(.custom-dark-table .el-table__inner-wrapper::before) {
    display: none;
  }

  /* Cell layouts */
  .user-cell {
  display: flex;
  align-items: center;
  gap: 11px;
  min-width: 0;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
  flex-shrink: 0;
  background: rgba(168, 199, 250, 0.15);
  color: var(--accent-primary);
}

.avatar.admin {
  background: rgba(251, 191, 36, 0.15);
  color: #fbbf24;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.username {
  font-size: 13.5px;
  font-weight: 500;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.nickname {
  font-size: 14px;
  color: var(--text-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Column: Role Tag */
.role-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 2px 8px;
  font-size: 12px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-muted);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.role-tag.admin {
  background: rgba(var(--ai-primary-rgb), 0.1);
  color: var(--ai-primary);
  border-color: rgba(var(--ai-primary-rgb), 0.2);
}

/* Column: status */
  .status-cell {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  .status-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: rgba(239, 68, 68, 0.7);
    flex-shrink: 0;
  }

  .status-dot.active {
    background: rgba(34, 197, 94, 0.8);
  }

  .status-text {
    font-size: 12.5px;
    color: rgba(239, 68, 68, 0.8);
  }

  .status-text.active {
    color: rgba(74, 222, 128, 0.9);
  }

  /* Column: actions */
  .action-cell {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 6px;
  }
.row-btn {
  padding: 5px 11px;
  font-size: 14px;
  font-family: inherit;
  font-weight: 500;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 6px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: background 0.14s, color 0.14s, border-color 0.14s;
  white-space: nowrap;
}

.row-btn:hover {
  background: rgba(168, 199, 250, 0.1);
  border-color: rgba(168, 199, 250, 0.3);
  color: var(--accent-primary);
}

.role-select {
  padding: 5px 28px 5px 10px;
  font-family: inherit;
  font-size: 14px;
  background-color: rgba(255, 255, 255, 0.04);
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%236b7280' stroke-width='1.5' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: calc(100% - 9px) center;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 6px;
  color: var(--text-secondary);
  outline: none;
  appearance: none;
  -webkit-appearance: none;
  cursor: pointer;
  transition: border-color 0.14s;
}

.role-select:hover,
.role-select:focus {
  border-color: rgba(168, 199, 250, 0.3);
}

.role-select option {
  background: #18181b;
  color: var(--text-primary);
}

/* ── Empty state ── */
.empty-state {
  padding: 80px 20px;
  text-align: center;
  color: var(--text-muted);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.empty-state i {
  font-size: 36px;
  opacity: 0.4;
}

.empty-state p {
  margin: 0;
  font-size: 14px;
}

/* ── Pagination ── */
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

/* ── Responsive ── */
@media (max-width: 768px) {
  .page-head {
    flex-direction: column;
    align-items: stretch;
  }

  .search-input {
    width: 100%;
  }
}
</style>




