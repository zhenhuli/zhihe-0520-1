<template>
  <div class="settings-page">
    <div class="card">
      <div class="card-title">🎨 主题设置</div>
      <div class="flex items-center justify-between">
        <div>
          <div class="font-semibold">深色模式</div>
          <div class="text-sm text-secondary">切换应用主题颜色</div>
        </div>
        <button 
          class="theme-toggle"
          :class="{ active: settingsStore.theme === 'dark' }"
          @click="settingsStore.toggleTheme()"
        >
          <span class="toggle-slider"></span>
        </button>
      </div>
      <div class="mt-4 flex gap-2">
        <button 
          class="btn flex-1"
          :class="settingsStore.theme === 'light' ? 'btn-primary' : 'btn-secondary'"
          @click="settingsStore.setTheme('light')"
        >
          ☀️ 浅色
        </button>
        <button 
          class="btn flex-1"
          :class="settingsStore.theme === 'dark' ? 'btn-primary' : 'btn-secondary'"
          @click="settingsStore.setTheme('dark')"
        >
          🌙 深色
        </button>
      </div>
    </div>

    <div class="card">
      <div class="card-title">💾 数据管理</div>
      <div class="mb-4 p-4" style="background: var(--bg-primary); border-radius: var(--radius-sm);">
        <p class="text-sm text-secondary">
          💾 所有数据均存储在您的浏览器本地（localStorage），不会上传到任何服务器。
        </p>
      </div>
      
      <div class="setting-item" @click="exportData">
        <div class="flex items-center gap-3">
          <span class="text-2xl">📤</span>
          <div>
            <div class="font-semibold">导出数据</div>
            <div class="text-sm text-secondary">将所有数据导出为 JSON 文件备份</div>
          </div>
        </div>
        <span class="text-secondary">→</span>
      </div>
      
      <div class="setting-item" @click="document.getElementById('importFile').click()">
        <div class="flex items-center gap-3">
          <span class="text-2xl">📥</span>
          <div>
            <div class="font-semibold">导入数据</div>
            <div class="text-sm text-secondary">从 JSON 文件恢复数据</div>
          </div>
        </div>
        <span class="text-secondary">→</span>
      </div>
      <input 
        type="file" 
        id="importFile" 
        accept=".json" 
        style="display: none"
        @change="importData"
      />
      
      <div class="setting-item" @click="showStorageInfo">
        <div class="flex items-center gap-3">
          <span class="text-2xl">💽</span>
          <div>
            <div class="font-semibold">存储信息</div>
            <div class="text-sm text-secondary">查看本地存储使用情况</div>
          </div>
        </div>
        <span class="text-secondary">→</span>
      </div>
    </div>

    <div class="card">
      <div class="card-title">🔄 月份管理</div>
      
      <div class="setting-item" @click="confirmResetMonth">
        <div class="flex items-center gap-3">
          <span class="text-2xl">📅</span>
          <div>
            <div class="font-semibold">重置本月数据</div>
            <div class="text-sm text-secondary">清空本月所有收支记录</div>
          </div>
        </div>
        <span class="text-secondary">→</span>
      </div>
      
      <div class="setting-item" @click="confirmResetBudget">
        <div class="flex items-center gap-3">
          <span class="text-2xl">💰</span>
          <div>
            <div class="font-semibold">重置本月预算</div>
            <div class="text-sm text-secondary">将预算恢复为默认值</div>
          </div>
        </div>
        <span class="text-secondary">→</span>
      </div>
      
      <div class="setting-item danger" @click="confirmResetAll">
        <div class="flex items-center gap-3">
          <span class="text-2xl">⚠️</span>
          <div>
            <div class="font-semibold over-budget">清空所有数据</div>
            <div class="text-sm text-secondary">删除所有记录和预算设置（不可恢复）</div>
          </div>
        </div>
        <span class="text-secondary">→</span>
      </div>
    </div>

    <div class="card">
      <div class="card-title">ℹ️ 关于</div>
      <div class="flex justify-between items-center mb-2">
        <span>应用名称</span>
        <span class="font-semibold">月度预算管控</span>
      </div>
      <div class="flex justify-between items-center mb-2">
        <span>版本</span>
        <span class="font-semibold">1.0.0</span>
      </div>
      <div class="flex justify-between items-center mb-2">
        <span>当前月份</span>
        <span class="font-semibold">{{ currentMonth }}</span>
      </div>
      <div class="flex justify-between items-center">
        <span>数据记录</span>
        <span class="font-semibold">{{ budgetStore.records.length }} 条</span>
      </div>
      <div class="mt-4 p-4" style="background: var(--bg-primary); border-radius: var(--radius-sm);">
        <p class="text-sm text-secondary">
          💡 本工具主打「先做预算、再消费、超支预警」的预算管控理念，
          帮助您养成良好的消费习惯，实现财务自由。
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useBudgetStore } from '../stores/budget'
import { useSettingsStore } from '../stores/settings'
import { STORAGE_KEYS } from '../types'

const budgetStore = useBudgetStore()
const settingsStore = useSettingsStore()

const currentMonth = computed(() => {
  const now = new Date()
  return `${now.getFullYear()}年${now.getMonth() + 1}月`
})

const confirmResetMonth = () => {
  if (confirm('确定要清空本月所有收支记录吗？此操作不可撤销。')) {
    budgetStore.resetMonthData()
    alert('本月数据已重置')
  }
}

const confirmResetBudget = () => {
  if (confirm('确定要将本月预算恢复为默认值吗？')) {
    budgetStore.resetAllBudget()
    alert('预算已重置为默认值')
  }
}

const confirmResetAll = () => {
  if (confirm('⚠️ 警告：此操作将删除所有数据！\n\n确定要清空所有记录和预算设置吗？此操作不可恢复！')) {
    if (confirm('再次确认：真的要删除所有数据吗？')) {
      localStorage.removeItem(STORAGE_KEYS.BUDGET)
      localStorage.removeItem(STORAGE_KEYS.RECORDS)
      localStorage.removeItem(STORAGE_KEYS.CURRENT_MONTH)
      location.reload()
    }
  }
}

const exportData = () => {
  const data = {
    budget: {
      total: budgetStore.totalBudget,
      categories: budgetStore.categoryBudgets
    },
    records: budgetStore.records,
    exportDate: new Date().toISOString(),
    version: '1.0.0'
  }
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `budget-data-${new Date().toISOString().split('T')[0]}.json`
  a.click()
  URL.revokeObjectURL(url)
  
  alert('数据已导出成功！')
}

const importData = (event) => {
  const file = event.target.files[0]
  if (!file) return
  
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result)
      
      if (confirm('导入将覆盖现有数据，确定继续吗？')) {
        if (data.budget) {
          budgetStore.setTotalBudget(data.budget.total)
          for (const [key, value] of Object.entries(data.budget.categories)) {
            budgetStore.setCategoryBudget(key, value)
          }
        }
        
        if (data.records && Array.isArray(data.records)) {
          budgetStore.records = data.records
          try {
            localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(data.records))
          } catch (e) {
            console.error('保存记录失败:', e)
          }
        }
        
        alert('数据导入成功！')
        location.reload()
      }
    } catch (err) {
      alert('导入失败：文件格式不正确')
      console.error(err)
    }
  }
  reader.readAsText(file)
  event.target.value = ''
}

const showStorageInfo = () => {
  let totalSize = 0
  const itemSizes = []
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    const value = localStorage.getItem(key)
    const size = new Blob([value]).size
    totalSize += size
    itemSizes.push({ key, size })
  }
  
  const totalKB = (totalSize / 1024).toFixed(2)
  const details = itemSizes
    .sort((a, b) => b.size - a.size)
    .map(item => `${item.key}: ${(item.size / 1024).toFixed(2)} KB`)
    .join('\n')
  
  alert(`本地存储使用情况\n\n总大小: ${totalKB} KB\n\n明细:\n${details}`)
}
</script>

<style scoped>
.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 12px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: var(--transition);
  margin-bottom: 8px;
  border: 1px solid transparent;
}

.setting-item:hover {
  background: var(--bg-primary);
  border-color: var(--border-color);
}

.setting-item:last-child {
  margin-bottom: 0;
}

.setting-item.danger:hover {
  background: rgba(231, 76, 60, 0.05);
  border-color: var(--danger-color);
}

.theme-toggle {
  width: 52px;
  height: 28px;
  border-radius: 14px;
  background: var(--border-color);
  position: relative;
  cursor: pointer;
  border: none;
  transition: var(--transition);
}

.theme-toggle.active {
  background: var(--primary-color);
}

.toggle-slider {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: var(--transition);
}

.theme-toggle.active .toggle-slider {
  left: 26px;
}
</style>
