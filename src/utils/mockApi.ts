// Mock API for testing without backend
export const mockChatAPI = {
  sendMessage: async (data: { message: string; modelId: string; conversationId?: string }) => {
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
}

export const updateUserProfile = async (data: { nickname: string }) => {
  await new Promise(r => setTimeout(r, 500))
  return { success: true }
}

export const changeUserPassword = async (data: { oldPassword: string; newPassword: string }) => {
  await new Promise(r => setTimeout(r, 500))
  // 简单模拟，实际应验证旧密码
  return { success: true }
}
