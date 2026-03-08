import { ref, computed } from 'vue'

const RUNTIME_DEFAULTS_STORAGE_KEY = 'chat-user-runtime-defaults'
const PREFERENCES_STORAGE_KEY = 'chat-user-preferences'

export interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Date | string
  model?: string
}

export interface Conversation {
  id: string
  title: string
  modelId?: string
  runtimeConfig?: Partial<RuntimeConfigValues>
  messages: Message[]
  createdAt: Date | string
  updatedAt: Date | string
}

export interface AIModel {
  id: string
  name: string
  provider: string
  apiKey?: string
  baseUrl?: string
  temperature?: number
  isActive: boolean
}

export interface AgentDefinition {
  id: string
  name: string
  description?: string
  modelId?: string
  systemPrompt?: string
  temperature?: number
  official: boolean
  enabled: boolean
}

export interface RuntimeConfigValues {
  modelId?: string
  agentId?: string
  systemPrompt?: string
  temperature?: number
}

export interface RuntimeConfigLayer extends RuntimeConfigValues {
  updatedAt?: Date | string
}

export interface RuntimeConfigContainer {
  systemDefaults: RuntimeConfigLayer
  userDefaults: RuntimeConfigLayer
  agentDefaults: RuntimeConfigLayer
  conversationOverrides: Record<string, RuntimeConfigLayer>
}

export interface UserPreferenceState {
  conversationDensity: 'comfortable' | 'compact'
  sendShortcut: 'enter' | 'ctrl-enter'
}

const readStorage = <T>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback

    const parsed = JSON.parse(raw)
    return parsed as T
  } catch {
    return fallback
  }
}

// 单例模式：与 useAuthStore 保持一致，所有组件共享同一个 store 实例
let __chatStore: ReturnType<typeof createChatStore> | null = null

function createChatStore() {
  const conversations = ref<Conversation[]>([])
  const currentConversation = ref<Conversation | null>(null)
  const models = ref<AIModel[]>([])
  const currentModel = ref<AIModel>({
    id: '',
    name: '未配置模型',
    provider: '',
    isActive: false
  })
  const officialAgents = ref<AgentDefinition[]>([])
  const privateAgents = ref<AgentDefinition[]>([])
  const isLoading = ref(false)
  const runtimeConfig = ref<RuntimeConfigContainer>({
    systemDefaults: {},
    userDefaults: readStorage<RuntimeConfigLayer>(RUNTIME_DEFAULTS_STORAGE_KEY, {}),
    agentDefaults: {},
    conversationOverrides: {}
  })
  const preferences = ref<UserPreferenceState>(readStorage<UserPreferenceState>(PREFERENCES_STORAGE_KEY, {
    conversationDensity: 'comfortable',
    sendShortcut: 'enter'
  }))

  const persistUserDefaults = () => {
    localStorage.setItem(RUNTIME_DEFAULTS_STORAGE_KEY, JSON.stringify(runtimeConfig.value.userDefaults))
  }

  const persistPreferences = () => {
    localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(preferences.value))
  }

  const syncCurrentModel = (modelId?: string) => {
    if (!modelId) return

    const matchedModel = models.value.find(item => item.id === modelId)
    if (matchedModel) {
      currentModel.value = matchedModel
    }
  }

  const sortedConversations = computed(() => {
    return conversations.value.slice().sort((a, b) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
  })

  const createConversation = (title: string = '新对话'): Conversation => {
    const resolvedDefaults = resolveRuntimeConfig()
    const conversation: Conversation = {
      id: Date.now().toString(),
      title,
      modelId: resolvedDefaults.modelId || currentModel.value.id || undefined,
      runtimeConfig: {
        ...resolvedDefaults
      },
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }
    conversations.value.push(conversation)
    currentConversation.value = conversation
    runtimeConfig.value.conversationOverrides = {
      ...runtimeConfig.value.conversationOverrides,
      [conversation.id]: {
        ...resolvedDefaults,
        updatedAt: new Date()
      }
    }

    if (conversation.modelId) {
      syncCurrentModel(conversation.modelId)
    }

    return conversation
  }

  const addMessage = (content: string, role: 'user' | 'assistant') => {
    if (!currentConversation.value) {
      createConversation()
    }

    const message: Message = {
      id: Date.now().toString(),
      content,
      role,
      timestamp: new Date(),
      model: role === 'assistant' ? currentModel.value.name : undefined
    }

    currentConversation.value!.messages.push(message)
    currentConversation.value!.updatedAt = new Date()

    // 更新对话标题（如果是第一条用户消息）
    if (role === 'user' && currentConversation.value!.messages.filter(m => m.role === 'user').length === 1) {
      currentConversation.value!.title = content.slice(0, 30) + (content.length > 30 ? '...' : '')
    }
  }

  const deleteConversation = (id: string) => {
    const index = conversations.value.findIndex(c => c.id === id)
    if (index > -1) {
      conversations.value.splice(index, 1)
      if (currentConversation.value?.id === id) {
        currentConversation.value = conversations.value[0] || null
      }
    }
  }

  const setConversations = (items: Conversation[]) => {
    conversations.value = items

    if (!currentConversation.value) {
      currentConversation.value = items[0] || null
      return
    }

    const matchedConversation = items.find(item => item.id === currentConversation.value?.id)
    currentConversation.value = matchedConversation || items[0] || null
  }

  const setCurrentConversation = (conversation: Conversation | null) => {
    currentConversation.value = conversation

    const activeModelId = conversation?.runtimeConfig?.modelId || conversation?.modelId
    if (activeModelId) {
      syncCurrentModel(activeModelId)
    }
  }

  const upsertConversation = (conversation: Conversation) => {
    const index = conversations.value.findIndex(item => item.id === conversation.id)
    if (index > -1) {
      conversations.value[index] = conversation
    } else {
      conversations.value.push(conversation)
    }
  }

  const setSystemRuntimeDefaults = (config: Partial<RuntimeConfigValues>) => {
    runtimeConfig.value.systemDefaults = {
      ...runtimeConfig.value.systemDefaults,
      ...config,
      updatedAt: new Date()
    }
    syncCurrentModel(config.modelId)
  }

  const setUserRuntimeDefaults = (config: Partial<RuntimeConfigValues>) => {
    runtimeConfig.value.userDefaults = {
      ...runtimeConfig.value.userDefaults,
      ...config,
      updatedAt: new Date()
    }
    persistUserDefaults()
    syncCurrentModel(config.modelId)
  }

  const setAgentRuntimeDefaults = (config: Partial<RuntimeConfigValues>) => {
    runtimeConfig.value.agentDefaults = {
      ...runtimeConfig.value.agentDefaults,
      ...config,
      updatedAt: new Date()
    }
    syncCurrentModel(config.modelId)
  }

  const setAgents = (payload: { official: AgentDefinition[]; privateAgents: AgentDefinition[] }) => {
    officialAgents.value = payload.official.filter(agent => agent.enabled !== false)
    privateAgents.value = payload.privateAgents.filter(agent => agent.enabled !== false)
  }

  const allAgents = computed(() => [...officialAgents.value, ...privateAgents.value])

  const activeAgent = computed(() => {
    const activeAgentId = currentConversation.value?.runtimeConfig?.agentId
      || runtimeConfig.value.conversationOverrides[currentConversation.value?.id || '']?.agentId
      || runtimeConfig.value.agentDefaults.agentId
      || runtimeConfig.value.userDefaults.agentId
    if (!activeAgentId) return null
    return allAgents.value.find(agent => agent.id === activeAgentId) || null
  })

  const applyAgent = (agentId?: string, conversationId?: string | null) => {
    if (!agentId) {
      setAgentRuntimeDefaults({ agentId: undefined, modelId: undefined, systemPrompt: undefined, temperature: undefined })
      if (conversationId) {
        setConversationRuntimeConfig(conversationId, { agentId: undefined, modelId: undefined, systemPrompt: undefined, temperature: undefined })
      }
      return
    }

    const agent = allAgents.value.find(item => item.id === agentId)
    if (!agent) return

    setAgentRuntimeDefaults({
      agentId: agent.id,
      modelId: agent.modelId,
      systemPrompt: agent.systemPrompt,
      temperature: agent.temperature,
    })

    if (conversationId) {
      setConversationRuntimeConfig(conversationId, {
        agentId: agent.id,
        modelId: agent.modelId,
        systemPrompt: agent.systemPrompt,
        temperature: agent.temperature,
      })
    }
  }

  const setConversationRuntimeConfig = (conversationId: string, config: Partial<RuntimeConfigValues>) => {
    const nextLayer: RuntimeConfigLayer = {
      ...(runtimeConfig.value.conversationOverrides[conversationId] || {}),
      ...config,
      updatedAt: new Date()
    }

    runtimeConfig.value.conversationOverrides = {
      ...runtimeConfig.value.conversationOverrides,
      [conversationId]: nextLayer
    }

    const conversation = conversations.value.find(item => item.id === conversationId)
    if (conversation) {
      conversation.runtimeConfig = nextLayer
      if (config.modelId) {
        conversation.modelId = config.modelId
      }
    }

    syncCurrentModel(config.modelId)
  }

  const getConversationRuntimeConfig = (conversationId?: string | null): RuntimeConfigLayer => {
    if (!conversationId) return {}
    return runtimeConfig.value.conversationOverrides[conversationId] || {}
  }

  const resolveRuntimeConfig = (conversationId?: string | null): RuntimeConfigLayer => ({
    ...runtimeConfig.value.systemDefaults,
    ...runtimeConfig.value.userDefaults,
    ...runtimeConfig.value.agentDefaults,
    ...getConversationRuntimeConfig(conversationId)
  })

  const switchModel = (modelId: string) => {
    const model = models.value.find(m => m.id === modelId)
    if (model) {
      currentModel.value = model
      if (currentConversation.value) {
        setConversationRuntimeConfig(currentConversation.value.id, { modelId })
      }
    }
  }

  const updateModelConfig = (modelId: string, config: Partial<AIModel>) => {
    const model = models.value.find(m => m.id === modelId)
    if (model) {
      Object.assign(model, config)
    }
  }

  const setModels = (items: AIModel[], preferredModelId?: string) => {
    if (!items.length) return

    models.value = items

    const nextModel = preferredModelId
      ? items.find(item => item.id === preferredModelId)
      : items.find(item => item.id === currentModel.value.id)
        || items.find(item => item.isActive)
        || items[0]

    if (nextModel) {
      currentModel.value = nextModel
      if (!runtimeConfig.value.userDefaults.modelId) {
        setUserRuntimeDefaults({ modelId: nextModel.id })
      }
    }
  }

  const setPreferences = (nextPreferences: Partial<UserPreferenceState>) => {
    preferences.value = {
      ...preferences.value,
      ...nextPreferences
    }
    persistPreferences()
  }

  return {
    conversations,
    currentConversation,
    models,
    currentModel,
    officialAgents,
    privateAgents,
    allAgents,
    activeAgent,
    isLoading,
    runtimeConfig,
    preferences,
    sortedConversations,
    createConversation,
    addMessage,
    deleteConversation,
    setConversations,
    setCurrentConversation,
    upsertConversation,
    setSystemRuntimeDefaults,
    setUserRuntimeDefaults,
    setAgentRuntimeDefaults,
    setAgents,
    applyAgent,
    setConversationRuntimeConfig,
    getConversationRuntimeConfig,
    resolveRuntimeConfig,
    setPreferences,
    switchModel,
    updateModelConfig,
    setModels
  }
}

export const useChatStore = () => {
  if (!__chatStore) {
    __chatStore = createChatStore()
  }
  return __chatStore
}
