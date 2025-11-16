<template>
  <div class="admin-page">
    <div class="page-header glass-card">
      <div class="header-title">
        <i class="fa-solid fa-gear"></i>
        <h1>系统配置</h1>
      </div>
    </div>

    <div class="config-container glass-card">
      <div class="config-form">
        <div class="form-group">
          <label class="form-label">
            <i class="fa-solid fa-microchip"></i>
            <span>默认使用模型</span>
          </label>
          <select v-model="form.defaultModelId" class="form-select">
            <option value="">选择模型</option>
            <option v-for="m in models" :key="m.id" :value="m.id">{{ m.name }}</option>
          </select>
          <p class="form-hint">新用户默认使用的AI模型</p>
        </div>

        <div class="form-group">
          <label class="form-label">
            <i class="fa-solid fa-bullhorn"></i>
            <span>系统公告</span>
          </label>
          <textarea v-model="form.announcement" class="form-textarea" rows="4" placeholder="输入系统公告内容"></textarea>
          <p class="form-hint">将显示在用户界面顶部</p>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">
              <i class="fa-solid fa-calendar-day"></i>
              <span>每日对话限制</span>
            </label>
            <el-input-number v-model="form.dailyLimit" :min="0" :max="1000" class="form-number" />
            <p class="form-hint">每个用户每天最大对话次数</p>
          </div>

          <div class="form-group">
            <label class="form-label">
              <i class="fa-solid fa-gauge-high"></i>
              <span>请求速率限制</span>
            </label>
            <el-input-number v-model="form.perMinuteLimit" :min="0" :max="100" class="form-number" />
            <p class="form-hint">每分钟最大请求数</p>
          </div>
        </div>

        <div class="form-actions">
          <button class="primary-btn" @click="save">
            <i class="fa-solid fa-check"></i>
            <span>保存配置</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { adminAPI } from '@/utils/api'
import { ElMessage } from 'element-plus'

const form = ref<any>({})
const models = ref<any[]>([])

const load = async () => { 
  try {
    form.value = await adminAPI.getConfig()
    const mr: any = await adminAPI.listModels()
    models.value = mr.items || mr
  } catch (e) {
    ElMessage.error('加载配置失败')
  }
}

const save = async () => { 
  try {
    await adminAPI.updateConfig(form.value)
    ElMessage.success('配置已保存')
  } catch (e) {
    ElMessage.error('保存失败')
  }
}

onMounted(load)
</script>

<style scoped>
.admin-page {
  max-width: 900px;
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

.config-container {
  padding: 32px;
  border-radius: 16px;
}

.config-form {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
}

.form-label i {
  font-size: 18px;
  color: var(--accent-primary);
}

.form-select,
.form-textarea {
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--glass-border);
  border-radius: 10px;
  color: var(--text-primary);
  font-size: 14px;
  transition: all 0.2s;
  width: 100%;
  font-family: inherit;
}

.form-select:hover,
.form-textarea:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: var(--accent-primary);
}

.form-select:focus,
.form-textarea:focus {
  outline: none;
  background: rgba(255, 255, 255, 0.08);
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px rgba(168, 199, 250, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

.form-hint {
  font-size: 13px;
  color: var(--text-muted);
  margin: 0;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.form-number {
  width: 100%;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  padding-top: 16px;
  border-top: 1px solid var(--glass-border);
}

.primary-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: var(--accent-primary);
  color: #0a0a0a;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.primary-btn:hover {
  background: var(--accent-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(168, 199, 250, 0.3);
}

:deep(.el-input-number) {
  width: 100%;
}

:deep(.el-input-number .el-input__wrapper) {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--glass-border);
  box-shadow: none;
  border-radius: 10px;
}

:deep(.el-input-number .el-input__wrapper:hover) {
  background: rgba(255, 255, 255, 0.08);
  border-color: var(--accent-primary);
}

:deep(.el-input-number .el-input__inner) {
  color: var(--text-primary);
}
</style>
