<template>
  <div class="modal-overlay" :class="{ show: modelValue }" @click.self="closeModal">
    <div class="holo-modal">
      <div class="modal-header">
        <div class="modal-title">
          <i class="fa-solid fa-sliders"></i>
          <span>模型配置</span>
        </div>
        <i class="fa-solid fa-xmark close-modal" @click="closeModal"></i>
      </div>

      <div class="modal-body">
        <div class="modal-content-area">
          <div class="settings-form">
            
            <div class="form-group">
              <div class="label-row">
                <label class="form-label">模型</label>
              </div>
              <el-select v-model="draft.modelId" placeholder="选择模型" class="glass-select" popper-class="glass-dropdown">
                <el-option-group
                  v-for="group in officialModelGroups"
                  :key="`official-${group.provider}`"
                  :label="group.provider"
                >
                  <el-option v-for="model in group.items" :key="model.id" :label="model.name" :value="model.id" />
                </el-option-group>
                <el-option-group
                  v-for="group in userModelGroups"
                  :key="`user-${group.provider}`"
                  :label="group.provider"
                >
                  <el-option v-for="model in group.items" :key="model.id" :label="model.name" :value="model.id" />
                </el-option-group>
                <el-option-group
                  v-if="!officialModelGroups.length && !userModelGroups.length"
                  v-for="group in fallbackModelGroups"
                  :key="`fallback-${group.provider}`"
                  :label="group.provider"
                >
                  <el-option v-for="model in group.items" :key="model.id" :label="model.name" :value="model.id" />
                </el-option-group>
              </el-select>
            </div>

            <div class="form-group">
              <div class="label-row">
                <label class="form-label">智能体</label>
              </div>
              <el-select v-model="draft.agentId" placeholder="选择智能体" class="glass-select" popper-class="glass-dropdown">
                <el-option label="不使用智能体" value="" />
                <el-option-group v-if="officialAgents.length" label="官方预设">
                  <el-option v-for="agent in officialAgents" :key="agent.id" :label="agent.name" :value="agent.id" class="agent-custom-option">
                    <div class="agent-option-content">
                      <div class="agent-name">{{ agent.name }}</div>
                      <div class="agent-desc" v-if="agent.description">{{ agent.description }}</div>
                    </div>
                  </el-option>
                </el-option-group>
                <el-option-group v-if="privateAgents.length" label="我的智能体">
                  <el-option v-for="agent in privateAgents" :key="agent.id" :label="agent.name" :value="agent.id" class="agent-custom-option">
                    <div class="agent-option-content">
                      <div class="agent-name">{{ agent.name }}</div>
                      <div class="agent-desc" v-if="agent.description">{{ agent.description }}</div>
                    </div>
                  </el-option>
                </el-option-group>
              </el-select>
            </div>
            
            <div class="form-divider"></div>

            <div class="form-group">
              <div class="label-row">
                <label class="form-label">系统提示词</label>
                <span class="sync-badge" v-if="selectedAgent && selectedAgent.systemPrompt === draft.systemPrompt">已从智能体同步</span>
              </div>
              <textarea
                class="form-textarea"
                v-model="draft.systemPrompt"
                placeholder="例如：你是一个专注代码审查与架构建议的技术助手。"
              ></textarea>
            </div>

            <div class="form-group">
              <div class="label-row">
                <div style="display: flex; align-items: center; gap: 6px;">
                  <label class="form-label">模型温度</label>
                  <el-tooltip content="数值越小回答越严谨，数值越大回答越具创造性" placement="top">
                    <i class="fa-regular fa-circle-question helper-icon" style="margin-left: 0;"></i>
                  </el-tooltip>
                </div>
                <span class="range-value-badge">{{ Number(draft.temperature).toFixed(1) }}</span>
              </div>
              <div class="range-wrapper">
                <span class="range-label-min">严谨</span>
                <input class="range-input glass-range" type="range" min="0" max="2" step="0.1" v-model="draft.temperature" />
                <span class="range-label-max">创造性</span>
              </div>
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
import { groupModelsByProvider } from '@/utils/modelGroups'

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
const officialModelGroups = computed(() => groupModelsByProvider(officialModels.value))
const userModelGroups = computed(() => groupModelsByProvider(userModels.value))
const fallbackModelGroups = computed(() => groupModelsByProvider(props.models))

const selectedAgent = computed(() => allAgents.value.find(agent => agent.id === draft.agentId) || null)

watch(() => props.modelValue, (visible) => {
  if (!visible) return
  draft.modelId = props.runtimeConfig.modelId || props.currentModel.id
  draft.agentId = props.runtimeConfig.agentId || ''
  draft.systemPrompt = props.runtimeConfig.systemPrompt || ''
  draft.temperature = props.runtimeConfig.temperature ?? props.currentModel.temperature ?? 0.7
})

watch(selectedAgent, (agent) => {
  if (!agent) {
    draft.systemPrompt = ''
    return
  }
  
  // 切换智能体时，如果智能体有配置则强制覆盖
  if (agent.systemPrompt !== undefined) {
    draft.systemPrompt = agent.systemPrompt
  } else {
    draft.systemPrompt = ''
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

<style>
/* Global styles specifically mapped to the teleported dropdown */
.glass-dropdown .agent-custom-option {
  height: auto;
  min-height: 48px;
  line-height: normal;
  padding: 8px 16px;
}
.glass-dropdown .agent-custom-option.is-selected .agent-desc {
  color: var(--accent-primary);
  opacity: 0.8;
}

.agent-option-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.agent-option-content .agent-name {
  font-weight: 500;
  font-size: 14px;
}
.agent-option-content .agent-desc {
  font-size: 12px;
  color: var(--text-secondary);
  white-space: normal;
  line-height: 1.4;
  word-break: break-word;
}
</style>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  backdrop-filter: blur(8px);
  z-index: 100;
  opacity: 0;
  pointer-events: none;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-overlay.show {
  opacity: 1;
  pointer-events: auto;
}

.holo-modal {
  width: 540px;
  max-width: 92vw;
  max-height: 90vh;
  background: rgba(24, 24, 27, 0.75);
  backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  box-shadow: 0 30px 60px -15px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.1);
  transform: translateY(20px) scale(0.95);
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-overlay.show .holo-modal {
  transform: translateY(0) scale(1);
}

.modal-header {
  padding: 24px 28px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title {
  font-size: 18px;
  color: var(--text-primary);
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 12px;
}

.modal-title i {
  color: var(--accent-primary);
  opacity: 0.9;
}

.close-modal {
  cursor: pointer;
  color: var(--text-secondary);
  font-size: 18px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
  transition: background 0.2s, color 0.2s;
}

.close-modal:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-primary);
}

.modal-body {
  padding: 0;
  flex: 1;
  overflow-y: auto;
}

.modal-content-area {
  padding: 0 28px 28px;
}

.settings-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-divider {
  height: 1px;
  background: var(--glass-border);
  margin: 4px 0;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  column-gap: 8px;
}

.label-row .form-label {
  font-size: 13px;
  color: var(--text-primary);
  font-weight: 500;
  margin: 0;
}

.helper-icon {
  color: var(--text-muted);
  font-size: 14px;
  cursor: help;
  margin-left: auto;
}

.sync-badge {
  font-size: 11px;
  color: var(--accent-primary);
  background: rgba(168, 199, 250, 0.1);
  padding: 2px 8px;
  border-radius: 10px;
}

.range-value-badge {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
  font-variant-numeric: tabular-nums;
}

.range-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(0, 0, 0, 0.2);
  padding: 12px 16px;
  border-radius: 12px;
  border: 1px solid var(--glass-border);
}

.range-label-min,
.range-label-max {
  font-size: 12px;
  color: var(--text-muted);
}

.range-input {
  flex: 1;
  margin: 0;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 14px 16px;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  color: var(--text-primary);
  font-family: inherit;
  font-size: 14px;
  outline: none;
  transition: all 0.2s ease;
}

.form-input::placeholder,
.form-textarea::placeholder {
  color: var(--text-muted);
}

.form-input:hover,
.form-textarea:hover {
  background: rgba(0, 0, 0, 0.3);
  border-color: rgba(255, 255, 255, 0.15);
}

.form-input:focus,
.form-textarea:focus {
  background: rgba(0, 0, 0, 0.4);
  border-color: rgba(168, 199, 250, 0.4);
  box-shadow: 0 0 0 2px rgba(168, 199, 250, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 140px;
  line-height: 1.6;
}

.modal-footer {
  margin-top: 28px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.save-btn,
.confirm-btn {
  padding: 10px 20px;
  border-radius: 10px;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
}

.save-btn {
  background: var(--accent-primary);
  color: #062e6f;
}

.save-btn:hover {
  background: #c2d7f8;
  transform: translateY(-1px);
}

.confirm-btn.cancel {
  background: rgba(255, 255, 255, 0.06);
  color: var(--text-primary);
  border-color: var(--glass-border);
}

.confirm-btn.cancel:hover {
  background: rgba(255, 255, 255, 0.1);
}

/* Override glass-select for unified look */
.glass-select {
  --el-select-bg-color: rgba(0, 0, 0, 0.2);
  --el-select-border-color-hover: rgba(255, 255, 255, 0.15);
  --el-fill-color-blank: rgba(0, 0, 0, 0.2) !important;
}

:deep(.glass-select .el-select__wrapper),
:deep(.glass-select .el-input__wrapper) {
  padding: 4px 16px;
  min-height: 48px;
  background-color: rgba(0, 0, 0, 0.2) !important;
  border-radius: 12px;
  box-shadow: none !important;
  border: 1px solid var(--glass-border);
}
:deep(.glass-select:hover .el-select__wrapper),
:deep(.glass-select:hover .el-input__wrapper) {
  background-color: rgba(0, 0, 0, 0.3) !important;
}
:deep(.glass-select .el-select__wrapper.is-focused),
:deep(.glass-select .el-input__wrapper.is-focus) {
  background-color: rgba(0, 0, 0, 0.4) !important;
  box-shadow: 0 0 0 1px var(--accent-primary) inset !important;
}
:deep(.glass-select .el-input__inner),
:deep(.glass-select .el-select__placeholder) {
  color: var(--text-primary) !important;
}
:deep(.glass-select .el-select__caret) {
  color: var(--text-secondary) !important;
}

@media (max-width: 768px) {
  .holo-modal {
    width: 100%;
    max-width: 100vw;
    height: 100vh;
    max-height: 100vh;
    border-radius: 0;
    transform: translateY(100%);
  }
  .modal-overlay.show .holo-modal {
    transform: translateY(0);
  }
  .modal-header {
    padding: 20px;
  }
  .modal-content-area {
    padding: 0 20px 20px;
  }
}
</style>

