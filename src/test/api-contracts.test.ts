import { describe, expect, it } from 'vitest'
import { mockChatAPI } from '@/utils/mockApi'

describe('mock chat api contracts', () => {
  it('returns runtime fields for chat responses', async () => {
    const response = await mockChatAPI.sendMessage({
      message: 'hello',
      modelId: 'deepseek',
      agentId: '101',
      systemPrompt: 'test prompt',
      temperature: 0.8,
    })

    expect(response.model).toBe('deepseek')
    expect(response.agentId).toBe(101)
    expect(response.systemPrompt).toBe('test prompt')
    expect(response.temperature).toBe(0.8)
  })

  it('returns grouped agent lists', async () => {
    const response = await mockChatAPI.getAgents()

    expect(Array.isArray(response.official)).toBe(true)
    expect(Array.isArray(response.privateAgents)).toBe(true)
    expect(response.official.length).toBeGreaterThan(0)
  })
})
