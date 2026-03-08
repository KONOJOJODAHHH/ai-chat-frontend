import { ref, watchEffect, onMounted, computed } from 'vue'

type Theme = 'light' | 'dark'
type ThemeMode = 'system' | Theme

const THEME_STORAGE_KEY = 'theme-mode'

export function useTheme() {
  const themeMode = ref<ThemeMode>('system')

  const getPreferredTheme = (): Theme => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'
  }

  const getSavedThemeMode = (): ThemeMode => {
    const saved = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null
    if (saved === 'system' || saved === 'light' || saved === 'dark') return saved
    return 'system'
  }

  const resolveTheme = (): Theme => {
    if (themeMode.value === 'system') {
      return getPreferredTheme()
    }

    return themeMode.value
  }

  const applyTheme = (t: Theme) => {
    document.documentElement.classList.remove('light', 'dark')
    document.documentElement.classList.add(t)
  }

  const setThemeMode = (mode: ThemeMode) => {
    themeMode.value = mode
    localStorage.setItem(THEME_STORAGE_KEY, mode)
  }

  const toggleTheme = () => {
    const nextTheme = resolveTheme() === 'light' ? 'dark' : 'light'
    setThemeMode(nextTheme)
  }

  const theme = computed<Theme>(() => resolveTheme())

  onMounted(() => {
    themeMode.value = getSavedThemeMode()
    applyTheme(theme.value)
  })

  watchEffect(() => {
    applyTheme(theme.value)
  })

  return {
    theme,
    themeMode,
    setThemeMode,
    toggleTheme,
    isDark: computed(() => theme.value === 'dark'),
  }
}
