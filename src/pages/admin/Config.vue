<template>
  <div class="admin-page">
    <div class="page-header glass-card">
      <div class="header-title">
        <i class="fa-solid fa-gear"></i>
        <div>
          <h1>系统配置</h1>
          <p>当前页直接读写后端 `/api/admin/config` 接口</p>
        </div>
      </div>
    </div>

    <div class="config-container glass-card">
      <div class="config-form">
        <div class="form-group">
          <label class="form-label">
            <i class="fa-solid fa-microchip"></i>
            <span>默认模型</span>
          </label>
          <select v-model="form.defaultModelId" class="form-select">
            <option value="">请选择模型</option>
            <option v-for="model in models" :key="model.id" :value="model.modelId">
              {{ model.name }}（{{ model.modelId }}）
            </option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">
            <i class="fa-solid fa-bullhorn"></i>
            <span>系统公告</span>
          </label>
          <textarea v-model="form.announcement" rows="4" class="form-textarea" placeholder="输入首页公告"></textarea>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">
              <i class="fa-solid fa-calendar-day"></i>
              <span>每日对话上限</span>
            </label>
            <el-input-number v-model="form.dailyLimit" :min="0" :max="100000" style="width: 100%" />
          </div>

          <div class="form-group">
            <label class="form-label">
              <i class="fa-solid fa-gauge-high"></i>
              <span>每分钟请求上限</span>
            </label>
            <el-input-number v-model="form.perMinuteLimit" :min="0" :max="10000" style="width: 100%" />
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
import { ElMessage } from 'element-plus'
import { adminAPI, type AdminModelItem } from '@/utils/api'

const form = ref({
  defaultModelId: '',
  announcement: '',
  dailyLimit: 100,
  perMinuteLimit: 20,
})
const models = ref<AdminModelItem[]>([])

const load = async () => {
  try {
    const [configData, modelResult] = await Promise.all([
      adminAPI.getConfig() as Promise<Record<string, any>>,
      adminAPI.listModels('', 1, 100),
    ])

    form.value = {
      defaultModelId: String(configData?.defaultModelId || ''),
      announcement: String(configData?.announcement || ''),
      dailyLimit: Number(configData?.dailyLimit ?? 100),
      perMinuteLimit: Number(configData?.perMinuteLimit ?? 20),
    }
    models.value = modelResult.items
  } catch (loadError: any) {
    ElMessage.error(loadError?.message || '配置加载失败')
  }
}

const save = async () => {
  try {
    await adminAPI.updateConfig(form.value)
    ElMessage.success('配置已保存')
  } catch (saveError: any) {
    ElMessage.error(saveError?.message || '配置保存失败')
  }
}

onMounted(load)
</script>

<style scoped>
.admin-page {
  max-width: 900px;
  margin: 0 auto;
}

.page-header,
.config-container {
  border-radius: 16px;
}

.page-header {
  padding: 24px;
  margin-bottom: 24px;
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

.config-container {
  padding: 28px;
}

.config-form {
  display: grid;
  gap: 24px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.form-group {
  display: grid;
  gap: 10px;
}

.form-label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--text-primary);
  font-weight: 600;
}

.form-label i {
  color: var(--accent-primary);
}

.form-select,
.form-textarea {
  width: 100%;
  padding: 12px 14px;
  border-radius: 10px;
  border: 1px solid var(--glass-border);
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-primary);
}

.form-textarea {
  resize: vertical;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
}

.primary-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  border: none;
  border-radius: 10px;
  background: var(--accent-primary);
  color: #0a0a0a;
  cursor: pointer;
  font-weight: 600;
}

:deep(.el-input-number .el-input__wrapper) {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--glass-border);
  box-shadow: none;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>