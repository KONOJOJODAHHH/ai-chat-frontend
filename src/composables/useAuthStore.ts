import { ref, computed } from 'vue'

export interface UserProfile {
  id: string
  username: string
  avatarUrl?: string
  role?: 'admin' | 'user'
}

let __authStore: any
export const useAuthStore = () => {
  if (__authStore) return __authStore
  const token = ref<string | null>(localStorage.getItem('token'))
  const user = ref<UserProfile | null>(null)
  const rememberMe = ref<boolean>(localStorage.getItem('rememberMe') === 'true')

  const isAuthenticated = computed(() => !!token.value)

  const setToken = (t: string | null, remember?: boolean) => {
    token.value = t
    if (t) {
      localStorage.setItem('token', t)
      if (remember !== undefined) {
        rememberMe.value = !!remember
        localStorage.setItem('rememberMe', rememberMe.value ? 'true' : 'false')
      }
    } else {
      localStorage.removeItem('token')
    }
  }

  const setUser = (u: UserProfile | null) => {
    user.value = u
    if (u) {
      localStorage.setItem('user', JSON.stringify(u))
    } else {
      localStorage.removeItem('user')
    }
  }

  const init = async (fetcher?: () => Promise<UserProfile | null>) => {
    const cached = localStorage.getItem('user')
    if (cached) {
      try {
        user.value = JSON.parse(cached)
      } catch {}
    }
    if (token.value && fetcher) {
      try {
        const profile = await fetcher()
        if (profile) setUser(profile)
      } catch {}
    }
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('rememberMe')
  }

  __authStore = {
    token,
    user,
    rememberMe,
    isAuthenticated,
    setToken,
    setUser,
    init,
    logout,
  }
  return __authStore
}
