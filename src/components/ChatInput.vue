<template>
  <div class="input-capsule">
    <!-- 加号菜单按钮 -->
    <button class="plus-menu-btn" :class="{ active: showToolsMenu }" @click.stop="toggleToolsMenu">
      <i class="fa-solid fa-plus"></i>
    </button>

    <!-- 工具弹出菜单 -->
    <div class="tools-popup" :class="{ show: showToolsMenu }">
      <div class="tool-item" @click="openPrompts">
        <i class="fa-solid fa-lightbulb"></i>
        <span>提示词模板</span>
      </div>
      <div class="tool-item" @click="uploadFile">
        <i class="fa-solid fa-paperclip"></i>
        <span>上传文件</span>
      </div>
    </div>

    <textarea
      v-model="inputMessage"
      placeholder="输入您的问题..."
      rows="1"
      @input="autoResize"
      @keydown.enter="handleEnterKey"
      ref="textareaRef"
    ></textarea>

    <button class="send-btn" @click="sendMessage" :disabled="!inputMessage.trim() || loading">
      <i class="fa-solid fa-arrow-up"></i>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps<{
  loading: boolean
  canRegenerate: boolean
  sendShortcut?: 'enter' | 'ctrl-enter'
}>()

const emit = defineEmits<{
  send: [message: string]
  regenerate: []
  openPrompts: []
}>()

const inputMessage = ref('')
const textareaRef = ref<HTMLTextAreaElement>()
const showToolsMenu = ref(false)

const setValue = (text: string) => {
  inputMessage.value = text
  autoResize()
}
defineExpose({ setValue })

const autoResize = () => {
  if (textareaRef.value) {
    textareaRef.value.style.height = 'auto'
    textareaRef.value.style.height = Math.min(textareaRef.value.scrollHeight, 150) + 'px'
  }
}

const sendMessage = () => {
  const message = inputMessage.value.trim()
  if (!message) {
    ElMessage.warning('请输入消息内容')
    return
  }
  
  emit('send', message)
  inputMessage.value = ''
  if (textareaRef.value) {
    textareaRef.value.style.height = '48px'
  }
}

const handleEnterKey = (event: KeyboardEvent) => {
  if (props.sendShortcut === 'ctrl-enter') {
    if (event.ctrlKey) {
      event.preventDefault()
      sendMessage()
      return
    }

    if (event.shiftKey) {
      return
    }

    return
  }

  if (event.ctrlKey || event.shiftKey) {
    return
  }

  event.preventDefault()
  sendMessage()
}

const toggleToolsMenu = () => {
  showToolsMenu.value = !showToolsMenu.value
}

const openPrompts = () => {
  showToolsMenu.value = false
  emit('openPrompts')
}

const uploadFile = () => {
  showToolsMenu.value = false
  ElMessage.info('文件上传功能暂未接入后端接口')
}

// 点击外部关闭工具菜单（使用 onMounted/onUnmounted 避免内存泄漏）
const handleOutsideClick = () => { showToolsMenu.value = false }
onMounted(() => document.addEventListener('click', handleOutsideClick))
onUnmounted(() => document.removeEventListener('click', handleOutsideClick))
</script>

<style scoped>
.input-capsule {
  background: rgba(24, 24, 27, 0.85);
  backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
  border-radius: 20px;
  padding: 10px;
  display: flex;
  align-items: flex-end;
  gap: 8px;
  box-shadow: 0 10px 40px -10px rgba(0,0,0,0.5);
  transition: all 0.3s;
  position: relative;
}

.input-capsule:focus-within {
  border-color: var(--accent-primary);
  box-shadow: 0 15px 40px -5px rgba(59, 130, 246, 0.15);
}

.plus-menu-btn {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  border: none;
  background: rgba(255,255,255,0.05);
  color: var(--text-secondary);
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  margin-bottom: 4px;
  flex-shrink: 0;
}

.plus-menu-btn:hover {
  background: rgba(255,255,255,0.1);
  color: var(--text-primary);
}

.plus-menu-btn.active {
  background: var(--accent-primary);
  color: white;
}

.tools-popup {
  position: absolute;
  bottom: 65px;
  left: 10px;
  background: rgba(24, 24, 27, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  padding: 8px;
  min-width: 200px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
  opacity: 0;
  pointer-events: none;
  transform: translateY(10px);
  transition: all 0.3s var(--ease-out);
  z-index: 20;
}

.tools-popup.show {
  opacity: 1;
  pointer-events: auto;
  transform: translateY(0);
}

.tool-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
  color: var(--text-primary);
}

.tool-item:hover {
  background: rgba(255,255,255,0.08);
}

.tool-item i {
  width: 20px;
  text-align: center;
  color: var(--accent-primary);
}

textarea {
  flex: 1;
  background: transparent;
  border: none;
  color: white;
  padding: 12px 16px;
  min-height: 48px;
  max-height: 150px;
  resize: none;
  font-family: 'Inter', sans-serif;
  font-size: 15px;
  line-height: 1.5;
}

textarea::placeholder {
  color: #52525b;
}

textarea:focus {
  outline: none;
}

.send-btn {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  border: none;
  background: var(--text-primary);
  color: #000;
  font-size: 16px;
  cursor: pointer;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
}

.send-btn:hover:not(:disabled) {
  transform: scale(1.05);
  background: white;
}

.send-btn:disabled {
  background: #3f3f46;
  color: #71717a;
  cursor: not-allowed;
  transform: none;
}
</style>
