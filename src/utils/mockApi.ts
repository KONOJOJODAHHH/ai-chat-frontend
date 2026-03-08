// Mock API for testing without backend
export const mockChatAPI = {
  sendMessage: async (data: { message: string; modelId: string; agentId?: string; systemPrompt?: string; temperature?: number; conversationId?: string }) => {
    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 1000))

    // 模拟AI回复
    const responses = [
      "这是一个模拟的AI回复。",
      "我理解你的问题，让我为你提供详细的回答。",
      "基于我的知识，我可以告诉你相关信息。",
      "这是一个很有趣的问题，我来为你解答。"
    ]

    const randomResponse = responses[Math.floor(Math.random() * responses.length)]

    return {
      content: `${randomResponse} 你发送的消息是："${data.message}"`,
      model: data.modelId,
      agentId: data.agentId ? Number(data.agentId) : undefined,
      systemPrompt: data.systemPrompt,
      temperature: data.temperature,
      conversationId: data.conversationId || 'mock-conv-1'
    }
  },

  getConversations: async () => {
    return []
  },

  deleteConversation: async (id: string) => {
    return { success: true }
  },

  getModels: async () => {
    return [
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
    ]
  },

  getAgents: async () => {
    return {
      official: [
        {
          id: '101',
          name: '通用助手',
          description: '适合日常问答与信息整理',
          modelId: 'deepseek',
          systemPrompt: '你是一个清晰、可靠、简洁的 AI 助手。',
          temperature: 0.7,
          official: true,
          enabled: true,
        },
        {
          id: '102',
          name: '代码助手',
          description: '偏向代码分析、修复与解释',
          modelId: 'deepseek',
          systemPrompt: '你是一个注重正确性和可维护性的编程助手。',
          temperature: 0.2,
          official: true,
          enabled: true,
        }
      ],
      privateAgents: [],
    }
  },

  createAgent: async (payload: any) => ({
    id: String(Date.now()),
    ...payload,
    official: false,
    enabled: true,
  }),

  updateAgent: async (id: string, payload: any) => ({
    id,
    ...payload,
    official: false,
    enabled: true,
  }),

  deleteAgent: async (id: string) => ({ success: true }),

  getMyStats: async () => ({
    conversationCount: 6,
    messageCount: 42,
    recentActivityTrend: [
      { label: '2026-03-02', count: 3, successCount: 3, failureCount: 0 },
      { label: '2026-03-03', count: 5, successCount: 5, failureCount: 0 },
      { label: '2026-03-04', count: 4, successCount: 4, failureCount: 0 },
      { label: '2026-03-05', count: 6, successCount: 5, failureCount: 1 },
      { label: '2026-03-06', count: 8, successCount: 8, failureCount: 0 },
      { label: '2026-03-07', count: 7, successCount: 7, failureCount: 0 },
      { label: '2026-03-08', count: 9, successCount: 8, failureCount: 1 },
    ],
    modelDistribution: [
      { name: 'deepseek', count: 18 },
      { name: 'doubao', count: 7 },
    ],
    agentDistribution: [
      { name: '代码助手', count: 11 },
      { name: '通用助手', count: 9 },
      { name: 'none', count: 5 },
    ],
    recentActiveAt: new Date().toISOString(),
    failureCount: 2,
    averageDuration: 836,
  }),

  updateModel: async (id: string, config: any) => {
    return { success: true }
  },

  testModel: async (modelId: string) => {
    return { success: true, message: '连接成功' }
  }
}

export const mockAuthAPI = {
  login: async (data: { username: string; password: string }) => {
    await new Promise(r => setTimeout(r, 600))
    // 如果用户名是 admin，则返回管理员角色
    const role = data.username.toLowerCase() === 'admin' ? 'admin' : 'user'
    return {
      token: 'mock-jwt-token',
      user: {
        id: 'u1',
        username: data.username,
        avatarUrl: '',
        role
      }
    }
  },
  register: async (data: { username: string; password: string }) => {
    await new Promise(r => setTimeout(r, 800))
    return { id: 'u1' }
  },
  profile: async () => {
    await new Promise(r => setTimeout(r, 300))
    const username = localStorage.getItem('lastUsername') || '用户'
    const role = username.toLowerCase() === 'admin' ? 'admin' : 'user'
    return {
      id: 'u1',
      username,
      avatarUrl: '',
      role
    }
  },
  updateProfile: async (payload: { nickname?: string;[key: string]: any }) => {
    await new Promise(r => setTimeout(r, 500))
    return { success: true }
  },
  changePassword: async (payload: { oldPassword: string; newPassword: string }) => {
    await new Promise(r => setTimeout(r, 500))
    // 简单模拟，实际应由后端验证旧密码
    return { success: true }
  },
}

/** @deprecated 请通过 authAPI.updateProfile 调用，此处保留以防直接引用 */
export const updateUserProfile = mockAuthAPI.updateProfile

/** @deprecated 请通过 authAPI.changePassword 调用，此处保留以防直接引用 */
export const changeUserPassword = mockAuthAPI.changePassword
