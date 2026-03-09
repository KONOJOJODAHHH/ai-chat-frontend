<template>
  <section class="settings-page">
    <div class="page-title-row">
      <h2 class="page-title">智能体</h2>
      <button class="primary-btn" @click="openCreate">
        <i class="fa-solid fa-plus"></i>
        <span>新建智能体</span>
      </button>
    </div>

    <!-- 官方预设 -->
    <div class="settings-section">
      <div class="section-header">
        <h3>官方预设</h3>
      </div>

      <div v-if="officialAgents.length">
        <div v-for="agent in officialAgents" :key="agent.id" class="agent-row">
          <div class="agent-info">
            <span class="agent-name">{{ agent.name }}</span>
            <span class="agent-desc">{{ agent.description || '未填写说明' }}</span>
          </div>
          <div class="agent-tags">
            <span class="tag">{{ resolveModelName(agent.modelId) }}</span>
            <span class="tag">发散度 {{ formatTemperature(agent.temperature) }}</span>
          </div>
        </div>
      </div>
      <div v-else class="empty-row">暂无官方预设</div>
    </div>

    <!-- 我的智能体 -->
    <div class="settings-section">
      <div class="section-header">
        <h3>我的智能体</h3>
      </div>

      <div v-if="privateAgents.length">
        <div v-for="agent in privateAgents" :key="agent.id" class="agent-row">
          <div class="agent-info">
            <span class="agent-name">{{ agent.name }}</span>
            <span class="agent-desc">{{ agent.description || '未填写说明' }}</span>
          </div>
          <div class="agent-actions">
            <span class="tag">{{ resolveModelName(agent.modelId) }}</span>
            <button class="ghost-btn" @click="openEdit(agent)">编辑</button>
            <button class="ghost-btn danger" @click="removeAgent(agent.id)">删除</button>
          </div>
        </div>
      </div>
      <div v-else class="empty-row">你还没有创建智能体。点击右上角「新建智能体」开始创建。</div>
    </div>

    <!-- 编辑/新建对话框 -->
    <el-dialog v-model="visible" :title="editingId ? '编辑智能体' : '新建智能体'" width="680px">
      <div class="dialog-form">
        <div class="dialog-row">
          <label>名称</label>
          <input v-model="form.name" class="dialog-input" placeholder="例如：代码审查助手" />
        </div>
        <div class="dialog-row">
          <label>说明</label>
          <input v-model="form.description" class="dialog-input" placeholder="说明这个智能体适合做什么" />
        </div>
        <div class="dialog-row">
          <label>默认模型</label>
          <select v-model="form.modelId" class="dialog-input glass-select-native">
            <option value="">请选择模型</option>
            <option v-for="model in chat.models.value" :key="model.id" :value="model.id">{{ model.name }}</option>
          </select>
        </div>
        <div class="dialog-row">
          <label>发散度</label>
          <div class="range-wrap">
            <input v-model="form.temperature" class="range-input glass-range" type="range" min="0" max="2" step="0.1" />
            <span class="range-val">{{ Number(form.temperature).toFixed(1) }}（越高越随机）</span>
          </div>
        </div>
        <div class="dialog-row col">
          <label>系统提示词</label>
          <textarea v-model="form.systemPrompt" class="dialog-textarea" rows="7" placeholder="输入这个智能体的系统提示词"></textarea>
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <button class="ghost-btn" @click="visible = false">取消</button>
          <button class="primary-btn" @click="saveAgent">保存</button>
        </div>
      </template>
    </el-dialog>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useChatStore, type AgentDefinition } from '@/composables/useChatStore'
import { chatAPI } from '@/utils/api'

const chat = useChatStore()
const visible = ref(false)
const editingId = ref<string | null>(null)
const form = reactive({
  name: '',
  description: '',
  modelId: '',
  systemPrompt: '',
  temperature: 0.7,
})

const officialAgents = computed(() => chat.officialAgents.value)
const privateAgents = computed(() => chat.privateAgents.value)

const loadAgents = async () => {
  try {
    const payload = await chatAPI.getAgents()
    chat.setAgents(payload)
  } catch (error: any) {
    ElMessage.error(error?.message || '智能体加载失败')
  }
}

const resolveModelName = (modelId?: string) =>
  chat.models.value.find(model => model.id === modelId)?.name || modelId || '未指定模型'

const formatTemperature = (value?: number) => Number(value ?? 0.7).toFixed(1)

const resetForm = () => {
  form.name = ''
  form.description = ''
  form.modelId = chat.currentModel.value.id || ''
  form.systemPrompt = ''
  form.temperature = 0.7
}

const openCreate = () => {
  editingId.value = null
  resetForm()
  visible.value = true
}

const openEdit = (agent: AgentDefinition) => {
  editingId.value = agent.id
  form.name = agent.name
  form.description = agent.description || ''
  form.modelId = agent.modelId || ''
  form.systemPrompt = agent.systemPrompt || ''
  form.temperature = agent.temperature ?? 0.7
  visible.value = true
}

const saveAgent = async () => {
  if (!form.name.trim()) {
    ElMessage.warning('请输入智能体名称')
    return
  }
  const payload = {
    name: form.name.trim(),
    description: form.description.trim(),
    modelId: form.modelId || undefined,
    systemPrompt: form.systemPrompt,
    temperature: Number(form.temperature),
  }
  try {
    if (editingId.value) {
      await chatAPI.updateAgent(editingId.value, payload)
      ElMessage.success('智能体已更新')
    } else {
      await chatAPI.createAgent(payload)
      ElMessage.success('智能体已创建')
    }
    visible.value = false
    await loadAgents()
  } catch (error: any) {
    ElMessage.error(error?.message || '保存失败')
  }
}

const removeAgent = async (id: string) => {
  try {
    await chatAPI.deleteAgent(id)
    ElMessage.success('智能体已删除')
    await loadAgents()
  } catch (error: any) {
    ElMessage.error(error?.message || '删除失败')
  }
}

onMounted(loadAgents)
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

/* 卡片 */
.settings-section {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--glass-border);
  border-radius: 20px;
  overflow: hidden;
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

/* 智能体行 */
.agent-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 16px 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.settings-section > div:not(.section-header) > .agent-row:first-child,
.agent-row:first-of-type {
  margin-top: 12px;
}

.agent-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.agent-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.agent-desc {
  font-size: 12px;
  color: var(--text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.agent-tags, .agent-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.tag {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 0 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid var(--glass-border);
  color: var(--text-secondary);
  font-size: 12px;
  white-space: nowrap;
}

.empty-row {
  padding: 20px 24px;
  color: var(--text-muted);
  font-size: 14px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

/* 按钮 */
.primary-btn, .ghost-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 36px;
  padding: 0 14px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 13px;
  font-family: inherit;
  transition: all 0.18s ease;
}

.primary-btn {
  border: 1px solid rgba(168, 199, 250, 0.25);
  background: rgba(168, 199, 250, 0.12);
  color: var(--accent-primary);
  font-weight: 500;
}

.primary-btn:hover {
  background: rgba(168, 199, 250, 0.2);
}

.ghost-btn {
  border: 1px solid var(--glass-border);
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-primary);
}

.ghost-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.ghost-btn.danger {
  color: #f87171;
  border-color: rgba(248, 113, 113, 0.25);
}

.ghost-btn.danger:hover {
  background: rgba(248, 113, 113, 0.08);
}

/* 对话框表单 */
.dialog-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.dialog-row {
  display: flex;
  align-items: center;
  gap: 16px;
}

.dialog-row.col {
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
}

.dialog-row label {
  width: 90px;
  flex-shrink: 0;
  font-size: 14px;
  color: var(--text-secondary);
}

.dialog-input {
  flex: 1;
  min-height: 38px;
  padding: 0 12px;
  border-radius: 10px;
  border: 1px solid var(--glass-border);
  background: rgba(0, 0, 0, 0.3);
  color: var(--text-primary);
  font-family: inherit;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}

.dialog-input::placeholder {
  color: var(--text-muted);
}

.dialog-input:hover {
  border-color: rgba(168, 199, 250, 0.3);
}

.dialog-input:focus {
  border-color: var(--accent-primary);
}

/* select 特殊处理：覆盖 appearance 以支持自定义箭头 */
select.dialog-input {
  appearance: none;
  -webkit-appearance: none;
  padding: 0 36px 0 12px;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%239ca3af' stroke-width='1.5' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: calc(100% - 12px) center;
  cursor: pointer;
}

select.dialog-input option {
  background: #18181b;
  color: var(--text-primary);
}

.dialog-textarea {
  width: 100%;
  box-sizing: border-box;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid var(--glass-border);
  background: rgba(0, 0, 0, 0.3);
  color: var(--text-primary);
  font-family: inherit;
  font-size: 14px;
  line-height: 1.6;
  outline: none;
  resize: vertical;
  transition: border-color 0.2s;
}

.dialog-textarea::placeholder {
  color: var(--text-muted);
}

.dialog-textarea:hover {
  border-color: rgba(168, 199, 250, 0.3);
}

.dialog-textarea:focus {
  border-color: var(--accent-primary);
}

.range-wrap {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.range-input {
  width: 100%;
}

.range-val {
  font-size: 12px;
  color: var(--text-secondary);
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

@media (max-width: 900px) {
  .settings-page { padding: 20px 16px; }
  .page-title-row { flex-wrap: wrap; }
  .agent-row { flex-direction: column; align-items: flex-start; gap: 10px; }
}
</style>
