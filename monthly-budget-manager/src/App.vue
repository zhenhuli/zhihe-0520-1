<template>
  <div class="app-container" :class="{ dark: settingsStore.theme === 'dark' }">
    <header class="app-header">
      <h1 class="app-title">💰 月度预算管控</h1>
    </header>
    
    <main class="app-main">
      <router-view />
    </main>
    
    <nav class="app-nav">
      <router-link 
        v-for="item in navItems" 
        :key="item.path"
        :to="item.path"
        class="nav-item"
        active-class="active"
      >
        <span class="nav-icon">{{ item.icon }}</span>
        <span class="nav-label">{{ item.label }}</span>
      </router-link>
    </nav>
  </div>
</template>

<script setup>
import { useSettingsStore } from './stores/settings'

const settingsStore = useSettingsStore()

const navItems = [
  { path: '/home', icon: '📊', label: '总览' },
  { path: '/budget', icon: '⚙️', label: '预算' },
  { path: '/records', icon: '📝', label: '记录' },
  { path: '/statistics', icon: '📈', label: '统计' },
  { path: '/settings', icon: '👤', label: '设置' }
]
</script>
