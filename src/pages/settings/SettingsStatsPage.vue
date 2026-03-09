<template>
  <section class="settings-page">
    <div class="page-title-row">
      <h2 class="page-title">数据统计</h2>
      <button class="ghost-btn" :disabled="loading" @click="load">
        <i class="fa-solid fa-rotate-right" :class="{ spinning: loading }"></i>
        <span>{{ loading ? '刷新中...' : '刷新' }}</span>
      </button>
    </div>

    <!-- 统计概览 -->
    <div class="stats-grid">
      <div v-for="card in cards" :key="card.title" class="stat-card">
        <span class="stat-label">{{ card.title }}</span>
        <strong class="stat-value">{{ card.value }}</strong>
      </div>
    </div>

    <!-- 全站活跃热力图 -->
    <div class="settings-section chart-section">
      <div class="section-header">
        <h3>活跃贡献热力图 (近365天)</h3>
      </div>
      <div v-if="yearlyActivityTrend.length" class="chart-body heatmap-wrapper">
        <ContributionHeatmap :data="yearlyActivityTrend" height="180px" />
      </div>
      <div v-else class="empty-row">暂无行为数据</div>
    </div>

    <!-- 模型与智能体分布 -->
    <div class="stats-row-grid">
      <div class="settings-section chart-section">
        <div class="section-header">
          <h3>模型调用偏好</h3>
        </div>
        <div v-if="modelDistribution.length" class="chart-body">
          <DonutChart :data="modelDistribution" />
        </div>
        <div v-else class="empty-row">暂无模型调用数据</div>
      </div>
      
      <div class="settings-section chart-section">
        <div class="section-header">
          <h3>智能体偏好</h3>
        </div>
        <div v-if="agentDistribution.length" class="chart-body">
          <DonutChart :data="agentDistribution" />
        </div>
        <div v-else class="empty-row">暂无智能体调用数据</div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { chatAPI, type DistributionItem, type UserStatsResponse } from '@/utils/api'
import DonutChart from '@/components/charts/DonutChart.vue'
import ContributionHeatmap from '@/components/charts/ContributionHeatmap.vue'

const loading = ref(false)
const stats = ref<UserStatsResponse | null>(null)

const cards = computed(() => {
  const current = stats.value
  return [
    { title: '个人会话数', value: current?.conversationCount ?? '--' },
    { title: '消息总量', value: current?.messageCount ?? '--' },
    { title: '失败次数', value: current?.failureCount ?? '--' },
    { title: '平均响应时长', value: current?.averageDuration ? `${current.averageDuration} ms` : '--' },
  ]
})

const yearlyActivityTrend = computed(() => stats.value?.yearlyActivityTrend || [])
const modelDistribution = computed<DistributionItem[]>(() => stats.value?.modelDistribution || [])
const agentDistribution = computed<DistributionItem[]>(() => stats.value?.agentDistribution || [])

const load = async () => {
  loading.value = true
  try {
    stats.value = await chatAPI.getMyStats()
  } catch (error: any) {
    ElMessage.error(error?.message || '统计加载失败')
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<style scoped>
.settings-page {
  padding: 28px 32px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-height: 100%;
  box-sizing: border-box;
}

.page-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.page-title {
  margin: 0;
  font-size: var(--page-title-size);
  font-weight: var(--page-title-weight);
}

/* 统计卡片 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
}

.stat-card {
  padding: 20px 22px;
  border-radius: 18px;
  border: 1px solid var(--glass-border);
  background: rgba(255, 255, 255, 0.04);
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.stat-label {
  font-size: 13px;
  color: var(--text-secondary);
}

.stat-value {
  font-size: 26px;
  font-weight: 700;
  color: var(--text-primary);
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.02em;
}

.stats-row-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

/* 分组卡片 */
.settings-section {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--glass-border);
  border-radius: 20px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.chart-section {
  padding-bottom: 24px;
}

.chart-body {
  padding: 0 24px;
  flex: 1;
}

.section-header {
  padding: 18px 24px 0;
}

.section-header h3 {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.setting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 14px 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.trend-body .setting-row:first-child,
.setting-row:first-of-type {
  margin-top: 12px;
}

.setting-label {
  font-size: 14px;
  color: var(--text-primary);
  font-weight: 500;
}

.row-value {
  font-size: 14px;
  color: var(--text-primary);
  font-weight: 600;
}

/* 趋势条 */
.trend-right {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
  min-width: 140px;
}

.trend-bar {
  flex: 1;
  height: 8px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
  overflow: hidden;
}

.trend-fill {
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, var(--accent-primary), var(--accent-hover));
  transition: width 0.4s ease;
}

.trend-count {
  font-size: 13px;
  color: var(--text-primary);
  min-width: 24px;
  text-align: right;
}

.empty-row {
  padding: 20px 24px;
  color: var(--text-muted);
  font-size: 14px;
  text-align: center;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.ghost-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 36px;
  padding: 0 14px;
  border-radius: 10px;
  border: 1px solid var(--glass-border);
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-primary);
  cursor: pointer;
  font-size: 13px;
  font-family: inherit;
  transition: all 0.18s ease;
}

.ghost-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.1);
}

.ghost-btn:disabled {
  opacity: 0.5;
  cursor: wait;
}

.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@media (max-width: 900px) {
  .settings-page { padding: 20px 16px; }
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
  .trend-right { min-width: 100px; }
}
</style>
