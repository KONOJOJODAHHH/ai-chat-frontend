import { ref, computed } from 'vue'

export interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
  model?: string
}

export interface Conversation {
  id: string
  title: string
  messages: Message[]
  createdAt: Date
  updatedAt: Date
}

export interface AIModel {
  id: string
  name: string
  provider: string
  apiKey?: string
  baseUrl?: string
  isActive: boolean
}

export const useChatStore = () => {
  const conversations = ref<Conversation[]>([])
  const currentConversation = ref<Conversation | null>(null)
  const models = ref<AIModel[]>([
    {
      id: 'deepseek',
      name: 'DeepSeek',
      provider: 'deepseek',
      isActive: true
    },
    {
      id: 'doubao',
      name: '豆包',
      provider: 'doubao',
      isActive: false
    }
  ])
  const currentModel = ref<AIModel>(models.value[0])
  const isLoading = ref(false)

  // 初始化演示数据
  const initDemoData = () => {
    const demoConversation: Conversation = {
      id: 'demo-1',
      title: '欢迎使用AI智能对话系统',
      messages: [
        {
          id: 'demo-msg-1',
          content: '你好！欢迎使用AI智能对话系统。这是一个支持多种AI大模型的智能问答平台。',
          role: 'assistant',
          timestamp: new Date(Date.now() - 5 * 60000),
          model: 'DeepSeek'
        },
        {
          id: 'demo-msg-2',
          content: '系统支持哪些功能？',
          role: 'user',
          timestamp: new Date(Date.now() - 3 * 60000)
        },
        {
          id: 'demo-msg-3',
          content: '本系统支持以下功能：\n\n1. **多模型支持**：集成DeepSeek、豆包等主流AI大模型\n2. **对话管理**：完整的对话历史记录和管理\n3. **模型配置**：灵活的API密钥和参数配置\n4. **实时交互**：流畅的聊天体验\n5. **响应式设计**：适配各种设备\n\n你可以随时切换不同的AI模型来获得最佳的回答效果。',
          role: 'assistant',
          timestamp: new Date(Date.now() - 2 * 60000),
          model: 'DeepSeek'
        }
      ],
      createdAt: new Date(Date.now() - 10 * 60000),
      updatedAt: new Date(Date.now() - 2 * 60000)
    }
    
    conversations.value = [demoConversation]
    currentConversation.value = demoConversation
  }

  // 初始化时加载演示数据
  initDemoData()

  const sortedConversations = computed(() => {
    return conversations.value.sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
  })

  const createConversation = (title: string = '新对话'): Conversation => {
    const conversation: Conversation = {
      id: Date.now().toString(),
      title,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }
    conversations.value.push(conversation)
    currentConversation.value = conversation
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
    if (role === 'user' && currentConversation.value!.messages.length === 1) {
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

  const switchModel = (modelId: string) => {
    const model = models.value.find(m => m.id === modelId)
    if (model) {
      currentModel.value = model
    }
  }

  const updateModelConfig = (modelId: string, config: Partial<AIModel>) => {
    const model = models.value.find(m => m.id === modelId)
    if (model) {
      Object.assign(model, config)
    }
  }

  return {
    conversations,
    currentConversation,
    models,
    currentModel,
    isLoading,
    sortedConversations,
    createConversation,
    addMessage,
    deleteConversation,
    switchModel,
    updateModelConfig
  }
}