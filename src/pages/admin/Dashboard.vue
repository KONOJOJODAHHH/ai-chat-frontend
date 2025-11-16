<template>
  <div class="admin-page">
    <div class="page-header glass-card">
      <div class="header-title">
        <i class="fa-solid fa-chart-line"></i>
        <h1>控制面板</h1>
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-card glass-card">
        <div class="stat-icon" style="background: rgba(59, 130, 246, 0.1);">
          <i class="fa-solid fa-users" style="color: #3b82f6;"></i>
        </div>
        <div class="stat-content">
          <div class="stat-label">总用户数</div>
          <div class="stat-value">{{ data?.users || 0 }}</div>
        </div>
      </div>

      <div class="stat-card glass-card">
        <div class="stat-icon" style="background: rgba(168, 199, 250, 0.1);">
          <i class="fa-solid fa-comments" style="color: var(--accent-primary);"></i>
        </div>
        <div class="stat-content">
          <div class="stat-label">总会话数</div>
          <div class="stat-value">{{ data?.sessions || 0 }}</div>
        </div>
      </div>

      <div class="stat-card glass-card">
        <div class="stat-icon" style="background: rgba(34, 197, 94, 0.1);">
          <i class="fa-solid fa-message" style="color: #22c55e;"></i>
        </div>
        <div class="stat-content">
          <div class="stat-label">总消息数</div>
          <div class="stat-value">{{ data?.messages || 0 }}</div>
        </div>
      </div>

      <div class="stat-card glass-card">
        <div class="stat-icon" style="background: rgba(234, 179, 8, 0.1);">
          <i class="fa-solid fa-user-plus" style="color: #eab308;"></i>
        </div>
        <div class="stat-content">
          <div class="stat-label">今日新增用户</div>
          <div class="stat-value">{{ data?.todayUsers || 0 }}</div>
        </div>
      </div>
    </div>

    <div class="chart-card glass-card">
      <div class="chart-header">
        <h2>各模型调用次数</h2>
        <i class="fa-solid fa-chart-bar"></i>
      </div>
      <div class="chart-body">
        <div v-for="m in data?.modelCalls || []" :key="m.name" class="chart-item">
          <div class="chart-label">
            <span class="model-name">{{ m.name }}</span>
            <span class="model-count">{{ m.count }} 次</span>
          </div>
          <div class="progress-bar">
            <div 
              class="progress-fill" 
              :style="{ width: Math.min(100, (m.count * 5)) + '%' }"
            ></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { adminAPI } from '@/utils/api'

const data = ref<any>(null)

onMounted(async () => { 
  data.value = await adminAPI.dashboard() 
})
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

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px;
  border-radius: 16px;
  transition: all 0.3s var(--ease-out);
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.stat-icon {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  font-size: 24px;
}

.stat-content {
  flex: 1;
}

.stat-label {
  font-size: 13px;
  color: var(--text-muted);
  margin-bottom: 4px;
  font-weight: 500;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: var(--text-primary);
  font-family: 'Orbitron', sans-serif;
}

.chart-card {
  padding: 24px;
  border-radius: 16px;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--glass-border);
}

.chart-header h2 {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.chart-header i {
  font-size: 20px;
  color: var(--accent-primary);
}

.chart-body {
  display: grid;
  gap: 20px;
}

.chart-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.chart-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
}

.model-name {
  color: var(--text-primary);
  font-weight: 500;
}

.model-count {
  color: var(--text-muted);
  font-size: 13px;
  font-family: 'Orbitron', sans-serif;
}

.progress-bar {
  height: 28px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--glass-border);
  position: relative;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent-primary), var(--accent-hover));
  border-radius: 8px;
  transition: width 0.6s var(--ease-out);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 12px;
  box-shadow: 0 0 20px rgba(168, 199, 250, 0.3);
}

.progress-fill::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
</style>