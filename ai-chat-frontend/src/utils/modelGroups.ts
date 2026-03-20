export interface ProviderGroup<T> {
  provider: string
  items: T[]
}

const UNKNOWN_PROVIDER_LABEL = '未分组'

const normalizeProviderLabel = (provider?: string | null) => {
  const value = String(provider || '').trim()
  return value || UNKNOWN_PROVIDER_LABEL
}

const compareText = (left: string, right: string) =>
  left.localeCompare(right, 'zh-Hans-CN', { sensitivity: 'base' })

export const groupModelsByProvider = <T extends { provider?: string | null }>(items: T[]): ProviderGroup<T>[] => {
  const groupedMap = new Map<string, T[]>()

  for (const item of items) {
    const provider = normalizeProviderLabel(item.provider)
    const bucket = groupedMap.get(provider)
    if (bucket) {
      bucket.push(item)
      continue
    }
    groupedMap.set(provider, [item])
  }

  const groups = Array.from(groupedMap.entries()).map(([provider, providerItems]) => ({
    provider,
    items: providerItems.slice().sort((a: any, b: any) => {
      const aName = String(a?.name || a?.modelId || a?.id || '')
      const bName = String(b?.name || b?.modelId || b?.id || '')
      return compareText(aName, bName)
    }),
  }))

  return groups.sort((a, b) => {
    if (a.provider === UNKNOWN_PROVIDER_LABEL) return 1
    if (b.provider === UNKNOWN_PROVIDER_LABEL) return -1
    return compareText(a.provider, b.provider)
  })
}
