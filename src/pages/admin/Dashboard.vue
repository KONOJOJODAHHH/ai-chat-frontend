<template>
  <div class="admin-page">
    <div class="page-header glass-card">
      <div class="header-main">
        <div class="header-title">
          <i class="fa-solid fa-chart-line"></i>
          <h1>仪表盘</h1>
        </div>
        <button class="refresh-btn" :disabled="loading" @click="load">
          <i class="fa-solid fa-rotate-right" :class="{ spinning: loading }"></i>
          <span>{{ loading ? '刷新中...' : '刷新' }}</span>
        </button>
      </div>

      <div class="header-tags">
        <span class="tag-item">
          <i class="fa-solid fa-user-plus"></i>
          <span>今日新增用户：{{ dashboard.todayUsers }}</span>
        </span>
        <span class="tag-item">
          <i class="fa-solid fa-users-rays"></i>
          <span>近 7 天活跃用户：{{ dashboard.activeUsers }}</span>
        </span>
        <span v-if="error" class="tag-item tag-error">
          <i class="fa-solid fa-circle-exclamation"></i>
          <span>{{ error }}</span>
        </span>
      </div>
    </div>

    <div class="stats-grid">
      <div v-for="card in statCards" :key="card.label" class="stat-card glass-card">
        <div class="stat-icon" :style="{ background: card.bg }">
          <i :class="card.icon" :style="{ color: card.color }"></i>
        </div>
        <div class="stat-content">
          <div class="stat-label">{{ card.label }}</div>
          <div class="stat-value">{{ card.value }}</div>
        </div>
      </div>
    </div>

    <div class="content-grid">
      <section class="chart-card glass-card">
        <div class="section-header">
          <h2>模型调用</h2>
        </div>

        <div v-if="dashboard.modelCalls.length" class="chart-body">
          <DonutChart :data="dashboard.modelCalls" />
        </div>
        <div v-else class="empty-state">暂无模型调用数据</div>
      </section>

      <section class="chart-card glass-card">
        <div class="section-header">
          <h2>全站会话活跃图 (近365天)</h2>
        </div>

        <div v-if="dashboard.yearlyActivityTrend.length" class="chart-body heatmap-wrapper">
          <ContributionHeatmap :data="dashboard.yearlyActivityTrend" />
        </div>
        <div v-else class="empty-state">暂无会话趋势数据</div>
      </section>

      <section class="summary-card glass-card">
        <div class="section-header">
          <h2>概览</h2>
        </div>
        <div class="summary-list">
          <div class="summary-item">
            <span>用户总数</span>
            <strong>{{ dashboard.users }}</strong>
          </div>
          <div class="summary-item">
            <span>会话总数</span>
            <strong>{{ dashboard.sessions }}</strong>
          </div>
          <div class="summary-item">
            <span>消息总量</span>
            <strong>{{ dashboard.messages }}</strong>
          </div>
          <div class="summary-item">
            <span>失败调用数</span>
            <strong>{{ dashboard.failureCount }}</strong>
          </div>
          <div class="summary-item">
            <span>平均响应耗时</span>
            <strong>{{ dashboard.averageDuration }} ms</strong>
          </div>
        </div>
      </section>

      <section class="summary-card glass-card">
        <div class="section-header">
          <h2>智能体分布</h2>
        </div>
        <div v-if="dashboard.agentCalls.length" class="chart-body">
          <DonutChart :data="dashboard.agentCalls" />
        </div>
        <div v-else class="empty-state">暂无智能体调用数据</div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { adminAPI } from '@/utils/api'
import DonutChart from '@/components/charts/DonutChart.vue'
import ContributionHeatmap from '@/components/charts/ContributionHeatmap.vue'

interface DashboardState {
  users: number
  activeUsers: number
  sessions: number
  messages: number
  todayUsers: number
  modelCalls: Array<{ name: string; count: number }>
  agentCalls: Array<{ name: string; count: number }>
  sessionTrend: Array<{ label: string; count: number }>
  yearlyActivityTrend: Array<{ date: string; count: number }>
  failureCount: number
  averageDuration: number
}

const dashboard = ref<DashboardState>({
  users: 0,
  activeUsers: 0,
  sessions: 0,
  messages: 0,
  todayUsers: 0,
  modelCalls: [],
  agentCalls: [],
  sessionTrend: [],
  yearlyActivityTrend: [],
  failureCount: 0,
  averageDuration: 0,
})
const loading = ref(false)
const error = ref('')

const statCards = computed(() => [
  { label: '用户总数', value: dashboard.value.users, icon: 'fa-solid fa-users', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' },
  { label: '活跃用户', value: dashboard.value.activeUsers, icon: 'fa-solid fa-users-rays', color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.1)' },
  { label: '会话总数', value: dashboard.value.sessions, icon: 'fa-solid fa-comments', color: 'var(--accent-primary)', bg: 'rgba(168, 199, 250, 0.1)' },
  { label: '消息总量', value: dashboard.value.messages, icon: 'fa-solid fa-message', color: '#22c55e', bg: 'rgba(34, 197, 94, 0.1)' },
  { label: '失败次数', value: dashboard.value.failureCount, icon: 'fa-solid fa-triangle-exclamation', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' },
])

const getProgress = (count: number) => {
  const max = Math.max(...dashboard.value.modelCalls.map((item) => item.count), 1)
  return `${Math.max(8, Math.round((count / max) * 100))}%`
}

const getTrendProgress = (count: number, items: Array<{ count: number }>) => {
  const max = Math.max(...items.map((item) => item.count), 1)
  return `${Math.max(8, Math.round((count / max) * 100))}%`
}

const load = async () => {
  loading.value = true
  error.value = ''

  try {
    const dashboardData = await adminAPI.dashboard()
    const dashboardPayload = dashboardData as any

    dashboard.value = {
      users: Number(dashboardPayload?.users || 0),
      activeUsers: Number(dashboardPayload?.activeUsers || 0),
      sessions: Number(dashboardPayload?.sessions || 0),
      messages: Number(dashboardPayload?.messages || 0),
      todayUsers: Number(dashboardPayload?.todayUsers || 0),
      modelCalls: Array.isArray(dashboardPayload?.modelCalls) ? dashboardPayload.modelCalls : [],
      agentCalls: Array.isArray(dashboardPayload?.agentCalls) ? dashboardPayload.agentCalls : [],
      sessionTrend: Array.isArray(dashboardPayload?.sessionTrend) ? dashboardPayload.sessionTrend : [],
      yearlyActivityTrend: Array.isArray(dashboardPayload?.yearlyActivityTrend) ? dashboardPayload.yearlyActivityTrend : [],
      failureCount: Number(dashboardPayload?.failureCount || 0),
      averageDuration: Number(dashboardPayload?.averageDuration || 0),
    }
  } catch (loadError: any) {
    error.value = loadError?.message || 'Load failed'
    ElMessage.error(error.value)
  } finally {
    loading.value = false
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
.stat-card,
.chart-card,
.summary-card {
  border-radius: 16px;
}

.page-header {
  padding: 24px;
  margin-bottom: 24px;
}

.header-main {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  align-items: center;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-title i {
  font-size: 30px;
  color: var(--accent-primary);
}

.header-title h1 {
  margin: 0;
  color: var(--text-primary);
  font-size: var(--page-title-size);
  font-weight: var(--page-title-weight);
}

.header-tags {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 18px;
}

.tag-item {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--glass-border);
  border-radius: 999px;
  color: var(--text-secondary);
  font-size: 13px;
}

.tag-error {
  color: #f87171;
  border-color: rgba(248, 113, 113, 0.3);
  background: rgba(248, 113, 113, 0.08);
}

.refresh-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: var(--accent-primary);
  color: #0a0a0a;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
}

.refresh-btn:disabled {
  opacity: 0.7;
  cursor: wait;
}

.spinning {
  animation: spin 1s linear infinite;
}

.stats-grid,
.content-grid {
  display: grid;
  gap: 20px;
}

.stats-grid {
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  margin-bottom: 24px;
}

.content-grid {
  grid-template-columns: minmax(0, 2fr) minmax(280px, 1fr);
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px;
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.stat-label {
  color: var(--text-muted);
  font-size: 13px;
  margin-bottom: 4px;
}

.stat-value {
  color: var(--text-primary);
  font-size: 32px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.02em;
}

.chart-card,
.summary-card {
  padding: 24px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  padding-bottom: 14px;
  border-bottom: 1px solid var(--glass-border);
}

.section-header h2 {
  margin: 0;
  color: var(--text-primary);
  font-size: 18px;
}

.chart-body {
  display: grid;
  gap: 16px;
}

.chart-label,
.summary-item {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.chart-label {
  margin-bottom: 8px;
}

.model-name {
  color: var(--text-primary);
}

.model-count {
  color: var(--text-muted);
  font-variant-numeric: tabular-nums;
}

.progress-bar {
  height: 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 999px;
  overflow: hidden;
  border: 1px solid var(--glass-border);
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent-primary), var(--accent-hover));
  border-radius: 999px;
}

.progress-fill.alt-fill {
  background: linear-gradient(90deg, #22c55e, #86efac);
}

.summary-list {
  display: grid;
  gap: 14px;
}

.summary-item {
  padding: 14px 16px;
  border: 1px solid var(--glass-border);
  background: rgba(255, 255, 255, 0.04);
  border-radius: 12px;
  color: var(--text-secondary);
}

.summary-item strong {
  color: var(--text-primary);
  font-variant-numeric: tabular-nums;
}

.empty-state {
  padding: 48px 20px;
  text-align: center;
  color: var(--text-muted);
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@media (max-width: 1100px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .header-main {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
