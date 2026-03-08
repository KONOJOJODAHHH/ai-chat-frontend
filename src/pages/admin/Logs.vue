<template>
  <div class="admin-page">
    <div class="page-header glass-card">
      <div class="header-content">
        <div class="header-title">
          <i class="fa-solid fa-wave-square"></i>
          <div>
            <h1>调用日志</h1>
            <p>展示真实聊天调用结果、模型、智能体与耗时，不再承载空实现提示。</p>
          </div>
        </div>

        <div class="search-box">
          <i class="fa-solid fa-search"></i>
          <input v-model.trim="action" placeholder="按结果或模型关键词筛选" @keyup.enter="load" />
        </div>
      </div>
    </div>

    <div class="toolbar">
      <button class="primary-btn" @click="load">
        <i class="fa-solid fa-magnifying-glass"></i>
        <span>查询</span>
      </button>
    </div>

    <div v-if="items.length" class="logs-list">
      <div v-for="(row, index) in items" :key="index" class="log-card glass-card">
        <div class="log-header">
          <div class="log-status" :class="row.success ? 'success' : 'error'">
            <i :class="row.success ? 'fa-solid fa-check' : 'fa-solid fa-xmark'"></i>
          </div>
          <div class="log-info">
            <div class="log-line">
              <span>用户：{{ row.user || '--' }}</span>
              <span>模型：{{ row.model || '--' }}</span>
              <span>智能体：{{ row.agent || '--' }}</span>
              <span>耗时：{{ row.duration ?? '--' }}ms</span>
            </div>
            <div class="log-time">{{ formatDateTime(row.time) }}</div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="empty-state glass-card">
      <i class="fa-solid fa-inbox"></i>
      <p>暂无调用日志</p>
      <span>当用户开始实际对话后，这里会展示成功率、模型与耗时记录。</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { adminAPI } from '@/utils/api'

const action = ref('')
const items = ref<any[]>([])

const formatDateTime = (value?: string) => {
  if (!value) {
    return '--'
  }

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString()
}

const load = async () => {
  try {
    const result = await adminAPI.logs({ action: action.value }, 1, 50)
    items.value = result.items
  } catch (loadError: any) {
    ElMessage.error(loadError?.message || '日志加载失败')
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
.log-card,
.empty-state {
  border-radius: 16px;
}

.page-header {
  padding: 24px;
  margin-bottom: 16px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  gap: 20px;
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
  width: 240px;
  padding: 10px 14px 10px 40px;
  border-radius: 10px;
  border: 1px solid var(--glass-border);
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-primary);
}

.toolbar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16px;
}

.primary-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border: none;
  border-radius: 10px;
  background: var(--accent-primary);
  color: #0a0a0a;
  cursor: pointer;
  font-weight: 600;
}

.logs-list {
  display: grid;
  gap: 12px;
}

.log-card {
  padding: 16px 20px;
}

.log-header {
  display: flex;
  gap: 16px;
  align-items: center;
}

.log-status {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.log-status.success {
  color: #22c55e;
  background: rgba(34, 197, 94, 0.1);
}

.log-status.error {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
}

.log-info {
  flex: 1;
}

.log-line {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  color: var(--text-secondary);
}

.log-time {
  margin-top: 8px;
  color: var(--text-muted);
  font-size: 12px;
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

.empty-state span {
  display: block;
  margin-top: 8px;
  font-size: 13px;
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: stretch;
  }

  .search-box input {
    width: 100%;
  }
}
</style>
