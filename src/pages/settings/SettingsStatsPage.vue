<template>
  <section class="settings-page glass-card">
    <header class="page-header">
      <div>
        <h2>数据统计</h2>
        <p>展示个人使用概况与趋势分析，数据来自服务器实时聚合。</p>
      </div>
      <button class="refresh-btn" :disabled="loading" @click="load">
        <i class="fa-solid fa-rotate-right" :class="{ spinning: loading }"></i>
        <span>{{ loading ? '刷新中...' : '刷新统计' }}</span>
      </button>
    </header>

    <div class="stats-grid">
      <article v-for="card in cards" :key="card.title" class="stat-card">
        <span>{{ card.title }}</span>
        <strong>{{ card.value }}</strong>
        <small>{{ card.description }}</small>
      </article>
    </div>

    <div class="charts-grid">
      <section class="chart-card">
        <div class="chart-header">
          <h3>最近 7 天活跃趋势</h3>
          <span>按真实聊天调用聚合</span>
        </div>
        <div v-if="trendItems.length" class="trend-list">
          <div v-for="item in trendItems" :key="item.label" class="trend-item">
            <div class="trend-label">
              <span>{{ item.label }}</span>
              <strong>{{ item.count }}</strong>
            </div>
            <div class="trend-bar">
              <div class="trend-fill" :style="{ width: getTrendWidth(item.count) }"></div>
            </div>
          </div>
        </div>
        <div v-else class="empty-inline">暂无趋势数据</div>
      </section>

      <section class="chart-card">
        <div class="chart-header">
          <h3>常用模型分布</h3>
          <span>按真实调用记录统计</span>
        </div>
        <div v-if="modelDistribution.length" class="distribution-list">
          <div v-for="item in modelDistribution" :key="item.name" class="distribution-item">
            <span>{{ item.name }}</span>
            <strong>{{ item.count }}</strong>
          </div>
        </div>
        <div v-else class="empty-inline">暂无模型分布数据</div>
      </section>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { chatAPI, type DistributionItem, type UserStatsResponse } from '@/utils/api'

const loading = ref(false)
const stats = ref<UserStatsResponse | null>(null)

const cards = computed(() => {
  const current = stats.value
  return [
    { title: '个人会话数', value: current?.conversationCount ?? '--', description: '按当前账号真实会话记录统计。' },
    { title: '消息总量', value: current?.messageCount ?? '--', description: '基于后端消息表与调用链聚合。' },
    { title: '失败次数', value: current?.failureCount ?? '--', description: '统计真实失败调用次数。' },
    { title: '平均响应时长', value: current?.averageDuration ? `${current.averageDuration} ms` : '--', description: '按真实调用日志计算。' },
  ]
})

const trendItems = computed(() => stats.value?.recentActivityTrend || [])
const modelDistribution = computed<DistributionItem[]>(() => stats.value?.modelDistribution || [])

const getTrendWidth = (count: number) => {
  const max = Math.max(...trendItems.value.map(item => item.count), 1)
  return `${Math.max(10, Math.round((count / max) * 100))}%`
}

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
.settings-page { min-height: 100%; box-sizing: border-box; padding: 20px; }
.page-header { margin-bottom: 28px; display: flex; justify-content: space-between; gap: 20px; align-items: flex-start; }
h2 { margin: 0 0 12px; font-size: 26px; font-weight: 700; }
p { margin: 0; color: var(--text-secondary); line-height: 1.7; }
.stats-grid { display: grid; grid-template-columns: 1fr; gap: 16px; }
.stat-card { padding: 24px; border-radius: 20px; border: 1px solid var(--glass-border); background: rgba(255,255,255,0.04); display: flex; flex-direction: column; gap: 10px; }
.stat-card strong { font-size: 24px; color: var(--text-primary); }
.stat-card small { color: var(--text-secondary); line-height: 1.7; }
.refresh-btn { display: inline-flex; align-items: center; gap: 8px; padding: 10px 16px; border: none; border-radius: 10px; background: var(--accent-primary); color: #0a0a0a; cursor: pointer; font-weight: 600; }
.charts-grid { display: grid; grid-template-columns: 1fr; gap: 16px; margin-top: 16px; }
.chart-card { padding: 24px; border-radius: 20px; border: 1px solid var(--glass-border); background: rgba(255,255,255,0.04); }
.chart-header { display: flex; justify-content: space-between; gap: 12px; align-items: center; margin-bottom: 16px; }
.chart-header h3 { margin: 0; }
.chart-header span { color: var(--text-secondary); font-size: 12px; }
.trend-list, .distribution-list { display: grid; gap: 14px; }
.trend-label, .distribution-item { display: flex; justify-content: space-between; gap: 12px; color: var(--text-secondary); }
.trend-bar { height: 12px; border-radius: 999px; background: rgba(255,255,255,0.06); overflow: hidden; border: 1px solid var(--glass-border); }
.trend-fill { height: 100%; border-radius: 999px; background: linear-gradient(90deg, var(--accent-primary), var(--accent-hover)); }
.distribution-item strong, .trend-label strong { color: var(--text-primary); }
.empty-inline { color: var(--text-muted); padding: 12px 0; }
.spinning { animation: spin 1s linear infinite; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
@media (max-width: 900px) { .page-header, .stats-grid, .charts-grid { grid-template-columns: 1fr; display: grid; } }
</style>
