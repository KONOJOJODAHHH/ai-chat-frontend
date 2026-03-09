<template>
  <div class="admin-page">
    <div class="page-header glass-card">
      <div class="header-main">
        <div class="header-title">
          <h1>仪表盘</h1>
        </div>
        <button class="refresh-btn matrix-btn" :disabled="loading" @click="load">
          <i class="fa-solid fa-rotate-right" :class="{ spinning: loading }"></i>
          <span>{{ loading ? '刷新中...' : '刷新' }}</span>
        </button>
      </div>

      <div class="header-tags">
        <span class="tag-item">
          <span>今日新增：{{ dashboard.todayUsers }}</span>
        </span>
        <span class="tag-item">
          <span>近七天活跃：{{ dashboard.activeUsers }}</span>
        </span>
        <span v-if="error" class="tag-item tag-error">
          <i class="fa-solid fa-circle-exclamation"></i>
          <span>{{ error }}</span>
        </span>
      </div>
    </div>

    <div class="stats-grid">
      <div v-for="card in statCards" :key="card.label" class="stat-card glass-card">
        <div class="stat-header">
          <span class="stat-label">{{ card.label }}</span>
          <i :class="card.icon" class="stat-icon-small"></i>
        </div>
        <div class="stat-value">{{ card.value }}</div>
      </div>
    </div>

    <div class="content-grid">
      <section class="chart-card glass-card">
        <div class="section-header">
          <h2>模型调用分布</h2>
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
          <h2>系统概览</h2>
        </div>
        <div class="summary-list">
          <div class="summary-item">
            <span class="summary-label">用户总数</span>
            <span class="summary-value">{{ dashboard.users }}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">会话总数</span>
            <span class="summary-value">{{ dashboard.sessions }}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">消息总量</span>
            <span class="summary-value">{{ dashboard.messages }}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">失败调用数</span>
            <span class="summary-value">{{ dashboard.failureCount }}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">平均响应耗时</span>
            <span class="summary-value">{{ dashboard.averageDuration }} ms</span>
          </div>
        </div>
      </section>

      <section class="summary-card glass-card">
        <div class="section-header">
          <h2>智能体总览</h2>
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
  { label: '用户总数', value: dashboard.value.users, icon: 'fa-solid fa-users' },
  { label: '活跃用户', value: dashboard.value.activeUsers, icon: 'fa-solid fa-users-rays' },
  { label: '会话总数', value: dashboard.value.sessions, icon: 'fa-solid fa-comments' },
  { label: '消息总量', value: dashboard.value.messages, icon: 'fa-solid fa-message' },
  { label: '失败次数', value: dashboard.value.failureCount, icon: 'fa-solid fa-triangle-exclamation' },
])

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

.page-header {
  padding: 24px 32px;
  margin-bottom: 24px;
}

.header-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-title h1 {
  margin: 0;
  color: var(--text-primary);
  font-size: var(--page-title-size);
  font-weight: var(--page-title-weight);
  letter-spacing: -0.02em;
}

.header-tags {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 12px;
}

.tag-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  background: var(--accent-subtle);
  border-radius: 6px;
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: 500;
}

.tag-error {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
}

.spinning {
  animation: spin 1s linear infinite;
}
@keyframes spin {
  100% { transform: rotate(360deg); }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.stat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-label {
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 500;
}

.stat-icon-small {
  color: var(--text-muted);
  font-size: 16px;
}

.stat-value {
  color: var(--text-primary);
  font-size: 28px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.02em;
  line-height: 1;
}

.content-grid {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(320px, 1fr);
  gap: 24px;
}

.chart-card,
.summary-card {
  padding: 24px 32px;
  display: flex;
  flex-direction: column;
}

.section-header {
  margin-bottom: 24px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--glass-border);
}

.section-header h2 {
  margin: 0;
  color: var(--text-primary);
  font-size: 16px;
  font-weight: 600;
}

.chart-body {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.summary-list {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 0;
  border-bottom: 1px solid var(--glass-border);
}
.summary-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}
.summary-item:first-child {
  padding-top: 0;
}

.summary-label {
  color: var(--text-secondary);
  font-size: 14px;
}

.summary-value {
  color: var(--text-primary);
  font-weight: 600;
  font-size: 14px;
}

.empty-state {
  color: var(--text-muted);
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  min-height: 120px;
}

@media (max-width: 1024px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
}
</style>
