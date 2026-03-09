<template>
  <div class="modal-overlay" :class="{ show: modelValue }" @click.self="closeModal">
    <div class="holo-modal">
      <div class="modal-header">
        <div class="modal-title">
          <i class="fa-solid fa-sliders"></i>
          <span>会话模型配置</span>
        </div>
        <i class="fa-solid fa-xmark close-modal" @click="closeModal"></i>
      </div>

      <div class="modal-body">
        <div class="modal-content-area">
          <div class="config-grid">
            <div class="form-group">
              <label class="form-label">智能体</label>
              <el-select v-model="draft.agentId" placeholder="选择智能体" class="glass-select" popper-class="glass-dropdown">
                <el-option label="不使用智能体" value="" />
                <el-option-group v-if="officialAgents.length" label="官方预设">
                  <el-option v-for="agent in officialAgents" :key="agent.id" :label="agent.name" :value="agent.id" />
                </el-option-group>
                <el-option-group v-if="privateAgents.length" label="我的智能体">
                  <el-option v-for="agent in privateAgents" :key="agent.id" :label="agent.name" :value="agent.id" />
                </el-option-group>
              </el-select>
            </div>

            <div class="form-group">
              <label class="form-label">模型</label>
              <el-select v-model="draft.modelId" placeholder="选择模型" class="glass-select" popper-class="glass-dropdown">
                <el-option-group v-if="officialModels.length" label="官方预设">
                  <el-option v-for="model in officialModels" :key="model.id" :label="`${model.name}（${model.provider}）`" :value="model.id" />
                </el-option-group>
                <el-option-group v-if="userModels.length" label="我的自定义">
                  <el-option v-for="model in userModels" :key="model.id" :label="`${model.name}（${model.provider}）`" :value="model.id" />
                </el-option-group>
                <el-option v-if="!officialModels.length && !userModels.length" v-for="model in models" :key="model.id" :label="`${model.name}（${model.provider}）`" :value="model.id" />
              </el-select>
            </div>
          </div>

          <div class="config-grid">
            <div class="form-group">
              <label class="form-label">回答发散度</label>
              <input class="range-input glass-range" type="range" min="0" max="2" step="0.1" v-model="draft.temperature" />
              <div class="range-value">{{ Number(draft.temperature).toFixed(1) }}</div>
            </div>

            <div class="agent-preview" v-if="selectedAgent">
              <span class="preview-label">智能体说明</span>
              <strong>{{ selectedAgent.name }}</strong>
              <p>{{ selectedAgent.description || '该智能体未填写说明。' }}</p>
            </div>
          </div>

          <div class="system-prompt-section">
            <div class="system-prompt-label">
              <i class="fa-solid fa-circle-info"></i>
              <span>系统提示词（当前会话有效）</span>
            </div>
            <textarea
              class="form-textarea"
              v-model="draft.systemPrompt"
              placeholder="例如：你是一个专注代码审查与架构建议的技术助手。"
            ></textarea>
          </div>

          <div class="runtime-summary">
            <div class="summary-row">
              <span>当前生效模型</span>
              <strong>{{ selectedModelName }}</strong>
            </div>
            <div class="summary-row">
              <span>当前生效智能体</span>
              <strong>{{ selectedAgent?.name || '无' }}</strong>
            </div>
          </div>

          <div class="modal-footer">
            <button class="confirm-btn cancel" @click="closeModal">取消</button>
            <button class="save-btn" @click="saveConfig">应用配置</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import { ElMessage } from 'element-plus'
import type { AIModel, AgentDefinition, RuntimeConfigValues } from '@/composables/useChatStore'

const props = defineProps<{
  modelValue: boolean
  models: AIModel[]
  currentModel: AIModel
  officialAgents: AgentDefinition[]
  privateAgents: AgentDefinition[]
  runtimeConfig: RuntimeConfigValues
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  applyRuntime: [config: RuntimeConfigValues]
}>()

const draft = reactive<Required<RuntimeConfigValues>>({
  modelId: props.runtimeConfig.modelId || props.currentModel.id,
  agentId: props.runtimeConfig.agentId || '',
  systemPrompt: props.runtimeConfig.systemPrompt || '',
  temperature: props.runtimeConfig.temperature ?? props.currentModel.temperature ?? 0.7,
})

const allAgents = computed(() => [...props.officialAgents, ...props.privateAgents])

const officialModels = computed(() => props.models.filter(m => m.official !== false))
const userModels = computed(() => props.models.filter(m => m.official === false))

const selectedAgent = computed(() => allAgents.value.find(agent => agent.id === draft.agentId) || null)
const selectedModelName = computed(() => props.models.find(model => model.id === draft.modelId)?.name || props.currentModel.name)

watch(() => props.modelValue, (visible) => {
  if (!visible) return
  draft.modelId = props.runtimeConfig.modelId || props.currentModel.id
  draft.agentId = props.runtimeConfig.agentId || ''
  draft.systemPrompt = props.runtimeConfig.systemPrompt || ''
  draft.temperature = props.runtimeConfig.temperature ?? props.currentModel.temperature ?? 0.7
})

watch(selectedAgent, (agent) => {
  if (!agent) return
  if (!draft.systemPrompt && agent.systemPrompt) {
    draft.systemPrompt = agent.systemPrompt
  }
  if ((!draft.modelId || draft.modelId === props.currentModel.id) && agent.modelId) {
    draft.modelId = agent.modelId
  }
  if (agent.temperature != null) {
    draft.temperature = agent.temperature
  }
})

const closeModal = () => {
  emit('update:modelValue', false)
}

const saveConfig = () => {
  if (!draft.modelId) {
    ElMessage.warning('请选择模型')
    return
  }

  emit('applyRuntime', {
    modelId: draft.modelId,
    agentId: draft.agentId || undefined,
    systemPrompt: draft.systemPrompt,
    temperature: Number(draft.temperature),
  })
  ElMessage.success('当前会话配置已更新')
  closeModal()
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.7);
  backdrop-filter: blur(5px);
  z-index: 100;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s;
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-overlay.show {
  opacity: 1;
  pointer-events: auto;
}

.holo-modal {
  width: 650px;
  max-width: 94vw;
  max-height: 88vh;
  background: rgba(24, 24, 27, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
  border-radius: 20px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  transform: scale(0.9);
  transition: transform 0.3s var(--ease-out);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-overlay.show .holo-modal {
  transform: scale(1);
}

.modal-header {
  padding: 24px;
  border-bottom: 1px solid var(--glass-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title {
  font-size: 18px;
  color: white;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 10px;
}

.modal-title i {
  color: var(--accent-primary);
}

.close-modal {
  cursor: pointer;
  color: var(--text-muted);
  font-size: 20px;
}

.modal-body {
  padding: 0;
  flex: 1;
  overflow-y: auto;
}

.modal-content-area {
  padding: 24px;
}

.config-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
  margin-bottom: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label,
.preview-label {
  font-size: 12px;
  color: var(--text-secondary);
  font-weight: 600;
}

.form-input,
.form-textarea,
.range-input {
  width: 100%;
}

.range-input {
  margin-top: 4px;
}

.form-input,
.form-textarea {
  padding: 12px;
  background: rgba(0,0,0,0.3);
  border: 1px solid var(--glass-border);
  border-radius: 8px;
  color: var(--text-primary);
  font-family: inherit;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}

.form-input::placeholder,
.form-textarea::placeholder {
  color: var(--text-muted);
}

.form-input:hover,
.form-textarea:hover {
  border-color: rgba(168, 199, 250, 0.25);
}

.form-input:focus,
.form-textarea:focus {
  border-color: rgba(168, 199, 250, 0.5);
}

.form-textarea {
  resize: vertical;
  min-height: 180px;
  line-height: 1.6;
}

.agent-preview,
.runtime-summary,
.system-prompt-section {
  background: rgba(255,255,255,0.03);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
}

.agent-preview {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.agent-preview strong {
  color: var(--text-primary);
}

.agent-preview p,
.range-value,
.runtime-summary span {
  color: var(--text-secondary);
}

.system-prompt-section {
  padding: 20px;
  margin-bottom: 20px;
}

.system-prompt-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.runtime-summary {
  padding: 16px 20px;
  display: grid;
  gap: 12px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  gap: 16px;
}

.summary-row strong {
  color: var(--text-primary);
}

.modal-footer {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.save-btn,
.confirm-btn {
  padding: 12px 24px;
  border-radius: 10px;
  border: none;
  font-weight: 600;
  cursor: pointer;
}

.save-btn {
  background: var(--accent-primary);
  color: #062e6f;
}

.confirm-btn.cancel {
  background: rgba(255,255,255,0.05);
  color: var(--text-primary);
}

@media (max-width: 768px) {
  .config-grid {
    grid-template-columns: 1fr;
  }
}
</style>
