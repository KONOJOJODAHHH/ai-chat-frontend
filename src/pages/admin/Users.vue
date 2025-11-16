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
          <input v-model="q" placeholder="搜索用户名" @input="load" />
        </div>
      </div>
    </div>

    <div class="users-grid">
      <div v-for="row in items" :key="row.id" class="user-card glass-card">
        <div class="user-header">
          <div class="user-avatar">
            <i class="fa-solid fa-user"></i>
          </div>
          <div class="user-info">
            <h3>{{ row.username }}</h3>
            <p v-if="row.nickname">{{ row.nickname }}</p>
          </div>
          <div class="user-badges">
            <span class="role-badge" :class="row.role">
              <i :class="row.role === 'admin' ? 'fa-solid fa-shield-halved' : 'fa-solid fa-user'"></i>
              {{ row.role === 'admin' ? '管理员' : '用户' }}
            </span>
            <span class="status-badge" :class="{ active: row.status === 'normal' }">
              <i class="fa-solid fa-circle"></i>
              {{ row.status === 'normal' ? '正常' : '禁用' }}
            </span>
          </div>
        </div>

        <div class="user-body">
          <div class="user-field">
            <label>用户ID</label>
            <div class="field-value">{{ row.id }}</div>
          </div>
          <div class="user-field">
            <label>注册时间</label>
            <div class="field-value">{{ new Date(row.registeredAt).toLocaleString() }}</div>
          </div>
          <div class="user-field">
            <label>最近登录</label>
            <div class="field-value">{{ new Date(row.lastLoginAt).toLocaleString() }}</div>
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
          <select class="role-select" v-model="row.role" @change="setRole(row, row.role)">
            <option value="user">普通用户</option>
            <option value="admin">管理员</option>
          </select>
        </div>
      </div>
    </div>

    <div class="pagination" v-if="total > size">
      <el-pagination layout="prev, pager, next" :total="total" :page-size="size" :current-page="page" @current-change="p=>{page=p;load()}" />
    </div>
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

const load = async () => { 
  try {
    const res: any = await adminAPI.listUsers(q.value, page.value, size.value)
    items.value = res.items
    total.value = res.total
  } catch (e) {
    ElMessage.error('加载失败')
  }
}

const toggle = async (row: any) => { 
  try {
    await adminAPI.toggleUser(row.id, row.status === 'normal' ? 'disabled' : 'normal')
    ElMessage.success(row.status === 'normal' ? '已禁用' : '已启用')
    await load()
  } catch (e) {
    ElMessage.error('操作失败')
  }
}

const reset = async (row: any) => { 
  try {
    await adminAPI.resetPassword(row.id)
    ElMessage.success('密码已重置')
  } catch (e) {
    ElMessage.error('重置失败')
  }
}

const setRole = async (row: any, role: string) => { 
  try {
    await adminAPI.setRole(row.id, role)
    ElMessage.success('角色已更新')
    await load()
  } catch (e) {
    ElMessage.error('更新失败')
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
  width: 280px;
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

.users-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.user-card {
  padding: 20px;
  border-radius: 16px;
  transition: all 0.3s var(--ease-out);
}

.user-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.user-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--glass-border);
}

.user-avatar {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-hover));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: #0a0a0a;
}

.user-info {
  flex: 1;
}

.user-info h3 {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 4px 0;
}

.user-info p {
  font-size: 13px;
  color: var(--text-muted);
  margin: 0;
}

.user-badges {
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: flex-end;
}

.role-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
}

.role-badge.admin {
  background: rgba(168, 199, 250, 0.1);
  color: var(--accent-primary);
  border: 1px solid rgba(168, 199, 250, 0.3);
}

.role-badge.user {
  background: rgba(107, 114, 128, 0.1);
  color: var(--text-secondary);
  border: 1px solid rgba(107, 114, 128, 0.3);
}

.status-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.status-badge.active {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.status-badge i {
  font-size: 8px;
}

.user-body {
  margin-bottom: 16px;
}

.user-field {
  margin-bottom: 12px;
}

.user-field:last-child {
  margin-bottom: 0;
}

.user-field label {
  display: block;
  font-size: 12px;
  color: var(--text-muted);
  margin-bottom: 4px;
  font-weight: 500;
}

.field-value {
  font-size: 13px;
  color: var(--text-secondary);
  font-family: 'Consolas', monospace;
}

.user-actions {
  display: flex;
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

.role-select {
  flex: 1;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--glass-border);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.role-select:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: var(--accent-primary);
}

.role-select:focus {
  outline: none;
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px rgba(168, 199, 250, 0.1);
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