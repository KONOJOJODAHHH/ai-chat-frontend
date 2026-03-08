<template>
  <section class="settings-page glass-card">
    <header class="page-header">
      <div>
        <h2>智能体</h2>
        <p>管理官方预设与我的智能体，保存后可在会话中直接切换使用。</p>
      </div>
      <button class="primary-btn" @click="openCreate">
        <i class="fa-solid fa-plus"></i>
        <span>新建我的智能体</span>
      </button>
    </header>

    <div class="section-stack">
      <section class="agent-section">
        <div class="section-title">
          <h3>官方预设</h3>
          <span>可直接在聊天顶部切换</span>
        </div>
        <div class="agent-grid">
          <article v-for="agent in officialAgents" :key="agent.id" class="agent-card">
            <div>
              <h4>{{ agent.name }}</h4>
              <p>{{ agent.description || '未填写说明' }}</p>
            </div>
            <div class="agent-meta">
              <span>{{ resolveModelName(agent.modelId) }}</span>
              <span>发散度 {{ formatTemperature(agent.temperature) }}</span>
            </div>
          </article>
        </div>
      </section>

      <section class="agent-section">
        <div class="section-title">
          <h3>我的智能体</h3>
          <span>私有，仅当前账号可见</span>
        </div>
        <div v-if="privateAgents.length" class="agent-grid">
          <article v-for="agent in privateAgents" :key="agent.id" class="agent-card private-card">
            <div>
              <h4>{{ agent.name }}</h4>
              <p>{{ agent.description || '未填写说明' }}</p>
            </div>
            <div class="agent-meta">
              <span>{{ resolveModelName(agent.modelId) }}</span>
              <span>发散度 {{ formatTemperature(agent.temperature) }}</span>
            </div>
            <div class="agent-actions">
              <button class="ghost-btn" @click="openEdit(agent)">编辑</button>
              <button class="ghost-btn danger" @click="removeAgent(agent.id)">删除</button>
            </div>
          </article>
        </div>
        <div v-else class="empty-card">你还没有创建私有智能体。</div>
      </section>
    </div>

    <el-dialog v-model="visible" :title="editingId ? '编辑智能体' : '新建智能体'" width="720px">
      <div class="dialog-form">
        <div class="form-group">
          <label>名称</label>
          <input v-model="form.name" class="form-input" placeholder="例如：代码审查助手" />
        </div>
        <div class="form-group">
          <label>说明</label>
          <input v-model="form.description" class="form-input" placeholder="说明这个智能体适合做什么" />
        </div>
        <div class="form-group">
          <label>默认模型</label>
          <select v-model="form.modelId" class="form-input glass-select-native">
            <option value="">请选择模型</option>
            <option v-for="model in chat.models.value" :key="model.id" :value="model.id">{{ model.name }}</option>
          </select>
        </div>
        <div class="form-group">
          <label>发散度（回答随机性）</label>
          <input v-model="form.temperature" class="range-input glass-range" type="range" min="0" max="2" step="0.1" />
          <div class="range-value">{{ Number(form.temperature).toFixed(1) }}（越高越发散）</div>
        </div>
        <div class="form-group">
          <label>系统提示词</label>
          <textarea v-model="form.systemPrompt" class="form-textarea" rows="8" placeholder="输入这个智能体的系统提示词"></textarea>
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

const resolveModelName = (modelId?: string) => {
  return chat.models.value.find(model => model.id === modelId)?.name || modelId || '未指定模型'
}

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
.settings-page { min-height: 100%; box-sizing: border-box; padding: 20px; }
.page-header { margin-bottom: 28px; display: flex; justify-content: space-between; gap: 20px; align-items: flex-start; }
h2 { margin: 0 0 12px; font-size: 26px; font-weight: 700; }
.page-header p { margin: 0; color: var(--text-secondary); line-height: 1.7; }
.section-stack { display: grid; gap: 18px; }
.agent-section { display: grid; gap: 14px; }
.section-title { display: flex; justify-content: space-between; gap: 12px; align-items: center; }
.section-title h3 { margin: 0; }
.section-title span { color: var(--text-secondary); font-size: 13px; }
.agent-grid { display: grid; grid-template-columns: 1fr; gap: 16px; }
.agent-card, .empty-card { padding: 24px; border-radius: 20px; border: 1px solid var(--glass-border); background: rgba(255,255,255,0.04); display: grid; gap: 12px; }
.agent-card h4 { margin: 0 0 6px; font-size: 18px; }
.agent-card p, .empty-card { color: var(--text-secondary); line-height: 1.7; }
.agent-meta, .agent-actions, .dialog-footer { display: flex; justify-content: space-between; gap: 12px; align-items: center; }
.private-card { border-color: rgba(168, 199, 250, 0.18); }
.dialog-form { display: grid; gap: 14px; }
.form-group { display: grid; gap: 8px; }
.form-input, .form-textarea { width: 100%; padding: 12px 14px; border-radius: 10px; border: 1px solid var(--glass-border); background: rgba(0,0,0,0.3); color: var(--text-primary); font-family: 'Inter', sans-serif; font-size: 14px; outline: none; transition: border-color 0.2s; }
.form-textarea { resize: vertical; }
.range-input { width: 100%; margin-top: 4px; }
.range-value { color: var(--text-secondary); font-size: 13px; margin-top: 6px; }
.primary-btn, .ghost-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; min-height: 42px; padding: 0 16px; border-radius: 10px; cursor: pointer; }
.primary-btn { border: none; background: var(--accent-primary); color: #0a0a0a; }
.ghost-btn { border: 1px solid var(--glass-border); background: rgba(255,255,255,0.05); color: var(--text-primary); }
.ghost-btn.danger { color: #f87171; border-color: rgba(248,113,113,0.25); }
@media (max-width: 900px) { .page-header, .agent-grid { grid-template-columns: 1fr; display: grid; } }
</style>
