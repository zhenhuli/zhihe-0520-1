<template>
  <div class="statistics-page">
    <div class="card">
      <div class="card-header">
        <div class="card-title">{{ viewMode === 'month' ? '💹 本月财务概览' : '💹 本年财务概览' }}</div>
        <div class="view-controls">
          <button 
            class="btn btn-sm" 
            :class="{ active: viewMode === 'month' }"
            @click="viewMode = 'month'"
          >
            月视图
          </button>
          <button 
            class="btn btn-sm" 
            :class="{ active: viewMode === 'year' }"
            @click="viewMode = 'year'"
          >
            年视图
          </button>
        </div>
      </div>
      
      <div class="date-selector">
        <div class="date-picker-group">
          <select 
            v-model="selectedYear" 
            class="date-select"
          >
            <option v-for="year in availableYears" :key="year" :value="year">
              {{ year }}年
            </option>
          </select>
          <select 
            v-if="viewMode === 'month'"
            v-model="selectedMonth" 
            class="date-select"
          >
            <option v-for="month in 12" :key="month - 1" :value="month - 1">
              {{ month }}月
            </option>
          </select>
        </div>
        <button v-if="!isCurrentPeriod" class="btn btn-sm btn-primary" @click="goToCurrentPeriod">
          {{ viewMode === 'month' ? '本月' : '今年' }}
        </button>
      </div>

      <div class="stat-grid">
        <div class="stat-card">
          <div class="stat-value success">+¥{{ totalIncome.toLocaleString() }}</div>
          <div class="stat-label">总收入</div>
        </div>
        <div class="stat-card">
          <div class="stat-value over-budget">-¥{{ totalExpense.toLocaleString() }}</div>
          <div class="stat-label">总支出</div>
        </div>
        <div class="stat-card">
          <div 
            class="stat-value"
            :class="balance >= 0 ? 'success' : 'over-budget'"
          >
            {{ balance >= 0 ? '+' : '' }}¥{{ balance.toLocaleString() }}
          </div>
          <div class="stat-label">{{ viewMode === 'month' ? '月结余' : '年结余' }}</div>
        </div>
        <div class="stat-card">
          <div 
            class="stat-value"
            :class="savingsRate >= 20 ? 'success' : savingsRate >= 0 ? 'warning' : 'over-budget'"
          >
            {{ savingsRate.toFixed(1) }}%
          </div>
          <div class="stat-label">储蓄率</div>
        </div>
      </div>
      
      <div class="mt-4 p-4" style="background: var(--bg-primary); border-radius: var(--radius-sm);">
        <div class="flex items-center gap-2 mb-2">
          <span>💡</span>
          <span class="font-semibold">储蓄率建议</span>
        </div>
        <p class="text-sm text-secondary">
          <span v-if="savingsRate >= 30">
            太棒了！你的储蓄率达到 {{ savingsRate.toFixed(1) }}%，继续保持！
          </span>
          <span v-else-if="savingsRate >= 20">
            储蓄率良好（{{ savingsRate.toFixed(1) }}%），建议争取达到 30% 以上。
          </span>
          <span v-else-if="savingsRate >= 10">
            储蓄率为 {{ savingsRate.toFixed(1) }}%，建议适当控制支出，争取达到 20%。
          </span>
          <span v-else-if="savingsRate >= 0">
            储蓄率偏低（{{ savingsRate.toFixed(1) }}%），需要注意控制开支。
          </span>
          <span v-else>
            ⚠️ {{ viewMode === 'month' ? '本月' : '本年' }}已入不敷出，储蓄率为 {{ savingsRate.toFixed(1) }}%，请尽快调整消费计划。
          </span>
        </p>
      </div>
    </div>

    <div class="card">
      <div class="card-title">{{ viewMode === 'month' ? '📈 每日消费走势' : '📈 每月消费走势' }}</div>
      <LineChart 
        v-if="chartData.length > 0"
        :x-data="chartData.map(d => d.label)" 
        :y-data="chartData.map(d => d.amount)"
        color="#3498db"
      />
      <div v-else class="empty-state">
        <div class="empty-icon">📈</div>
        <div>暂无消费数据</div>
      </div>
    </div>

    <div class="card">
      <div class="card-title">📊 各分类开销对比</div>
      <BarChart 
        v-if="categoryExpenses.length > 0"
        :categories="categoryExpenses.map(c => CATEGORIES[c.category]?.name || c.category)"
        :values="categoryExpenses.map(c => c.amount)"
        :colors="categoryExpenses.map(c => CATEGORIES[c.category]?.color || '#999')"
      />
      <div v-else class="empty-state">
        <div class="empty-icon">📊</div>
        <div>暂无支出数据</div>
      </div>
    </div>

    <div class="card">
      <div class="card-title">🏆 消费排行</div>
      <div v-if="sortedCategoryExpenses.length === 0" class="empty-state">
        <div class="empty-icon">🏆</div>
        <div>暂无消费数据</div>
      </div>
      <div v-else>
        <div 
          v-for="(item, index) in sortedCategoryExpenses" 
          :key="item.category"
          class="rank-item"
        >
          <div class="flex items-center gap-3">
            <span class="rank-badge" :class="'rank-' + (index + 1)">
              {{ index + 1 }}
            </span>
            <span class="text-xl">{{ CATEGORIES[item.category]?.icon }}</span>
            <span class="font-semibold">{{ CATEGORIES[item.category]?.name }}</span>
          </div>
          <div class="text-right">
            <div class="font-bold">¥{{ item.amount.toLocaleString() }}</div>
            <div class="text-sm text-secondary">
              占比 {{ getCategoryPercent(item.amount) }}%
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-title">📋 收支明细统计</div>
      <div class="flex justify-between items-center mb-2">
        <span>记录总数</span>
        <span class="font-semibold">{{ filteredRecords.length }} 条</span>
      </div>
      <div class="flex justify-between items-center mb-2">
        <span>收入记录</span>
        <span class="font-semibold success">{{ incomeCount }} 条</span>
      </div>
      <div class="flex justify-between items-center mb-2">
        <span>支出记录</span>
        <span class="font-semibold over-budget">{{ expenseCount }} 条</span>
      </div>
      <div class="flex justify-between items-center mb-2">
        <span>{{ viewMode === 'month' ? '日均消费' : '月均消费' }}</span>
        <span class="font-semibold">¥{{ averageExpense.toLocaleString() }}</span>
      </div>
      <div class="flex justify-between items-center">
        <span>单笔最大支出</span>
        <span class="font-semibold over-budget">¥{{ maxExpense.toLocaleString() }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useBudgetStore } from '../stores/budget'
import { CATEGORIES } from '../types'
import LineChart from '../components/LineChart.vue'
import BarChart from '../components/BarChart.vue'

const budgetStore = useBudgetStore()

const viewMode = ref('month')
const selectedYear = ref(new Date().getFullYear())
const selectedMonth = ref(new Date().getMonth())

const MONTH_NAMES = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']

const availableYears = computed(() => {
  const now = new Date()
  const currentYear = now.getFullYear()
  const years = []
  for (let y = currentYear - 5; y <= currentYear + 5; y++) {
    years.push(y)
  }
  return years
})

const isCurrentPeriod = computed(() => {
  const now = new Date()
  if (viewMode.value === 'month') {
    return selectedYear.value === now.getFullYear() && selectedMonth.value === now.getMonth()
  }
  return selectedYear.value === now.getFullYear()
})

const goToCurrentPeriod = () => {
  const now = new Date()
  selectedYear.value = now.getFullYear()
  selectedMonth.value = now.getMonth()
}

const totalIncome = computed(() => {
  if (viewMode.value === 'month') {
    return budgetStore.getTotalIncomeFiltered(selectedYear.value, selectedMonth.value)
  }
  return budgetStore.getTotalIncomeFiltered(selectedYear.value, null)
})

const totalExpense = computed(() => {
  if (viewMode.value === 'month') {
    return budgetStore.getTotalExpenseFiltered(selectedYear.value, selectedMonth.value)
  }
  return budgetStore.getTotalExpenseFiltered(selectedYear.value, null)
})

const balance = computed(() => totalIncome.value - totalExpense.value)

const savingsRate = computed(() => {
  if (totalIncome.value === 0) return 0
  return (balance.value / totalIncome.value) * 100
})

const chartData = computed(() => {
  if (viewMode.value === 'month') {
    const dailyData = budgetStore.getExpensesByDayFiltered(selectedYear.value, selectedMonth.value)
    return dailyData.map(d => ({
      label: formatDate(d.date),
      amount: d.amount
    }))
  } else {
    const monthlyData = budgetStore.getExpensesByMonth(selectedYear.value)
    return monthlyData
      .filter(d => d.amount > 0)
      .map(d => ({
        label: MONTH_NAMES[d.month],
        amount: d.amount
      }))
  }
})

const categoryExpenses = computed(() => {
  if (viewMode.value === 'month') {
    return budgetStore.getCategoryExpensesFiltered(selectedYear.value, selectedMonth.value)
  }
  return budgetStore.getCategoryExpensesFiltered(selectedYear.value, null)
})

const sortedCategoryExpenses = computed(() => {
  return [...categoryExpenses.value].sort((a, b) => b.amount - a.amount)
})

const filteredRecords = computed(() => {
  if (viewMode.value === 'month') {
    return budgetStore.getFilteredRecords(selectedYear.value, selectedMonth.value)
  }
  return budgetStore.getFilteredRecords(selectedYear.value, null)
})

const incomeCount = computed(() => {
  return filteredRecords.value.filter(r => r.type === 'income').length
})

const expenseCount = computed(() => {
  return filteredRecords.value.filter(r => r.type === 'expense').length
})

const averageExpense = computed(() => {
  if (viewMode.value === 'month') {
    const daysInMonth = new Date(selectedYear.value, selectedMonth.value + 1, 0).getDate()
    const now = new Date()
    let days = daysInMonth
    if (selectedYear.value === now.getFullYear() && selectedMonth.value === now.getMonth()) {
      days = now.getDate()
    }
    if (days === 0) return 0
    return Math.round(totalExpense.value / days)
  } else {
    const now = new Date()
    let months = 12
    if (selectedYear.value === now.getFullYear()) {
      months = now.getMonth() + 1
    }
    if (months === 0) return 0
    return Math.round(totalExpense.value / months)
  }
})

const maxExpense = computed(() => {
  const expenses = filteredRecords.value
    .filter(r => r.type === 'expense')
    .map(r => Number(r.amount))
  return expenses.length > 0 ? Math.max(...expenses) : 0
})

const getCategoryPercent = (amount) => {
  if (totalExpense.value === 0) return 0
  return ((amount / totalExpense.value) * 100).toFixed(1)
}

const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  return `${date.getMonth() + 1}/${date.getDate()}`
}
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.card-header .card-title {
  margin-bottom: 0;
}

.view-controls {
  display: flex;
  gap: 4px;
  background: var(--bg-primary);
  padding: 2px;
  border-radius: var(--radius-sm);
}

.view-controls .btn {
  background: transparent;
  color: var(--text-secondary);
  border: none;
}

.view-controls .btn.active {
  background: var(--bg-secondary);
  color: var(--primary-color);
  box-shadow: var(--shadow);
}

.date-selector {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border-color);
}

.date-picker-group {
  display: flex;
  gap: 8px;
  align-items: center;
}

.date-select {
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 14px;
  cursor: pointer;
  transition: var(--transition);
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%237f8c8d' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 8px center;
  padding-right: 28px;
  min-width: 90px;
}

.date-select:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
}

.btn-sm {
  padding: 6px 12px;
  font-size: 12px;
}

.btn-sm.btn-primary {
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: var(--transition);
}

.btn-sm.btn-primary:hover {
  background: #2980b9;
}

.rank-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid var(--border-color);
}

.rank-item:last-child {
  border-bottom: none;
}

.rank-badge {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
  background: var(--bg-primary);
  color: var(--text-secondary);
}

.rank-1 {
  background: linear-gradient(135deg, #FFD700, #FFA500);
  color: white;
}

.rank-2 {
  background: linear-gradient(135deg, #CD7F32, #8B4513);
  color: white;
}

.rank-3 {
  background: linear-gradient(135deg, #CD7F32, #8B4513);
  color: white;
}
</style>
