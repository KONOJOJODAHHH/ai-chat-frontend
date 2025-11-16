<template>
  <div class="admin-page">
    <div class="page-header glass-card">
      <div class="header-title">
        <i class="fa-solid fa-chart-pie"></i>
        <h1>日志与统计</h1>
      </div>
      <div class="filter-bar">
        <el-date-picker v-model="date" type="daterange" start-placeholder="开始日期" end-placeholder="结束日期" />
        <div class="search-box">
          <i class="fa-solid fa-search"></i>
          <input v-model="model" placeholder="搜索模型" />
        </div>
        <button class="primary-btn" @click="load">
          <i class="fa-solid fa-magnifying-glass"></i>
          <span>查询</span>
        </button>
      </div>
    </div>

    <div class="logs-list">
      <div v-for="(row, idx) in items" :key="idx" class="log-card glass-card">
        <div class="log-header">
          <div class="log-icon" :class="{ success: row.success, error: !row.success }">
            <i :class="row.success ? 'fa-solid fa-check' : 'fa-solid fa-xmark'"></i>
          </div>
          <div class="log-info">
            <div class="log-meta">
              <span class="meta-item">
                <i class="fa-solid fa-user"></i>
                {{ row.user }}
              </span>
              <span class="meta-item">
                <i class="fa-solid fa-microchip"></i>
                {{ row.model }}
              </span>
              <span class="meta-item">
                <i class="fa-solid fa-clock"></i>
                {{ row.duration }}ms
              </span>
            </div>
            <div class="log-time">{{ new Date(row.time).toLocaleString() }}</div>
          </div>
          <div class="log-status">
            <span class="status-badge" :class="{ success: row.success, error: !row.success }">
              <i class="fa-solid fa-circle"></i>
              {{ row.success ? '成功' : '失败' }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="items.length === 0" class="empty-state">
      <i class="fa-solid fa-inbox"></i>
      <p>暂无日志记录</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { adminAPI } from '@/utils/api'
import { ElMessage } from 'element-plus'

const date = ref<any>('')
const model = ref('')
const items = ref<any[]>([])

const load = async () => { 
  try {
    const res: any = await adminAPI.logs({ date: date.value, model: model.value })
    items.value = res.items || []
  } catch (e) {
    ElMessage.error('加载日志失败')
  }
}
</script>

<style scoped>
.admin-page {
  max-width: 1200px;
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

.logs-list {
  display: grid;
  gap: 12px;
}

.log-card {
  padding: 16px 20px;
  border-radius: 12px;
  transition: all 0.2s;
}

.log-card:hover {
  transform: translateX(4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

.log-header {
  display: flex;
  align-items: center;
  gap: 16px;
}

.log-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.log-icon.success {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
}

.log-icon.error {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.log-info {
  flex: 1;
}

.log-meta {
  display: flex;
  gap: 20px;
  margin-bottom: 6px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--text-secondary);
}

.meta-item i {
  font-size: 12px;
  color: var(--text-muted);
}

.log-time {
  font-size: 12px;
  color: var(--text-muted);
}

.log-status {
  margin-left: auto;
}

.status-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge.success {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.status-badge.error {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.status-badge i {
  font-size: 8px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: var(--text-muted);
}

.empty-state i {
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.3;
}

.empty-state p {
  font-size: 16px;
  margin: 0;
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
</style>