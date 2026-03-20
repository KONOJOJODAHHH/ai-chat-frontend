<template>
  <div class="chat-container">
    <ConversationSidebar
      :conversations="sortedConversations"
      :current-conversation="currentConversation"
      :density="chatStore.preferences.value.conversationDensity"
      @select="selectConversation"
      @create="createConversation"
      @delete="deleteConversation"
      @rename="renameConversation"
      @open-settings="goToSettings"
    />
    
    <div class="chat-main">
      <div class="chat-header">
        <div class="header-left">
          <h2>{{ currentConversation?.title || '新对话' }}</h2>
        </div>
        <div class="header-right">
          <button class="control-btn" @click="showModelConfig = true" title="模型配置">
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
          :send-shortcut="chatStore.preferences.value.sendShortcut"
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
      :official-agents="chatStore.officialAgents.value"
      :private-agents="chatStore.privateAgents.value"
      :runtime-config="chatStore.resolveRuntimeConfig(currentConversation?.id)"
      @apply-runtime="applyRuntimeConfig"
    />
    
    <PromptPanel v-model="showPromptPanel" @apply="applyPrompt" />
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import ConversationSidebar from '@/components/ConversationSidebar.vue'
import ChatMessage from '@/components/ChatMessage.vue'
import ChatInput from '@/components/ChatInput.vue'
import ModelConfig from '@/components/ModelConfig.vue'
import PromptPanel from '@/components/PromptPanel.vue'
import { useChatStore, type AIModel, type Conversation, type Message, type RuntimeConfigValues } from '@/composables/useChatStore'
import { chatAPI } from '@/utils/api'

interface BackendMessage {
  id?: string | number
  role?: 'user' | 'assistant'
  content?: string
  createdAt?: string | Date
}

interface BackendConversation {
  id?: string | number
  title?: string
  modelId?: string
  agentId?: string | number
  systemPrompt?: string
  temperature?: number
  messages?: BackendMessage[] | null
  createdAt?: string | Date
  updatedAt?: string | Date
}

interface BackendModel {
  id?: string | number
  modelId?: string
  name?: string
  provider?: string
  baseUrl?: string
  apiKey?: string
  enabled?: boolean
}

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
  setConversations,
  setCurrentConversation,
  upsertConversation,
  switchModel: storeSwitchModel,
  updateModelConfig: storeUpdateModelConfig,
  setModels,
  setUserModels,
  setAgents
} = chatStore

const router = useRouter()
const messagesContainer = ref<HTMLElement>()
const chatInputRef = ref<InstanceType<typeof ChatInput>>()
const showModelConfig = ref(false)
const showPromptPanel = ref(false)

const normalizeMessage = (message: BackendMessage): Message => ({
  id: String(message.id ?? Date.now()),
  content: message.content ?? '',
  role: message.role === 'assistant' ? 'assistant' : 'user',
  timestamp: message.createdAt ? new Date(message.createdAt) : new Date()
})

const normalizeConversation = (conversation: BackendConversation): Conversation => ({
  id: String(conversation.id ?? Date.now()),
  title: conversation.title?.trim() || '新对话',
  modelId: conversation.modelId,
  runtimeConfig: {
    modelId: conversation.modelId,
    agentId: conversation.agentId != null ? String(conversation.agentId) : undefined,
    systemPrompt: conversation.systemPrompt,
    temperature: conversation.temperature,
  },
  messages: Array.isArray(conversation.messages)
    ? conversation.messages.map(normalizeMessage)
    : [],
  createdAt: conversation.createdAt ? new Date(conversation.createdAt) : new Date(),
  updatedAt: conversation.updatedAt ? new Date(conversation.updatedAt) : new Date()
})

const normalizeModel = (model: BackendModel, official = true): AIModel => ({
  id: model.modelId?.trim() || String(model.id ?? ''),
  name: model.name?.trim() || model.modelId?.trim() || '未命名模型',
  provider: model.provider?.trim() || 'openai-compatible',
  apiKey: model.apiKey,
  baseUrl: model.baseUrl,
  temperature: 0.7,
  isActive: model.enabled !== false,
  official,
})

const resolveErrorMessage = (error: unknown, fallback: string) => {
  const candidate = error as {
    message?: string
    response?: { data?: { msg?: string } }
  }

  return candidate?.response?.data?.msg || candidate?.message || fallback
}

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

const loadModels = async (preferredModelId?: string) => {
  const [officialResp, userResp] = await Promise.allSettled([
    chatAPI.getModels(),
    chatAPI.getUserModels()
  ])

  const officialList = officialResp.status === 'fulfilled' && Array.isArray(officialResp.value)
    ? (officialResp.value as BackendModel[]).map(item => normalizeModel(item, true)).filter(item => !!item.id)
    : []

  const userList = userResp.status === 'fulfilled' && Array.isArray(userResp.value)
    ? (userResp.value as BackendModel[]).map(item => normalizeModel(item, false)).filter(item => !!item.id)
    : []

  if (officialList.length > 0 || userList.length > 0) {
    setModels(officialList, userList, preferredModelId)
  }
}

const loadAgents = async () => {
  try {
    const response = await chatAPI.getAgents()
    setAgents(response)
  } catch (error) {
    console.error('Load agents error:', error)
  }
}

const loadConversationDetail = async (conversationId: string) => {
  const response = await chatAPI.getConversation(conversationId)
  if (!response) return null

  const conversation = normalizeConversation(response as BackendConversation)
  upsertConversation(conversation)

  chatStore.setConversationRuntimeConfig(conversation.id, {
    modelId: conversation.runtimeConfig?.modelId,
    agentId: conversation.runtimeConfig?.agentId,
    systemPrompt: conversation.runtimeConfig?.systemPrompt,
    temperature: conversation.runtimeConfig?.temperature,
  })

  if (currentConversation.value?.id === conversation.id) {
    setCurrentConversation(conversation)
  }

  return conversation
}

const loadConversations = async (preferredConversationId?: string) => {
  const response = await chatAPI.getConversations()
  const conversationList = Array.isArray(response)
    ? response.map(item => normalizeConversation(item as BackendConversation))
    : []

  setConversations(conversationList)

  const targetConversation = preferredConversationId
    ? conversationList.find(item => item.id === preferredConversationId) || null
    : conversationList[0] || null

  setCurrentConversation(targetConversation || conversationList[0] || null)

  const activeConversation = targetConversation || conversationList[0] || null
  if (activeConversation?.modelId) {
    storeSwitchModel(activeConversation.modelId)
  }

  return activeConversation
}

const createConversation = () => {
  const conversation = storeCreateConversation()
  const runtime = chatStore.resolveRuntimeConfig(conversation.id)
  conversation.modelId = runtime.modelId || currentModel.value.id
  chatStore.setConversationRuntimeConfig(conversation.id, runtime)
  setCurrentConversation(conversation)
  focusInput()
}

const selectConversation = async (conversation: Conversation) => {
  setCurrentConversation(conversation)

  if (conversation.modelId) {
    storeSwitchModel(conversation.modelId)
  }

  if (conversation.messages.length === 0) {
    try {
      await loadConversationDetail(conversation.id)
      await scrollToBottom()
    } catch (error) {
      ElMessage.error('加载对话详情失败')
      console.error('Load conversation detail error:', error)
    }
  }
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
  if (currentConversation.value) {
    currentConversation.value.modelId = modelId
    chatStore.setConversationRuntimeConfig(currentConversation.value.id, { modelId })
  }
  ElMessage.success(`已切换到 ${models.value.find(m => m.id === modelId)?.name}`)
}

const updateModelConfig = (modelId: string, config: any) => {
  storeUpdateModelConfig(modelId, config)
}

const applyRuntimeConfig = (config: RuntimeConfigValues) => {
  if (!currentConversation.value) {
    const conversation = storeCreateConversation()
    setCurrentConversation(conversation)
  }

  if (!currentConversation.value) return

  if (config.agentId) {
    chatStore.applyAgent(config.agentId, currentConversation.value.id)
  }

  chatStore.setConversationRuntimeConfig(currentConversation.value.id, config)

  if (config.modelId) {
    storeSwitchModel(config.modelId)
    currentConversation.value.modelId = config.modelId
  }
}

const goToSettings = () => {
  router.push('/settings/general')
}

const sendMessage = async (message: string) => {
  if (!currentConversation.value) {
    const conversation = storeCreateConversation()
    setCurrentConversation(conversation)
  }

  addMessage(message, 'user')
  await scrollToBottom()

  isLoading.value = true

  try {
    const response = await chatAPI.sendMessage({
      message,
      modelId: chatStore.resolveRuntimeConfig(currentConversation.value?.id).modelId || currentModel.value.id,
      agentId: chatStore.resolveRuntimeConfig(currentConversation.value?.id).agentId,
      systemPrompt: chatStore.resolveRuntimeConfig(currentConversation.value?.id).systemPrompt,
      temperature: chatStore.resolveRuntimeConfig(currentConversation.value?.id).temperature,
      conversationId: currentConversation.value?.id
    })

    if (response && typeof response === 'object' && 'content' in response) {
      const chatResponse = response as {
        content: string
        model?: string
        agentId?: number
        systemPrompt?: string
        temperature?: number
        conversationId?: string | number
      }

      if (chatResponse.conversationId && currentConversation.value) {
        currentConversation.value.id = String(chatResponse.conversationId)
      }

      if (currentConversation.value) {
        currentConversation.value.modelId = chatResponse.model || currentModel.value.id
        chatStore.setConversationRuntimeConfig(currentConversation.value.id, {
          modelId: chatResponse.model || currentModel.value.id,
          agentId: chatResponse.agentId != null ? String(chatResponse.agentId) : undefined,
          systemPrompt: chatResponse.systemPrompt,
          temperature: chatResponse.temperature,
        })
      }

      addMessage(chatResponse.content, 'assistant')

      if (currentConversation.value) {
        upsertConversation(currentConversation.value)
      }
    } else if (typeof response === 'string') {
      addMessage(response, 'assistant')
    } else {
      throw new Error('Invalid response format')
    }

    await scrollToBottom()
  } catch (error) {
    ElMessage.error(resolveErrorMessage(error, '发送消息失败，请检查网络连接'))
    console.error('Send message error:', error)
  } finally {
    isLoading.value = false
  }
}

const regenerateMessage = async () => {
  if (!currentConversation.value || currentConversation.value.messages.length < 2) return

  currentConversation.value.messages.pop()

  const lastUserMessage = currentConversation.value.messages
    .slice()
    .reverse()
    .find(m => m.role === 'user')

  if (lastUserMessage) {
    await sendMessage(lastUserMessage.content)
  }
}

onMounted(async () => {
  try {
    await loadModels()
    await loadAgents()
    const firstConversation = await loadConversations()

    if (firstConversation) {
      await loadConversationDetail(firstConversation.id)
      await scrollToBottom()
      return
    }

    createConversation()
  } catch (error) {
    ElMessage.error('加载对话历史失败')
    console.error('Load conversations error:', error)

    if (conversations.value.length === 0) {
      createConversation()
    }
  }
})
</script>

<style scoped>
.chat-container {
  display: flex;
  height: 100vh;
  width: 100vw;
  padding: var(--app-shell-padding);
  gap: var(--app-shell-gap);
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
  flex-wrap: wrap;
  justify-content: flex-end;
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
