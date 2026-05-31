import { defineStore } from 'pinia'
import { ref } from 'vue'
import { STORAGE_KEYS } from '../types'

const loadSettings = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (e) {
    console.error('加载设置失败:', e)
  }
  return { theme: 'light' }
}

export const useSettingsStore = defineStore('settings', () => {
  const theme = ref(loadSettings().theme || 'light')

  const saveSettings = () => {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify({
        theme: theme.value
      }))
    } catch (e) {
      console.error('保存设置失败:', e)
    }
  }

  const toggleTheme = () => {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
    saveSettings()
    applyTheme()
  }

  const setTheme = (newTheme) => {
    theme.value = newTheme
    saveSettings()
    applyTheme()
  }

  const applyTheme = () => {
    if (theme.value === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  return {
    theme,
    toggleTheme,
    setTheme,
    applyTheme
  }
})
