<template>
  <div class="modal-overlay" :class="{ show: modelValue }" @click.self="closeModal">
    <div class="holo-modal">
      <div class="modal-header">
        <div class="modal-title">
          <i class="fa-solid fa-lightbulb"></i>
          提示词库
        </div>
        <i class="fa-solid fa-xmark close-modal" @click="closeModal"></i>
      </div>

      <div class="modal-body">
        <div class="modal-content-area full-width">
          <div class="search-box">
            <i class="fa-solid fa-magnifying-glass"></i>
            <input type="text" placeholder="搜索官方提示词..." v-model="searchQuery" />
          </div>

          <div v-if="filteredSystemPrompts.length" class="prompt-list">
            <div
              v-for="prompt in filteredSystemPrompts"
              :key="prompt.id"
              class="prompt-card"
              @click="usePrompt(prompt.content)"
            >
              <div class="prompt-card-title">{{ prompt.title }}</div>
              <div class="prompt-card-content">{{ prompt.content }}</div>
            </div>
          </div>

          <div v-else class="empty-state">
            <i class="fa-solid fa-inbox"></i>
            <p>暂无可用官方提示词</p>
            <span>提示词由后台统一维护，这里不再保留本地自定义提示词机制。</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { adminAPI } from '@/utils/api'

interface PromptItem {
  id: number
  title: string
  content: string
}

const emit = defineEmits<{
  'update:modelValue': [boolean]
  apply: [string]
}>()

defineProps<{ modelValue: boolean }>()

const searchQuery = ref('')
const systemPrompts = ref<PromptItem[]>([])

const filteredSystemPrompts = computed(() => {
  if (!searchQuery.value) return systemPrompts.value
  return systemPrompts.value.filter((prompt) =>
    prompt.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    prompt.content.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const closeModal = () => {
  emit('update:modelValue', false)
  searchQuery.value = ''
}

const usePrompt = (content: string) => {
  emit('apply', content)
  closeModal()
}

onMounted(async () => {
  try {
    const prompts = await adminAPI.listPrompts()
    systemPrompts.value = prompts.map((prompt) => ({
      id: Number(prompt.id),
      title: prompt.title,
      content: prompt.content,
    }))
  } catch (error) {
    ElMessage.error('加载官方提示词失败')
  }
})
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
  max-width: 94vw;
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

.close-modal {
  cursor: pointer;
  color: var(--text-muted);
  font-size: 20px;
}

.modal-body {
  padding: 0;
  display: flex;
  flex: 1;
  overflow: hidden;
}

.modal-content-area {
  flex: 1;
  padding: 25px;
  overflow-y: auto;
}

.full-width {
  width: 100%;
}

.search-box {
  margin-bottom: 20px;
  position: relative;
}

.search-box input {
  width: 100%;
  padding: 12px 12px 12px 40px;
  background: rgba(0,0,0,0.3);
  border: 1px solid var(--glass-border);
  border-radius: 10px;
  color: white;
}

.search-box i {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
}

.prompt-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.prompt-card {
  background: rgba(255,255,255,0.03);
  border: 1px solid var(--glass-border);
  padding: 16px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.prompt-card:hover {
  border-color: var(--accent-primary);
  background: var(--accent-subtle);
  transform: translateX(4px);
}

.prompt-card-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.prompt-card-content {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.6;
  white-space: pre-wrap;
}

.empty-state {
  padding: 80px 20px;
  text-align: center;
  color: var(--text-muted);
}

.empty-state i {
  font-size: 44px;
  margin-bottom: 12px;
}

.empty-state span {
  display: block;
  margin-top: 8px;
  font-size: 13px;
}
</style>
