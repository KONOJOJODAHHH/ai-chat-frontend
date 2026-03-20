<template>
  <div class="logs-page">
    <!-- Header -->
    <div class="page-head">
      <div class="head-left">
        <h1 class="page-title">日志审计</h1>
      </div>
      <div class="head-right">
        <div class="search-wrap">
          <i class="fa-solid fa-magnifying-glass search-icon"></i>
          <input
            v-model.trim="action"
            class="search-input"
            placeholder="按结果或模型关键词筛选"
            @keyup.enter="load"
          />
        </div>
        <button class="query-btn" @click="load">
          <i class="fa-solid fa-rotate-right"></i>
          <span>查询</span>
        </button>
      </div>
    </div>

    <!-- Table -->
    <div class="log-table">
      <div class="list-header">
        <span class="col-status">状态</span>
        <span>用户</span>
        <span>模型</span>
        <span>智能体</span>
        <span>耗时</span>
        <span>时间</span>
      </div>

      <template v-if="items.length">
        <div
          v-for="(row, index) in items"
          :key="index"
          class="log-row"
          :class="{ error: !row.success }"
        >
          <div class="col-status">
            <span class="status-badge" :class="row.success ? 'ok' : 'fail'">
              <i :class="row.success ? 'fa-solid fa-check' : 'fa-solid fa-xmark'"></i>
            </span>
          </div>
          <span class="cell-text">{{ row.user || '—' }}</span>
          <span class="cell-text cell-mono">{{ row.model || '—' }}</span>
          <span class="cell-text">{{ row.agent || '—' }}</span>
          <span class="cell-text" :class="{ slow: (row.duration ?? 0) > 5000 }">
            {{ row.duration != null ? `${row.duration} ms` : '—' }}
          </span>
          <span class="cell-text cell-muted">{{ formatDateTime(row.time) }}</span>
        </div>
      </template>

      <div v-else class="empty-state">
        <i class="fa-solid fa-inbox"></i>
        <p>暂无日志</p>
      </div>
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
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString('zh-CN')
}

const load = async () => {
  try {
    const result = await adminAPI.logs({ action: action.value }, 1, 50)
    items.value = result.items
  } catch (err: any) {
    ElMessage.error(err?.message || '日志加载失败')
  }
}

onMounted(load)
</script>

<style scoped>
.logs-page {
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* ── Header ── */
.page-head {
  display: flex;
  align-items: flex-end;
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

.page-caption {
  font-size: 14px;
  color: var(--text-muted);
}

.head-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.search-wrap {
  position: relative;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
  font-size: 14px;
  pointer-events: none;
}

.search-input {
  width: 240px;
  padding: 9px 14px 9px 34px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 9px;
  color: var(--text-primary);
  font-family: inherit;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}

.search-input::placeholder {
  color: var(--text-muted);
}

.search-input:focus {
  border-color: rgba(168, 199, 250, 0.4);
}

.query-btn {
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
}

.query-btn:hover {
  opacity: 0.85;
}

/* ── Table ── */
.log-table {
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 14px;
  overflow: hidden;
}

.list-header,
.log-row {
  display: grid;
  grid-template-columns: 52px 1.2fr 1.6fr 1.2fr 0.8fr 1.4fr;
  align-items: center;
  gap: 0;
}

.list-header {
  padding: 10px 18px;
  background: rgba(255, 255, 255, 0.025);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--text-muted);
}

.log-row {
  padding: 12px 18px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  transition: background 0.15s;
}

.log-row:last-child {
  border-bottom: none;
}

.log-row:hover {
  background: rgba(255, 255, 255, 0.025);
}

.log-row.error {
  background: rgba(239, 68, 68, 0.025);
}

.log-row.error:hover {
  background: rgba(239, 68, 68, 0.045);
}

/* Status badge */
.col-status {
  display: flex;
  align-items: center;
}

.status-badge {
  width: 26px;
  height: 26px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}

.status-badge.ok {
  background: rgba(34, 197, 94, 0.12);
  color: #4ade80;
}

.status-badge.fail {
  background: rgba(239, 68, 68, 0.12);
  color: #f87171;
}

/* Cell variants */
.cell-text {
  font-size: 14px;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding-right: 12px;
}

.cell-mono {
  font-family: 'Courier New', monospace;
  font-size: 14px;
  color: var(--accent-primary);
  opacity: 0.85;
}

.cell-muted {
  color: var(--text-muted);
  font-size: 14px;
}

.slow {
  color: #f59e0b;
  font-weight: 600;
}

/* Empty state */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 64px 20px;
  color: var(--text-muted);
}

.empty-state i {
  font-size: 40px;
  opacity: 0.35;
}

.empty-state p {
  margin: 0;
  font-size: 14px;
}

/* Responsive */
@media (max-width: 900px) {
  .list-header,
  .log-row {
    grid-template-columns: 44px 1fr 1.4fr 0 0.7fr 1.2fr;
  }

  .log-row {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
    padding: 14px 16px;
  }
}
</style>
