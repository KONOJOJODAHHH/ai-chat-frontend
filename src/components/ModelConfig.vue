<template>
  <!-- 模态框遮罩 -->
  <div class="modal-overlay" :class="{ show: modelValue }" @click.self="closeModal">
    <div class="holo-modal">
      <div class="modal-header">
        <div class="modal-title">
          <i class="fa-solid fa-bolt"></i> 模型配置
        </div>
        <i class="fa-solid fa-xmark close-modal" @click="closeModal"></i>
      </div>
      
      <div class="modal-body">
        <div class="modal-content-area">
          <!-- 模型选择 -->
          <div class="form-group">
            <label class="form-label">选择模型</label>
            <select class="form-input" v-model="selectedModelId" @change="handleModelChange">
              <option v-for="model in models" :key="model.id" :value="model.id">
                {{ model.name }} ({{ model.provider }})
              </option>
            </select>
          </div>

          <!-- 系统提示词 -->
          <div class="system-prompt-section">
            <div class="system-prompt-label">
              <i class="fa-solid fa-circle-info"></i>
              系统提示词（当前对话有效）
            </div>
            <textarea 
              class="form-textarea" 
              v-model="systemPrompt"
              placeholder="例如：你是一个专业的编程助手，擅长代码审查和架构设计..."
            ></textarea>
          </div>

          <!-- API 配置（可选） -->
          <div class="api-config-section" v-if="currentModel">
            <div class="form-group">
              <label class="form-label">API 密钥（可选）</label>
              <input 
                type="password" 
                class="form-input" 
                v-model="apiKey"
                placeholder="sk-..."
              />
            </div>
            <div class="form-group">
              <label class="form-label">API 基础地址（可选）</label>
              <input 
                type="text" 
                class="form-input" 
                v-model="baseUrl"
                placeholder="https://api.example.com"
              />
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
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import type { AIModel } from '@/composables/useChatStore'

const props = defineProps<{
  modelValue: boolean
  models: AIModel[]
  currentModel: AIModel
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'switchModel': [modelId: string]
  'updateModel': [modelId: string, config: Partial<AIModel>]
}>()

const selectedModelId = ref(props.currentModel.id)
const systemPrompt = ref('你是一个专业的 AI 助手，擅长代码分析、技术写作和问题解决。请用清晰、专业的语言回答用户的问题。')
const apiKey = ref('')
const baseUrl = ref('')

const currentModel = computed(() => {
  return props.models.find(m => m.id === selectedModelId.value) || props.currentModel
})

watch(() => props.currentModel, (newModel) => {
  selectedModelId.value = newModel.id
})

const handleModelChange = () => {
  // 切换模型时更新配置
}

const closeModal = () => {
  emit('update:modelValue', false)
}

const saveConfig = () => {
  // 切换模型
  if (selectedModelId.value !== props.currentModel.id) {
    emit('switchModel', selectedModelId.value)
  }
  
  // 更新API配置
  if (apiKey.value || baseUrl.value) {
    emit('updateModel', selectedModelId.value, {
      apiKey: apiKey.value,
      baseUrl: baseUrl.value
    })
  }
  
  ElMessage.success('配置已保存')
  closeModal()
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
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
  width: 900px;
  height: 600px;
  max-height: 85vh;
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
  font-family: 'Orbitron';
  font-size: 18px;
  color: white;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 10px;
}

.modal-title i {
  color: #eab308;
}

.close-modal {
  cursor: pointer;
  color: var(--text-muted);
  font-size: 20px;
  transition: color 0.2s;
}

.close-modal:hover {
  color: white;
}

.modal-body {
  padding: 0;
  flex: 1;
  overflow-y: auto;
}

.modal-content-area {
  padding: 25px;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 8px;
  font-weight: 500;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 12px;
  background: rgba(0,0,0,0.3);
  border: 1px solid var(--glass-border);
  border-radius: 8px;
  color: white;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  transition: border-color 0.2s;
}

.form-input:focus,
.form-textarea:focus {
  border-color: var(--accent-primary);
  outline: none;
}

.form-input option {
  background: #18181b;
  color: white;
}

.form-textarea {
  resize: vertical;
  min-height: 200px;
  font-family: 'Inter', sans-serif;
  line-height: 1.6;
}

.system-prompt-section {
  background: rgba(255,255,255,0.03);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
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

.system-prompt-label i {
  color: var(--accent-primary);
}

.api-config-section {
  margin-top: 20px;
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
  transition: all 0.2s;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
}

.save-btn {
  background: var(--accent-primary);
  color: #062e6f;
}

.save-btn:hover {
  background: var(--accent-hover);
  transform: scale(1.02);
}

.confirm-btn.cancel {
  background: rgba(255,255,255,0.05);
  color: var(--text-primary);
}

.confirm-btn.cancel:hover {
  background: rgba(255,255,255,0.1);
}

@media (max-width: 768px) {
  .holo-modal {
    width: 95%;
    max-height: 90vh;
  }
}
</style>