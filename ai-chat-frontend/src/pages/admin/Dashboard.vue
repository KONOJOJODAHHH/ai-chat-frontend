<template>
  <div class="dash">
    <!-- Flat page header -->
    <header class="dash-header">
      <div class="header-left">
        <h1 class="page-title">仪表盘</h1>
        <span v-if="error" class="error-inline">
          <i class="fa-solid fa-circle-exclamation"></i> {{ error }}
        </span>
      </div>
      <button class="ghost-btn" :disabled="loading" @click="load">
        <i class="fa-solid fa-rotate-right" :class="{ spinning: loading }"></i>
        {{ loading ? '刷新中' : '刷新数据' }}
      </button>
    </header>

    <div class="stats-split">
      <section class="stat-group">
        <h3 class="group-title">用户概览</h3>
        <div class="detail-grid">
          <div class="detail-item">
            <span class="detail-label">用户总数</span>
            <span class="detail-val">{{ dashboard.users.toLocaleString('zh-CN') }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">今日新增</span>
            <span class="detail-val">{{ dashboard.todayUsers.toLocaleString('zh-CN') }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">七日活跃</span>
            <span class="detail-val">{{ dashboard.activeUsers.toLocaleString('zh-CN') }}</span>
          </div>
        </div>
      </section>

      <section class="stat-group">
        <h3 class="group-title">消息与调用</h3>
        <div class="detail-grid detail-grid-four">
          <div class="detail-item">
            <span class="detail-label">消息总量</span>
            <span class="detail-val">{{ dashboard.messages.toLocaleString('zh-CN') }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">会话总数</span>
            <span class="detail-val">{{ dashboard.sessions.toLocaleString('zh-CN') }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">失败调用</span>
            <span class="detail-val" :class="{ 'val-warn': dashboard.failureCount > 0 }">{{ dashboard.failureCount }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">平均响应</span>
            <span class="detail-val">{{ dashboard.averageDuration }}<em> ms</em></span>
          </div>
        </div>
      </section>
    </div>

    <!-- Charts area -->
    <div class="content-area">
      <!-- Heatmap: full width -->
      <section class="panel">
        <div class="panel-head">
          <h2 class="panel-title">会话活跃热力图</h2>
        </div>
        <div v-if="dashboard.yearlyActivityTrend.length" class="chart-body heatmap-body">
          <ContributionHeatmap :data="dashboard.yearlyActivityTrend" height="195px" />
        </div>
        <div v-else class="no-data">暂无会话趋势数据</div>
      </section>

      <!-- Donut charts row -->
      <div class="panel-row">
        <section class="panel">
          <div class="panel-head">
            <h2 class="panel-title">模型调用分布</h2>
          </div>
          <div v-if="dashboard.modelCalls.length" class="chart-body donut-body">
            <DonutChart :data="dashboard.modelCalls" height="260px" />
          </div>
          <div v-else class="no-data">暂无模型调用数据</div>
        </section>

        <section class="panel">
          <div class="panel-head">
            <h2 class="panel-title">智能体调用分布</h2>
          </div>
          <div v-if="dashboard.agentCalls.length" class="chart-body donut-body">
            <DonutChart :data="dashboard.agentCalls" height="260px" />
          </div>
          <div v-else class="no-data">暂无智能体调用数据</div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
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
/* ── Page wrapper ── */
.dash {
  width: 100%;
}

/* ── Header ── */
.dash-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 28px;
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.page-title {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  letter-spacing: -0.03em;
  color: var(--text-primary);
}

.error-inline {
  color: #f87171;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 5px;
}

/* Ghost refresh button */
.ghost-btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 8px 16px;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: var(--text-secondary);
  font-size: 14px;
  font-family: inherit;
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s, background 0.15s;
  flex-shrink: 0;
}

.ghost-btn:hover:not(:disabled) {
  border-color: rgba(168, 199, 250, 0.4);
  color: var(--text-primary);
  background: rgba(168, 199, 250, 0.05);
}

.ghost-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  100% { transform: rotate(360deg); }
}

/* ── Content area ── */
.content-area {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

/* ── Panel base ── */
.panel {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 14px;
  padding: 22px 26px;
  box-shadow: 0 10px 26px rgba(0, 0, 0, 0.22);
}

.stats-split {
  display: grid;
  grid-template-columns: 1fr 1.4fr;
  gap: 18px;
  margin-bottom: 18px;
}

.stat-group {
  padding: 18px 22px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.02);
}

.panel-head {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 18px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.panel-title {
  margin: 0;
  font-size: 13.5px;
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: -0.01em;
}

.panel-caption {
  font-size: 11.5px;
  color: var(--text-muted);
}

/* Chart body */
.chart-body {
  width: 100%;
}

.heatmap-body {
  width: 100%;
  overflow: hidden;
}

.donut-body {
  min-height: 260px;
}

/* Panel row: 2-col */
.panel-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
}

.group-title {
  margin: 0 0 12px;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
  letter-spacing: 0.04em;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
}

.detail-grid-four {
  grid-template-columns: repeat(4, 1fr);
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 7px;
  padding: 10px 16px 10px 0;
  border-right: 1px solid rgba(255, 255, 255, 0.05);
}

.detail-item:last-child {
  border-right: none;
}

.detail-label {
  font-size: 10.5px;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.detail-val {
  font-size: 20px;
  font-weight: 650;
  font-variant-numeric: tabular-nums;
  color: var(--text-primary);
  letter-spacing: -0.025em;
}

.detail-val em {
  font-style: normal;
  font-size: 14px;
  font-weight: 400;
  color: var(--text-muted);
  vertical-align: middle;
}

.val-warn {
  color: #f59e0b;
}

.no-data {
  color: var(--text-muted);
  font-size: 14px;
  padding: 36px 0;
  text-align: center;
}

/* ── Responsive ── */
@media (max-width: 1100px) {
  .panel-row {
    grid-template-columns: 1fr;
  }

  .stats-split {
    grid-template-columns: 1fr;
  }

  .detail-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .detail-grid-four {
    grid-template-columns: repeat(2, 1fr);
  }

  .detail-grid .detail-item:nth-child(3),
  .detail-grid-four .detail-item:nth-child(2),
  .detail-grid-four .detail-item:nth-child(4) {
    border-right: none;
  }
}

@media (max-width: 700px) {
  .dash-header {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }

  .ghost-btn {
    width: 100%;
    justify-content: center;
  }

  .detail-grid {
    grid-template-columns: 1fr;
  }

  .detail-grid-four {
    grid-template-columns: 1fr;
  }

  .detail-item,
  .detail-grid .detail-item:nth-child(3),
  .detail-grid-four .detail-item:nth-child(2),
  .detail-grid-four .detail-item:nth-child(4) {
    border-right: none;
  }
}
</style>
