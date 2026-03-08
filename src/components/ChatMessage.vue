<template>
  <div class="message" :class="{ 'user': message.role === 'user', 'ai': message.role === 'assistant' }">
    <div class="msg-avatar">
      <i v-if="message.role === 'user'" class="fa-solid fa-user"></i>
      <i v-else class="fa-solid fa-robot"></i>
    </div>
    <div class="msg-content">
      <div class="message-text" v-html="formatMessage(message.content)"></div>
      <div v-if="message.role === 'assistant'" class="message-actions">
        <button class="action-btn" @click="copyMessage(message.content)" title="复制">
          <i class="fa-regular fa-copy"></i>
        </button>
        <button class="action-btn" @click="$emit('regenerate')" :disabled="!canRegenerate" title="重新生成">
          <i class="fa-solid fa-rotate-right"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import type { Message } from '@/composables/useChatStore'

const props = defineProps<{
  message: Message
  canRegenerate: boolean
}>()

const emit = defineEmits<{
  regenerate: []
}>()

const formatMessage = (content: string) => {
  // TODO: 生产环境需引入 DOMPurify 对 AI 返回内容进行 XSS 净化，例如：
  // import DOMPurify from 'dompurify'
  // return DOMPurify.sanitize(formatted)
  // 简单的代码块格式化
  return content
    .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\n/g, '<br>')
}

const copyMessage = async (content: string) => {
  try {
    await navigator.clipboard.writeText(content)
    ElMessage.success('已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}
</script>

<style scoped>
.message {
  display: flex;
  gap: 16px;
  opacity: 0;
  animation: slideIn 0.4s ease forwards;
}

.message.user {
  flex-direction: row-reverse;
}

.msg-avatar {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 16px;
}

.message.ai .msg-avatar {
  background: rgba(255,255,255,0.1);
  color: white;
}

.message.user .msg-avatar {
  background: var(--text-primary);
  color: #000;
}

.msg-content {
  max-width: 80%;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.message-text {
  padding: 12px 18px;
  border-radius: 18px;
  font-size: 15px;
  line-height: 1.6;
  word-wrap: break-word;
}

.message.user .message-text {
  background: var(--user-msg-bg);
  color: white;
  border-bottom-right-radius: 4px;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
}

.message.ai .message-text {
  background: var(--ai-msg-bg);
  color: var(--text-primary);
}

.message-text :deep(pre) {
  background-color: rgba(0, 0, 0, 0.4);
  padding: 12px;
  border-radius: 8px;
  overflow-x: auto;
  margin: 8px 0;
  border: 1px solid var(--glass-border);
}

.message-text :deep(code) {
  background-color: rgba(0, 0, 0, 0.3);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'JetBrains Mono', 'Courier New', monospace;
  font-size: 13px;
  border: 1px solid var(--glass-border);
}

.message-text :deep(pre code) {
  background: transparent;
  padding: 0;
  border: none;
}

.message-actions {
  display: flex;
  gap: 8px;
  padding-left: 18px;
  opacity: 0;
  transition: opacity 0.2s;
}

.message:hover .message-actions {
  opacity: 1;
}

.action-btn {
  background: transparent;
  border: 1px solid var(--glass-border);
  color: var(--text-secondary);
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.action-btn:hover:not(:disabled) {
  background: rgba(255,255,255,0.05);
  border-color: var(--accent-primary);
  color: var(--text-primary);
}

.action-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.action-btn i {
  font-size: 12px;
}
</style>