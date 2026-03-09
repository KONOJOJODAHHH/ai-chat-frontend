import axios from 'axios'
import type { Conversation } from '@/composables/useChatStore'
import * as mockApi from './mockApi'
import type { UserProfile } from '@/composables/useAuthStore'

const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === 'true'
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => {
    const res = response.data

    if (res && typeof res === 'object' && res.code !== undefined) {
      if (res.code === 1) {
        return res.data
      }

      const businessError = new Error(res.msg || 'API Error') as Error & {
        response?: { data?: typeof res }
      }
      businessError.response = { data: res }
      return Promise.reject(businessError)
    }

    return res
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      sessionStorage.removeItem('token')
      window.location.href = '/login'
    }

    return Promise.reject(error)
  }
)

export interface ChatRequest {
  message: string
  modelId: string
  agentId?: string
  systemPrompt?: string
  temperature?: number
  conversationId?: string
}

export interface ChatResponse {
  content: string
  model: string
  agentId?: number
  systemPrompt?: string
  temperature?: number
  conversationId: string
}

export interface ModelConfig {
  id: string
  modelId?: string
  name: string
  provider: string
  temperature?: number
  enabled?: boolean
  isDefault?: boolean
  isActive: boolean
  /** true = 官方/管理员预设，false/undefined = 用户自定义 */
  official?: boolean
  userId?: string
}

export interface AgentItem {
  id: string
  name: string
  description?: string
  modelId?: string
  systemPrompt?: string
  temperature?: number
  official: boolean
  enabled: boolean
}

export interface StatsTrendItem {
  label: string
  count: number
  successCount?: number
  failureCount?: number
}

export interface DistributionItem {
  name: string
  count: number
}

export interface UserStatsResponse {
  conversationCount: number
  messageCount: number
  recentActivityTrend: StatsTrendItem[]
  yearlyActivityTrend: Array<{ date: string; count: number }>
  modelDistribution: DistributionItem[]
  agentDistribution: DistributionItem[]
  recentActiveAt?: string
  failureCount: number
  averageDuration: number
}

export interface AdminPageResult<T> {
  items: T[]
  total: number
}

export interface AdminModelItem {
  id: string
  modelId: string
  name: string
  provider: string
  baseUrl?: string
  apiKey?: string
  enabled: boolean
  isDefault: boolean
  temperature?: number
  remark?: string
}

export interface AdminUserItem {
  id: string
  username: string
  nickname?: string
  role: string
  status: string
  createdAt?: string
  registeredAt?: string
  lastLoginAt?: string
}

export interface AdminPromptItem {
  id: string
  title: string
  content: string
}

interface BackendPageResult<T> {
  total?: number
  records?: T[]
}

const toPageResult = <TOutput>(
  payload: BackendPageResult<unknown> | TOutput[] | undefined,
  mapper: (item: any) => TOutput
): AdminPageResult<TOutput> => {
  if (Array.isArray(payload)) {
    return {
      items: payload.map(mapper),
      total: payload.length,
    }
  }

  const records = Array.isArray(payload?.records) ? payload.records : []
  return {
    items: records.map(mapper),
    total: Number(payload?.total || 0),
  }
}

const normalizeModel = (item: any): AdminModelItem => ({
  id: String(item?.id ?? ''),
  modelId: item?.modelId ?? '',
  name: item?.name ?? '',
  provider: item?.provider ?? '',
  baseUrl: item?.baseUrl,
  apiKey: item?.apiKey,
  enabled: item?.enabled !== false,
  isDefault: item?.isDefault === true,
  temperature: item?.temperature,
  remark: item?.remark,
})

const normalizeUser = (item: any): AdminUserItem => ({
  id: String(item?.id ?? ''),
  username: item?.username ?? '',
  nickname: item?.nickname ?? '',
  role: item?.role ?? 'user',
  status: item?.status ?? 'normal',
  createdAt: item?.createdAt,
  registeredAt: item?.createdAt,
  lastLoginAt: item?.lastLoginAt,
})

const normalizePrompt = (item: any): AdminPromptItem => ({
  id: String(item?.id ?? ''),
  title: item?.title ?? '',
  content: item?.content ?? '',
})

const normalizeAgent = (item: any): AgentItem => ({
  id: String(item?.id ?? ''),
  name: item?.name ?? '',
  description: item?.description ?? '',
  modelId: item?.modelId ?? '',
  systemPrompt: item?.systemPrompt ?? '',
  temperature: item?.temperature != null ? Number(item.temperature) : undefined,
  official: item?.official === true,
  enabled: item?.enabled !== false,
})

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

export const adminAPI = {
  listModels: async (q?: string, page?: number, size?: number) => {
    const response: any = await api.get('/admin/models', { params: { q, page, size } })
    return toPageResult(response, normalizeModel)
  },
  createModel: (payload: any) => api.post('/admin/models', payload),
  updateModel: (id: string, payload: any) => api.put(`/admin/models/${id}`, payload),
  deleteModel: (id: string) => api.delete(`/admin/models/${id}`),
  toggleModel: (id: string, enabled: boolean) => api.post(`/admin/models/${id}/toggle`, { enabled }),
  setDefaultModel: (id: string) => api.post(`/admin/models/${id}/default`),
  testModel: (id: string) => api.post(`/admin/models/${id}/test`),

  listUsers: async (q?: string, page?: number, size?: number) => {
    const response: any = await api.get('/admin/users', { params: { q, page, size } })
    return toPageResult(response, normalizeUser)
  },
  toggleUser: (id: string, status: string) => api.post(`/admin/users/${id}/status`, { status }),
  resetPassword: (id: string) => api.post(`/admin/users/${id}/reset-password`),
  setRole: (id: string, role: string) => api.post(`/admin/users/${id}/role`, { role }),

  getConfig: () => api.get('/admin/config'),
  updateConfig: (payload: any) => api.put('/admin/config', payload),
  cleanupChatRecords: () => api.post('/admin/config/chat-records/cleanup'),

  listPrompts: async () => {
    const response = await api.get<any[]>('/admin/prompts')
    return Array.isArray(response) ? response.map(normalizePrompt) : []
  },
  createPrompt: (payload: any) => api.post('/admin/prompts', payload),
  updatePrompt: (id: string, payload: any) => api.put(`/admin/prompts/${id}`, payload),
  deletePrompt: (id: string) => api.delete(`/admin/prompts/${id}`),

  dashboard: () => api.get('/admin/dashboard'),
  logs: async (filters?: any, page?: number, size?: number) => {
    const response: any = await api.get('/admin/logs', {
      params: {
        userId: filters?.userId,
        action: filters?.action,
        page,
        size,
      },
    })

    return {
      items: Array.isArray(response?.items) ? response.items : [],
      total: Number(response?.total || 0),
    }
  },
}

export const chatAPI = {
  sendMessage: (data: ChatRequest) => {
    if (USE_MOCK_API) {
      return mockApi.mockChatAPI.sendMessage(data)
    }
    return api.post<ChatResponse>('/chat', data)
  },

  getConversations: () => {
    if (USE_MOCK_API) {
      return mockApi.mockChatAPI.getConversations()
    }
    return api.get<Conversation[]>('/conversations')
  },

  getConversation: (id: string) => {
    if (USE_MOCK_API) {
      return Promise.resolve(null)
    }
    return api.get<Conversation>(`/conversations/${id}`)
  },

  deleteConversation: (id: string) => {
    if (USE_MOCK_API) {
      return mockApi.mockChatAPI.deleteConversation(id)
    }
    return api.delete(`/conversations/${id}`)
  },

  getModels: () => {
    if (USE_MOCK_API) {
      return mockApi.mockChatAPI.getModels()
    }
    return api.get<ModelConfig[]>('/models')
  },

  getAgents: async () => {
    if (USE_MOCK_API) {
      return mockApi.mockChatAPI.getAgents()
    }

    const response = await api.get('/agents') as { official?: any[]; privateAgents?: any[] }
    return {
      official: Array.isArray(response?.official) ? response.official.map(normalizeAgent) : [],
      privateAgents: Array.isArray(response?.privateAgents) ? response.privateAgents.map(normalizeAgent) : [],
    }
  },

  createAgent: (payload: { name: string; description?: string; modelId?: string; systemPrompt?: string; temperature?: number }) => {
    if (USE_MOCK_API) {
      return mockApi.mockChatAPI.createAgent(payload)
    }
    return api.post<AgentItem>('/agents', payload)
  },

  updateAgent: (id: string, payload: { name: string; description?: string; modelId?: string; systemPrompt?: string; temperature?: number }) => {
    if (USE_MOCK_API) {
      return mockApi.mockChatAPI.updateAgent(id, payload)
    }
    return api.put<AgentItem>(`/agents/${id}`, payload)
  },

  deleteAgent: (id: string) => {
    if (USE_MOCK_API) {
      return mockApi.mockChatAPI.deleteAgent(id)
    }
    return api.delete(`/agents/${id}`)
  },

  getMyStats: () => {
    if (USE_MOCK_API) {
      return mockApi.mockChatAPI.getMyStats()
    }
    return api.get('/stats/me') as Promise<UserStatsResponse>
  },

  updateModel: (id: string, config: Partial<ModelConfig>) => {
    if (USE_MOCK_API) {
      return mockApi.mockChatAPI.updateModel(id, config)
    }
    return api.put(`/models/${id}`, config)
  },

  testModel: (modelId: string) => {
    if (USE_MOCK_API) {
      return mockApi.mockChatAPI.testModel(modelId)
    }
    return api.post(`/models/${modelId}/test`)
  },

  // ---- 用户自定义模型 ----

  getUserModels: (): Promise<ModelConfig[]> => {
    return api.get<ModelConfig[]>('/models/user-models').then((res: any) =>
      (Array.isArray(res) ? res : []).map((item: any) => ({
        id: String(item.id ?? ''),
        modelId: item.modelId ?? '',
        name: item.name ?? '',
        provider: item.provider ?? '',
        temperature: item.temperature,
        enabled: item.enabled !== false,
        isDefault: item.isDefault === true,
        isActive: item.enabled !== false,
        official: false,
        userId: item.userId != null ? String(item.userId) : undefined,
      }))
    )
  },

  createUserModel: (payload: { name: string; provider: string; modelId?: string; baseUrl?: string; apiKey: string; temperature?: number }) => {
    return api.post('/models/user-models', payload)
  },

  updateUserModel: (id: string, payload: { name?: string; provider?: string; modelId?: string; baseUrl?: string; apiKey?: string; temperature?: number }) => {
    return api.put(`/models/user-models/${id}`, payload)
  },

  deleteUserModel: (id: string) => {
    return api.delete(`/models/user-models/${id}`)
  },
}

export default api
