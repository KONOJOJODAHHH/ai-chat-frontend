<template>
  <div class="chat-container">
    <ConversationSidebar
      :conversations="sortedConversations"
      :current-conversation="currentConversation"
      @select="selectConversation"
      @create="createConversation"
      @delete="deleteConversation"
      @rename="renameConversation"
      @open-settings="showSettings = true"
    />
    
    <div class="chat-main">
      <div class="chat-header">
        <div class="header-left">
          <h2>{{ currentConversation?.title || '新建对话' }}</h2>
        </div>
        <div class="header-right">
          <button class="control-btn" @click="showModelConfig = true" title="模型配置">
            <i class="fa-solid fa-bolt" style="color: #eab308;"></i>
            <span>{{ currentModel.name }}</span>
            <i class="fa-solid fa-chevron-down" style="font-size: 12px; margin-left: 4px; color: var(--text-muted);"></i>
          </button>
        </div>
      </div>

      <div class="chat-messages" ref="messagesContainer">
        <div v-if="!currentConversation || currentConversation.messages.length === 0" class="empty-chat">
          <div class="empty-content">
            <i class="fa-solid fa-robot empty-icon"></i>
            <h3>开始你的对话吧</h3>
            <p>点击下方输入框左侧的加号可以使用提示词模板</p>
          </div>
        </div>
        
        <div v-else class="messages-list">
          <ChatMessage
            v-for="message in currentConversation.messages"
            :key="message.id"
            :message="message"
            :can-regenerate="canRegenerate"
            @regenerate="regenerateMessage"
          />
        </div>
      </div>

      <div class="chat-input-wrapper">
        <ChatInput
          :loading="isLoading"
          :can-regenerate="canRegenerate"
          @send="sendMessage"
          @regenerate="regenerateMessage"
          @open-prompts="showPromptPanel = true"
          ref="chatInputRef"
        />
      </div>
    </div>

    <ModelConfig
      v-model="showModelConfig"
      :models="models"
      :current-model="currentModel"
      @switch-model="switchModel"
      @update-model="updateModelConfig"
    />
    
    <SettingsModal v-model="showSettings" />
    <PromptPanel v-model="showPromptPanel" @apply="applyPrompt" />
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import ConversationSidebar from '@/components/ConversationSidebar.vue'
import ChatMessage from '@/components/ChatMessage.vue'
import ChatInput from '@/components/ChatInput.vue'
import ModelConfig from '@/components/ModelConfig.vue'
import SettingsModal from '@/components/SettingsModal.vue'
import PromptPanel from '@/components/PromptPanel.vue'
import { useChatStore } from '@/composables/useChatStore'
import { chatAPI } from '@/utils/api'
import { useAuthStore } from '@/composables/useAuthStore'

const chatStore = useChatStore()
const {
  conversations,
  currentConversation,
  models,
  currentModel,
  isLoading,
  sortedConversations,
  createConversation: storeCreateConversation,
  addMessage,
  deleteConversation: storeDeleteConversation,
  switchModel: storeSwitchModel,
  updateModelConfig: storeUpdateModelConfig
} = chatStore

const messagesContainer = ref<HTMLElement>()
const chatInputRef = ref<InstanceType<typeof ChatInput>>()
const showModelConfig = ref(false)
const showSettings = ref(false)
const showPromptPanel = ref(false)
const auth = useAuthStore()

const canRegenerate = computed(() => {
  return currentConversation.value && 
         currentConversation.value.messages.length > 0 && 
         currentConversation.value.messages[currentConversation.value.messages.length - 1].role === 'assistant' &&
         !isLoading.value
})

const scrollToBottom = async () => {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

const focusInput = () => {
  chatInputRef.value?.$el.querySelector('textarea')?.focus()
}

const applyPrompt = (content: string) => {
  chatInputRef.value?.setValue(content)
  focusInput()
}

const createConversation = () => {
  storeCreateConversation()
  focusInput()
}

const selectConversation = (conversation: any) => {
  currentConversation.value = conversation
}

const deleteConversation = async (id: string) => {
  try {
    await chatAPI.deleteConversation(id)
    storeDeleteConversation(id)
    ElMessage.success('对话删除成功')
  } catch (error) {
    ElMessage.error('删除失败')
  }
}

const renameConversation = (id: string, title: string) => {
  const conversation = conversations.value.find(c => c.id === id)
  if (conversation) {
    conversation.title = title
  }
}

const switchModel = (modelId: string) => {
  storeSwitchModel(modelId)
  ElMessage.success(`已切换到 ${models.value.find(m => m.id === modelId)?.name}`)
}

const updateModelConfig = (modelId: string, config: any) => {
  storeUpdateModelConfig(modelId, config)
}

const onLogout = () => {
  auth.logout()
  ElMessage.success('已注销')
  window.location.href = '/login'
}


const sendMessage = async (message: string) => {
  if (!currentConversation.value) {
    storeCreateConversation()
  }

  // 添加用户消息
  addMessage(message, 'user')
  await scrollToBottom()

  isLoading.value = true
  
  try {
    const response = await chatAPI.sendMessage({
      message,
      modelId: currentModel.value.id,
      conversationId: currentConversation.value?.id
    })

    // 添加AI回复
    if (response && typeof response === 'object' && 'content' in response) {
      const chatResponse = response as { content: string }
      addMessage(chatResponse.content, 'assistant')
    } else if (typeof response === 'string') {
      addMessage(response, 'assistant')
    } else {
      throw new Error('Invalid response format')
    }
    await scrollToBottom()
  } catch (error) {
    ElMessage.error('发送消息失败，请检查网络连接')
    console.error('Send message error:', error)
  } finally {
    isLoading.value = false
  }
}

const regenerateMessage = async () => {
  if (!currentConversation.value || currentConversation.value.messages.length < 2) return

  // 移除最后一条AI消息
  currentConversation.value.messages.pop()
  
  // 获取最后一条用户消息
  const lastUserMessage = currentConversation.value.messages
    .slice()
    .reverse()
    .find(m => m.role === 'user')

  if (lastUserMessage) {
    await sendMessage(lastUserMessage.content)
  }
}

onMounted(() => {
  // 如果已经有演示数据，不需要创建新对话
  if (conversations.value.length === 0) {
    createConversation()
  }
})
</script>

<style scoped>
.chat-container {
  display: flex;
  height: 100vh;
  width: 100vw;
  padding: 20px;
  gap: 20px;
}

.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: rgba(0,0,0,0.2);
  border-radius: 20px;
  overflow: hidden;
}

.chat-header {
  height: 70px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 30px;
  background: transparent;
  position: relative;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-left h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  font-family: 'Orbitron', sans-serif;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 15px;
  position: relative;
}

.control-btn {
  background: rgba(255,255,255,0.05);
  padding: 8px 14px;
  border-radius: 10px;
  border: 1px solid var(--glass-border);
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--text-primary);
  font-family: 'Inter', sans-serif;
}

.control-btn:hover {
  background: rgba(255,255,255,0.1);
  border-color: var(--accent-primary);
}

.control-btn i {
  font-size: 14px;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 30px 10% 20px 10%;
  scroll-behavior: smooth;
  display: flex;
  flex-direction: column;
}

.empty-chat {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.empty-content {
  text-align: center;
  max-width: 400px;
}

.empty-icon {
  font-size: 64px;
  color: var(--text-muted);
  margin-bottom: 20px;
  opacity: 0.5;
}

.empty-content h3 {
  font-size: 24px;
  color: var(--text-primary);
  margin-bottom: 12px;
  font-weight: 600;
}

.empty-content p {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.6;
}

.messages-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.chat-input-wrapper {
  position: relative;
  margin: 0 auto;
  padding: 20px 0;
  width: 90%;
  max-width: 800px;
}

@media (max-width: 768px) {
  .chat-container {
    padding: 0;
    gap: 0;
  }
  
  .chat-main {
    border-radius: 0;
    background: transparent;
  }
  
  .chat-messages {
    padding: 20px;
  }
  
  .chat-input-wrapper {
    width: 95%;
    padding: 15px 0;
  }
}
</style>