<template>
  <div class="budget-config-page">
    <div class="card">
      <div class="card-title">💰 本月总预算</div>
      <div class="input-group">
        <label class="input-label">设置本月总预算金额</label>
        <div class="flex gap-2">
          <input 
            type="number" 
            class="input-field"
            v-model.number="totalBudgetInput"
            placeholder="请输入总预算金额"
            min="0"
          />
          <button class="btn btn-primary" @click="saveTotalBudget">保存</button>
        </div>
      </div>
      <div class="text-sm text-secondary">
        当前总预算: ¥{{ budgetStore.totalBudget.toLocaleString() }}
      </div>
    </div>

    <div class="card">
      <div class="card-title">⚙️ 分类预算设置</div>
      <div class="text-sm text-secondary mb-4">
        为每个消费分类设置单独的预算额度，超出时自动标红预警
      </div>
      
      <div 
        v-for="(config, key) in EXPENSE_CATEGORIES" 
        :key="key"
        class="category-config-item"
        :class="{ 'over-budget': budgetStore.isCategoryOverBudget(key) }"
      >
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center gap-2">
            <span class="text-xl">{{ config.icon }}</span>
            <span class="font-semibold">{{ config.name }}</span>
            <span 
              v-if="budgetStore.isCategoryOverBudget(key)" 
              class="tag tag-expense"
            >
              已超支
            </span>
          </div>
          <span 
            class="font-semibold"
            :class="budgetStore.getCategoryRemaining(key) < 0 ? 'over-budget' : 'success'"
          >
            剩余: ¥{{ budgetStore.getCategoryRemaining(key).toLocaleString() }}
          </span>
        </div>
        
        <div class="flex items-center gap-2 mb-2">
          <input 
            type="number" 
            class="input-field"
            v-model.number="categoryBudgets[key]"
            placeholder="预算额度"
            min="0"
            style="flex: 1"
          />
          <button 
            class="btn btn-sm btn-primary" 
            @click="saveCategoryBudget(key)"
          >
            保存
          </button>
        </div>
        
        <div class="flex justify-between items-center mb-1">
          <span class="text-sm text-secondary">
            已消费: ¥{{ budgetStore.getCategorySpent(key).toLocaleString() }} 
            / 预算: ¥{{ (budgetStore.categoryBudgets[key] || 0).toLocaleString() }}
          </span>
          <span class="text-sm">
            {{ getUsagePercent(key) }}%
          </span>
        </div>
        <div class="progress-bar">
          <div 
            class="progress-fill" 
            :class="getProgressClass(key)"
            :style="{ width: Math.min(getUsagePercent(key), 100) + '%' }"
          ></div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-title">📌 预算分配统计</div>
      <div class="flex justify-between items-center mb-2">
        <span>分类预算总和</span>
        <span class="font-semibold">¥{{ totalCategoryBudget.toLocaleString() }}</span>
      </div>
      <div class="flex justify-between items-center mb-2">
        <span>总预算</span>
        <span class="font-semibold">¥{{ budgetStore.totalBudget.toLocaleString() }}</span>
      </div>
      <div class="flex justify-between items-center">
        <span>差额</span>
        <span 
          class="font-semibold"
          :class="budgetDifference >= 0 ? 'success' : 'over-budget'"
        >
          {{ budgetDifference >= 0 ? '+' : '' }}¥{{ budgetDifference.toLocaleString() }}
        </span>
      </div>
      <div v-if="budgetDifference < 0" class="mt-4 p-4" style="background: rgba(231, 76, 60, 0.05); border-radius: var(--radius-sm); border: 1px solid var(--danger-color);">
        <p class="text-sm text-secondary">
          ⚠️ 分类预算总和已超过总预算，建议调整
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { useBudgetStore } from '../stores/budget'
import { EXPENSE_CATEGORIES } from '../types'

const budgetStore = useBudgetStore()

const totalBudgetInput = ref(budgetStore.totalBudget)

const categoryBudgets = reactive({})
for (const key of Object.keys(EXPENSE_CATEGORIES)) {
  categoryBudgets[key] = budgetStore.categoryBudgets[key] || 0
}

const totalCategoryBudget = computed(() => {
  return Object.values(categoryBudgets).reduce((sum, val) => sum + (val || 0), 0)
})

const budgetDifference = computed(() => {
  return budgetStore.totalBudget - totalCategoryBudget.value
})

const getUsagePercent = (category) => {
  const spent = budgetStore.getCategorySpent(category)
  const budget = budgetStore.categoryBudgets[category] || 0
  if (budget === 0) return 0
  return Math.round((spent / budget) * 100)
}

const getProgressClass = (category) => {
  const percent = getUsagePercent(category)
  if (percent >= 100) return 'danger'
  if (percent >= 80) return 'warning'
  return 'success'
}

const saveTotalBudget = () => {
  if (totalBudgetInput.value >= 0) {
    budgetStore.setTotalBudget(totalBudgetInput.value)
    alert('总预算已保存')
  }
}

const saveCategoryBudget = (category) => {
  const amount = categoryBudgets[category]
  if (amount >= 0) {
    budgetStore.setCategoryBudget(category, amount)
  }
}
</script>

<style scoped>
.category-config-item {
  padding: 16px;
  margin-bottom: 12px;
  background: var(--bg-primary);
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-color);
  transition: var(--transition);
}

.category-config-item:last-child {
  margin-bottom: 0;
}

.category-config-item.over-budget {
  border-color: var(--danger-color);
  background: rgba(231, 76, 60, 0.05);
}
</style>
