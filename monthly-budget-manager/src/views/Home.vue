<template>
  <div class="home-page">
    <div class="card">
      <div class="card-title">📊 本月预算概览</div>
      <div class="stat-grid">
        <div class="stat-card">
          <div class="stat-value">¥{{ budgetStore.totalBudget.toLocaleString() }}</div>
          <div class="stat-label">总预算</div>
        </div>
        <div class="stat-card">
          <div class="stat-value over-budget">¥{{ budgetStore.totalExpense.toLocaleString() }}</div>
          <div class="stat-label">已消费</div>
        </div>
        <div class="stat-card">
          <div class="stat-value" :class="budgetStore.remainingBudget < 0 ? 'over-budget' : 'success'">
            ¥{{ budgetStore.remainingBudget.toLocaleString() }}
          </div>
          <div class="stat-label">剩余可用</div>
        </div>
        <div class="stat-card">
          <div class="stat-value" :class="usageRateClass">
            {{ budgetStore.budgetUsageRate.toFixed(1) }}%
          </div>
          <div class="stat-label">预算使用率</div>
        </div>
      </div>
      
      <div class="mb-4">
        <div class="flex justify-between items-center mb-2">
          <span class="text-sm text-secondary">预算使用进度</span>
          <span class="text-sm font-semibold">{{ budgetStore.budgetUsageRate.toFixed(1) }}%</span>
        </div>
        <div class="progress-bar">
          <div 
            class="progress-fill" 
            :class="usageProgressClass"
            :style="{ width: Math.min(budgetStore.budgetUsageRate, 100) + '%' }"
          ></div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-title">💸 消费汇总</div>
      <div class="stat-grid">
        <div class="stat-card">
          <div class="stat-value text-lg">¥{{ budgetStore.todayExpense.toLocaleString() }}</div>
          <div class="stat-label">今日消费</div>
        </div>
        <div class="stat-card">
          <div class="stat-value text-lg">¥{{ budgetStore.weekExpense.toLocaleString() }}</div>
          <div class="stat-label">本周消费</div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-title">🥧 支出分类占比</div>
      <PieChart v-if="pieData.length > 0" :data="pieData" :colors="CATEGORIES" />
      <div v-else class="empty-state">
        <div class="empty-icon">📊</div>
        <div>暂无支出数据</div>
      </div>
    </div>

    <div class="card">
      <div class="card-title">📋 各分类预算使用情况</div>
      <div class="list-grid">
        <div 
          v-for="item in budgetStore.categorySpendingSummary" 
          :key="item.key"
          class="category-budget-item"
          :class="{ 'over-budget': item.remaining < 0 }"
        >
          <div class="flex items-center justify-between mb-2">
            <span class="category-badge">
              <span>{{ CATEGORIES[item.key]?.icon }}</span>
              <span>{{ CATEGORIES[item.key]?.name }}</span>
            </span>
            <span class="text-sm font-semibold" :class="item.remaining < 0 ? 'over-budget' : 'success'">
              剩余 ¥{{ item.remaining.toLocaleString() }}
            </span>
          </div>
          <div class="flex justify-between items-center mb-1">
            <span class="text-sm text-secondary">¥{{ item.spent.toLocaleString() }} / ¥{{ item.budget.toLocaleString() }}</span>
            <span class="text-sm">{{ ((item.spent / (item.budget || 1)) * 100).toFixed(0) }}%</span>
          </div>
          <div class="progress-bar">
            <div 
              class="progress-fill" 
              :class="item.spent > item.budget ? 'danger' : item.spent > item.budget * 0.8 ? 'warning' : 'success'"
              :style="{ width: Math.min((item.spent / (item.budget || 1)) * 100, 100) + '%' }"
            ></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useBudgetStore } from '../stores/budget'
import { CATEGORIES } from '../types'
import PieChart from '../components/PieChart.vue'

const budgetStore = useBudgetStore()

const pieData = computed(() => {
  return budgetStore.getCategoryExpenses().map(item => ({
    name: CATEGORIES[item.category]?.name || item.category,
    value: item.amount
  }))
})

const usageRateClass = computed(() => {
  const rate = budgetStore.budgetUsageRate
  if (rate >= 100) return 'over-budget'
  if (rate >= 80) return 'warning'
  return 'success'
})

const usageProgressClass = computed(() => {
  const rate = budgetStore.budgetUsageRate
  if (rate >= 100) return 'danger'
  if (rate >= 80) return 'warning'
  return 'success'
})
</script>

<style scoped>
.category-budget-item {
  padding: 12px;
  background: var(--bg-primary);
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-color);
  transition: var(--transition);
}

.category-budget-item.over-budget {
  border-color: var(--danger-color);
  background: rgba(231, 76, 60, 0.05);
}
</style>
