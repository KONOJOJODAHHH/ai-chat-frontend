import axios from 'axios'
import type { AIModel, Conversation } from '@/composables/useChatStore'
import * as mockApi from './mockApi'
import type { UserProfile } from '@/composables/useAuthStore'

// 是否使用mock API（在没有后端服务时启用）
const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === 'true' || false

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    if (error.response?.status === 401) {
      // 处理未授权情况
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export interface ChatRequest {
  message: string
  modelId: string
  conversationId?: string
}

export interface ChatResponse {
  content: string
  model: string
  conversationId: string
}

export interface ModelConfig {
  id: string
  name: string
  provider: string
  apiKey?: string
  baseUrl?: string
  isActive: boolean
}

export const authAPI = {
  login: (data: { username: string; password: string }) => {
    if (USE_MOCK_API) return mockApi.mockAuthAPI.login(data)
    return api.post<{ token: string; user: UserProfile }>('/auth/login', data)
  },
  register: (data: { username: string; password: string }) => {
    if (USE_MOCK_API) return mockApi.mockAuthAPI.register(data)
    return api.post<{ id: string }>('/auth/register', data)
  },
  profile: () => {
    if (USE_MOCK_API) return mockApi.mockAuthAPI.profile()
    return api.get<UserProfile>('/auth/me')
  },
  updateProfile: (payload: any) => {
    if (USE_MOCK_API) return mockApi.mockAuthAPI.updateProfile(payload)
    return api.put('/auth/me', payload)
  },
  changePassword: (payload: { oldPassword: string; newPassword: string }) => {
    if (USE_MOCK_API) return mockApi.mockAuthAPI.changePassword(payload)
    return api.post('/auth/change-password', payload)
  },
}

const adminMockState: any = {
  models: [
    { id: 'deepseek', name: 'DeepSeek-Chat', provider: 'deepseek', baseUrl: 'https://api.deepseek.com', apiKey: '', enabled: true, method: 'POST', temperature: 0.7, isDefault: true, remark: '' },
    { id: 'doubao', name: 'Doubao-4k', provider: 'doubao', baseUrl: 'https://api.doubao.com', apiKey: '', enabled: false, method: 'POST', temperature: 0.7, isDefault: false, remark: '' },
  ],
  users: [
    { id: 'u1', username: 'admin', nickname: '管理员', role: 'admin', status: 'normal', registeredAt: Date.now() - 86400000, lastLoginAt: Date.now() },
    { id: 'u2', username: 'user1', nickname: '用户一', role: 'user', status: 'normal', registeredAt: Date.now() - 172800000, lastLoginAt: Date.now() - 3600000 },
  ],
  sessions: [
    { id: 's1', userId: 'u2', modelId: 'deepseek', updatedAt: Date.now(), messageCount: 5 },
  ],
  prompts: [
    { id: 'p1', title: '通用助手', content: '你是一个专业的AI助手。' },
  ],
  config: { defaultModelId: 'deepseek', announcement: '系统维护时间周六晚', dailyLimit: 100, perMinuteLimit: 20 },
  logs: [] as any[],
}

const adminMock = {
  listModels: async (q?: string, page = 1, size = 10) => { let data = adminMockState.models; if (q) data = data.filter((m:any) => m.name.toLowerCase().includes((q||'').toLowerCase())); const total = data.length; const items = data.slice((page-1)*size, page*size); return { items, total } },
  createModel: async (payload: any) => { const id = Date.now().toString(); const m = { id, enabled: true, isDefault: false, temperature: 0.7, method: 'POST', remark: '', ...payload }; adminMockState.models.push(m); return m },
  updateModel: async (id: string, payload: any) => { adminMockState.models = adminMockState.models.map((m:any) => m.id===id ? { ...m, ...payload } : m); return adminMockState.models.find((m:any)=>m.id===id) },
  deleteModel: async (id: string) => { adminMockState.models = adminMockState.models.filter((m:any)=>m.id!==id); return { success: true } },
  toggleModel: async (id: string, enabled: boolean) => { const m = adminMockState.models.find((x:any)=>x.id===id); if (m) m.enabled = enabled; return m },
  setDefaultModel: async (id: string) => { adminMockState.models = adminMockState.models.map((m:any)=>({ ...m, isDefault: m.id===id })); adminMockState.config.defaultModelId = id; return { success: true } },
  testModel: async () => { return { success: true } },
  listUsers: async (q?: string, page = 1, size = 10) => { let data = adminMockState.users; if (q) data = data.filter((u:any)=>u.username.includes(q)); const total = data.length; const items = data.slice((page-1)*size, page*size); return { items, total } },
  toggleUser: async (id: string, status: 'normal'|'disabled') => { adminMockState.users = adminMockState.users.map((u:any)=>u.id===id?{...u,status}:u); return adminMockState.users.find((u:any)=>u.id===id) },
  resetPassword: async () => { return { defaultPassword: '123456' } },
  setRole: async (id: string, role: 'user'|'admin') => { adminMockState.users = adminMockState.users.map((u:any)=>u.id===id?{...u,role}:u); return adminMockState.users.find((u:any)=>u.id===id) },
  listSessions: async (filters?: any, page = 1, size = 10) => { const total = adminMockState.sessions.length; const items = adminMockState.sessions.slice((page-1)*size, page*size); return { items, total } },
  sessionDetail: async (id: string) => { return { id, messages: [{ role: 'user', content: '你好' }, { role: 'assistant', content: '你好，有什么可以帮助的' }] } },
  cleanupSessions: async (beforeTs: number) => { const prev = adminMockState.sessions.length; adminMockState.sessions = adminMockState.sessions.filter((s:any)=>s.updatedAt>=beforeTs); return { removed: prev - adminMockState.sessions.length } },
  getConfig: async () => adminMockState.config,
  updateConfig: async (payload: any) => { adminMockState.config = { ...adminMockState.config, ...payload }; return adminMockState.config },
  listPrompts: async () => adminMockState.prompts,
  createPrompt: async (p:any) => { const item = { id: Date.now().toString(), ...p }; adminMockState.prompts.push(item); return item },
  updatePrompt: async (id:string, p:any) => { adminMockState.prompts = adminMockState.prompts.map((x:any)=>x.id===id?{...x,...p}:x); return adminMockState.prompts.find((x:any)=>x.id===id) },
  deletePrompt: async (id:string) => { adminMockState.prompts = adminMockState.prompts.filter((x:any)=>x.id!==id); return { success: true } },
  dashboard: async () => ({ users: adminMockState.users.length, sessions: adminMockState.sessions.length, messages: 42, todayUsers: 1, modelCalls: adminMockState.models.map((m:any)=>({ name: m.name, count: Math.floor(Math.random()*20) })) }),
  logs: async () => ({ items: adminMockState.logs, total: adminMockState.logs.length }),
}

export const adminAPI = {
  listModels: (q?: string, page?: number, size?: number) => USE_MOCK_API ? adminMock.listModels(q, page, size) : api.get('/admin/models', { params: { q, page, size } }),
  createModel: (payload: any) => USE_MOCK_API ? adminMock.createModel(payload) : api.post('/admin/models', payload),
  updateModel: (id: string, payload: any) => USE_MOCK_API ? adminMock.updateModel(id, payload) : api.put(`/admin/models/${id}`, payload),
  deleteModel: (id: string) => USE_MOCK_API ? adminMock.deleteModel(id) : api.delete(`/admin/models/${id}`),
  toggleModel: (id: string, enabled: boolean) => USE_MOCK_API ? adminMock.toggleModel(id, enabled) : api.post(`/admin/models/${id}/toggle`, { enabled }),
  setDefaultModel: (id: string) => USE_MOCK_API ? adminMock.setDefaultModel(id) : api.post(`/admin/models/${id}/default`),
  testModel: (id: string) => USE_MOCK_API ? adminMock.testModel(id) : api.post(`/admin/models/${id}/test`),

  listUsers: (q?: string, page?: number, size?: number) => USE_MOCK_API ? adminMock.listUsers(q, page, size) : api.get('/admin/users', { params: { q, page, size } }),
  toggleUser: (id: string, status: string) => USE_MOCK_API ? adminMock.toggleUser(id, status as any) : api.post(`/admin/users/${id}/status`, { status }),
  resetPassword: (id: string) => USE_MOCK_API ? adminMock.resetPassword(id) : api.post(`/admin/users/${id}/reset-password`),
  setRole: (id: string, role: string) => USE_MOCK_API ? adminMock.setRole(id, role as any) : api.post(`/admin/users/${id}/role`, { role }),

  listSessions: (filters?: any, page?: number, size?: number) => USE_MOCK_API ? adminMock.listSessions(filters, page, size) : api.get('/admin/sessions', { params: { ...filters, page, size } }),
  sessionDetail: (id: string) => USE_MOCK_API ? adminMock.sessionDetail(id) : api.get(`/admin/sessions/${id}`),
  cleanupSessions: (beforeTs: number) => USE_MOCK_API ? adminMock.cleanupSessions(beforeTs) : api.post('/admin/sessions/cleanup', { beforeTs }),

  getConfig: () => USE_MOCK_API ? adminMock.getConfig() : api.get('/admin/config'),
  updateConfig: (payload: any) => USE_MOCK_API ? adminMock.updateConfig(payload) : api.put('/admin/config', payload),

  listPrompts: () => USE_MOCK_API ? adminMock.listPrompts() : api.get('/admin/prompts'),
  createPrompt: (p: any) => USE_MOCK_API ? adminMock.createPrompt(p) : api.post('/admin/prompts', p),
  updatePrompt: (id: string, p: any) => USE_MOCK_API ? adminMock.updatePrompt(id, p) : api.put(`/admin/prompts/${id}`, p),
  deletePrompt: (id: string) => USE_MOCK_API ? adminMock.deletePrompt(id) : api.delete(`/admin/prompts/${id}`),

  dashboard: () => USE_MOCK_API ? adminMock.dashboard() : api.get('/admin/dashboard'),
  logs: (filters?: any, page?: number, size?: number) => USE_MOCK_API ? adminMock.logs(filters, page, size) : api.get('/admin/logs', { params: { ...filters, page, size } }),
}

export const chatAPI = {
  // 发送消息
  sendMessage: (data: ChatRequest) => {
    if (USE_MOCK_API) {
      return mockApi.mockChatAPI.sendMessage(data)
    }
    return api.post<ChatResponse>('/chat', data)
  },

  // 获取对话历史
  getConversations: () => {
    if (USE_MOCK_API) {
      return mockApi.mockChatAPI.getConversations()
    }
    return api.get<Conversation[]>('/conversations')
  },

  // 获取单个对话详情
  getConversation: (id: string) => {
    if (USE_MOCK_API) {
      return Promise.resolve(null)
    }
    return api.get<Conversation>(`/conversations/${id}`)
  },

  // 删除对话
  deleteConversation: (id: string) => {
    if (USE_MOCK_API) {
      return mockApi.mockChatAPI.deleteConversation(id)
    }
    return api.delete(`/conversations/${id}`)
  },

  // 获取模型列表
  getModels: () => {
    if (USE_MOCK_API) {
      return mockApi.mockChatAPI.getModels()
    }
    return api.get<ModelConfig[]>('/models')
  },

  // 更新模型配置
  updateModel: (id: string, config: Partial<ModelConfig>) => {
    if (USE_MOCK_API) {
      return mockApi.mockChatAPI.updateModel(id, config)
    }
    return api.put(`/models/${id}`, config)
  },

  // 测试模型连接
  testModel: (modelId: string) => {
    if (USE_MOCK_API) {
      return mockApi.mockChatAPI.testModel(modelId)
    }
    return api.post(`/models/${modelId}/test`)
  }
}

export default api