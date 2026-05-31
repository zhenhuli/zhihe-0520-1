<template>
  <div class="records-page">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-xl font-bold">收支记录</h2>
      <button class="btn btn-primary" @click="openAddModal">
        <span>+</span> 新增记录
      </button>
    </div>

    <div class="card">
      <div class="card-header">
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
          <button v-if="!isCurrentPeriod" class="btn btn-sm btn-primary" @click="goToCurrentPeriod">
            {{ viewMode === 'month' ? '本月' : '今年' }}
          </button>
        </div>
      </div>
    </div>

    <div class="tabs">
      <div 
        class="tab-item" 
        :class="{ active: activeTab === 'all' }"
        @click="activeTab = 'all'"
      >
        全部
      </div>
      <div 
        class="tab-item" 
        :class="{ active: activeTab === 'expense' }"
        @click="activeTab = 'expense'"
      >
        支出
      </div>
      <div 
        class="tab-item" 
        :class="{ active: activeTab === 'income' }"
        @click="activeTab = 'income'"
      >
        收入
      </div>
    </div>

    <div class="filter-bar">
      <select v-model="filterCategory">
        <option value="">全部分类</option>
        <option v-for="(config, key) in CATEGORIES" :key="key" :value="key">
          {{ config.icon }} {{ config.name }}
        </option>
      </select>
      <button class="btn btn-secondary btn-sm" @click="resetFilters">重置</button>
    </div>

    <div class="card" style="padding: 0;">
      <div v-if="filteredRecords.length === 0" class="empty-state">
        <div class="empty-icon">📝</div>
        <div>暂无记录</div>
        <div class="text-sm text-secondary mt-2">点击右上角新增按钮添加记录</div>
      </div>
      <div v-else>
        <template v-if="viewMode === 'month'">
          <div 
            v-for="record in filteredRecords" 
            :key="record.id"
            class="record-item"
          >
            <div class="record-info">
              <span class="text-xl">{{ getCategoryIcon(record) }}</span>
              <div>
                <div class="font-semibold">
                  {{ getCategoryName(record) }}
                  <span 
                    class="tag ml-2" 
                    :class="record.type === 'income' ? 'tag-income' : 'tag-expense'"
                  >
                    {{ record.type === 'income' ? '收入' : '支出' }}
                  </span>
                </div>
                <div class="text-sm text-secondary">
                  {{ record.date }}
                  <span v-if="record.note"> · {{ record.note }}</span>
                </div>
              </div>
            </div>
            <div class="flex items-center gap-4">
              <span 
                class="font-bold text-lg"
                :class="record.type === 'income' ? 'success' : 'over-budget'"
              >
                {{ record.type === 'income' ? '+' : '-' }}¥{{ Number(record.amount).toLocaleString() }}
              </span>
              <div class="record-actions">
                <button class="btn btn-secondary btn-sm" @click="openEditModal(record)">编辑</button>
                <button class="btn btn-danger btn-sm" @click="confirmDelete(record)">删除</button>
              </div>
            </div>
          </div>
        </template>

        <template v-else>
          <div v-for="(group, monthKey) in groupedRecords" :key="monthKey" class="month-group">
            <div class="month-header">
              <span class="font-semibold">{{ monthKey }}</span>
              <div class="month-stats">
                <span class="text-sm success">+¥{{ group.income.toLocaleString() }}</span>
                <span class="text-sm over-budget ml-3">-¥{{ group.expense.toLocaleString() }}</span>
              </div>
            </div>
            <div 
              v-for="record in group.records" 
              :key="record.id"
              class="record-item"
            >
              <div class="record-info">
                <span class="text-xl">{{ getCategoryIcon(record) }}</span>
                <div>
                  <div class="font-semibold">
                    {{ getCategoryName(record) }}
                    <span 
                      class="tag ml-2" 
                      :class="record.type === 'income' ? 'tag-income' : 'tag-expense'"
                    >
                      {{ record.type === 'income' ? '收入' : '支出' }}
                    </span>
                  </div>
                  <div class="text-sm text-secondary">
                    {{ record.date }}
                    <span v-if="record.note"> · {{ record.note }}</span>
                  </div>
                </div>
              </div>
              <div class="flex items-center gap-4">
                <span 
                  class="font-bold text-lg"
                  :class="record.type === 'income' ? 'success' : 'over-budget'"
                >
                  {{ record.type === 'income' ? '+' : '-' }}¥{{ Number(record.amount).toLocaleString() }}
                </span>
                <div class="record-actions">
                  <button class="btn btn-secondary btn-sm" @click="openEditModal(record)">编辑</button>
                  <button class="btn btn-danger btn-sm" @click="confirmDelete(record)">删除</button>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>

    <div v-if="filteredRecords.length > 0" class="card">
      <div class="card-title">📊 {{ viewMode === 'month' ? '本月' : '本年' }}筛选统计</div>
      <div class="flex justify-between items-center mb-2">
        <span>收入总计</span>
        <span class="font-semibold success">+¥{{ filteredIncome.toLocaleString() }}</span>
      </div>
      <div class="flex justify-between items-center mb-2">
        <span>支出总计</span>
        <span class="font-semibold over-budget">-¥{{ filteredExpense.toLocaleString() }}</span>
      </div>
      <div class="flex justify-between items-center">
        <span>净收入</span>
        <span 
          class="font-semibold text-lg"
          :class="filteredNet >= 0 ? 'success' : 'over-budget'"
        >
          {{ filteredNet >= 0 ? '+' : '' }}¥{{ filteredNet.toLocaleString() }}
        </span>
      </div>
    </div>

    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <div class="modal-header">
          <span>{{ editingRecord ? '编辑记录' : '新增记录' }}</span>
          <button class="modal-close" @click="closeModal">&times;</button>
        </div>

        <div class="tabs mb-4">
          <div 
            class="tab-item" 
            :class="{ active: formData.type === 'expense' }"
            @click="formData.type = 'expense'"
          >
            支出
          </div>
          <div 
            class="tab-item" 
            :class="{ active: formData.type === 'income' }"
            @click="formData.type = 'income'"
          >
            收入
          </div>
        </div>

        <div class="input-group">
          <label class="input-label">分类</label>
          <select class="input-field" v-model="formData.category">
            <option value="">请选择分类</option>
            <option v-for="(config, key) in currentCategories" :key="key" :value="key">
              {{ config.icon }} {{ config.name }}
            </option>
          </select>
        </div>

        <div class="input-group">
          <label class="input-label">金额</label>
          <input 
            type="number" 
            class="input-field"
            v-model.number="formData.amount"
            placeholder="请输入金额"
            min="0"
            step="0.01"
          />
        </div>

        <div class="input-group">
          <label class="input-label">日期</label>
          <input 
            type="date" 
            class="input-field"
            v-model="formData.date"
          />
        </div>

        <div class="input-group">
          <label class="input-label">备注</label>
          <input 
            type="text" 
            class="input-field"
            v-model="formData.note"
            placeholder="选填"
          />
        </div>

        <div class="modal-actions">
          <button class="btn btn-secondary" @click="closeModal">取消</button>
          <button class="btn btn-primary" @click="saveRecord">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { useBudgetStore } from '../stores/budget'
import { CATEGORIES, getCategoryByType, getDefaultCategoryByType } from '../types'

const budgetStore = useBudgetStore()

const activeTab = ref('all')
const filterCategory = ref('')

const viewMode = ref('month')
const selectedYear = ref(new Date().getFullYear())
const selectedMonth = ref(new Date().getMonth())

const MONTH_NAMES = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']

const showModal = ref(false)
const editingRecord = ref(null)

const defaultFormData = () => ({
  type: 'expense',
  category: getDefaultCategoryByType('expense'),
  amount: '',
  date: new Date().toISOString().split('T')[0],
  note: ''
})

const formData = reactive(defaultFormData())

const currentCategories = computed(() => getCategoryByType(formData.type))

watch(() => formData.type, (newType) => {
  if (!editingRecord.value) {
    formData.category = getDefaultCategoryByType(newType)
  }
})

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

const filteredRecords = computed(() => {
  let records = [...budgetStore.records]
  
  if (viewMode.value === 'month') {
    records = records.filter(r => {
      const date = new Date(r.date)
      return date.getFullYear() === selectedYear.value && date.getMonth() === selectedMonth.value
    })
  } else {
    records = records.filter(r => {
      const date = new Date(r.date)
      return date.getFullYear() === selectedYear.value
    })
  }
  
  if (activeTab.value !== 'all') {
    records = records.filter(r => r.type === activeTab.value)
  }
  
  if (filterCategory.value) {
    records = records.filter(r => r.category === filterCategory.value)
  }
  
  return records.sort((a, b) => new Date(b.date) - new Date(a.date))
})

const groupedRecords = computed(() => {
  const groups = {}
  const records = filteredRecords.value
  
  records.forEach(record => {
    const date = new Date(record.date)
    const monthKey = `${date.getMonth() + 1}月`
    
    if (!groups[monthKey]) {
      groups[monthKey] = {
        month: date.getMonth(),
        records: [],
        income: 0,
        expense: 0
      }
    }
    
    groups[monthKey].records.push(record)
    
    if (record.type === 'income') {
      groups[monthKey].income += Number(record.amount)
    } else {
      groups[monthKey].expense += Number(record.amount)
    }
  })
  
  const sortedKeys = Object.keys(groups).sort((a, b) => {
    return groups[b].month - groups[a].month
  })
  
  const result = {}
  sortedKeys.forEach(key => {
    result[key] = groups[key]
  })
  
  return result
})

const filteredIncome = computed(() => {
  return filteredRecords.value
    .filter(r => r.type === 'income')
    .reduce((sum, r) => sum + Number(r.amount), 0)
})

const filteredExpense = computed(() => {
  return filteredRecords.value
    .filter(r => r.type === 'expense')
    .reduce((sum, r) => sum + Number(r.amount), 0)
})

const filteredNet = computed(() => filteredIncome.value - filteredExpense.value)

const getCategoryIcon = (record) => {
  return CATEGORIES[record.category]?.icon || '📦'
}

const getCategoryName = (record) => {
  return CATEGORIES[record.category]?.name || '其他'
}

const resetFilters = () => {
  filterCategory.value = ''
  activeTab.value = 'all'
}

const openAddModal = () => {
  editingRecord.value = null
  Object.assign(formData, defaultFormData())
  showModal.value = true
}

const openEditModal = (record) => {
  editingRecord.value = record
  Object.assign(formData, {
    type: record.type,
    category: record.category,
    amount: record.amount,
    date: record.date,
    note: record.note || ''
  })
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingRecord.value = null
}

const saveRecord = () => {
  if (!formData.category || !formData.amount || formData.amount <= 0) {
    alert('请填写完整信息')
    return
  }
  
  if (editingRecord.value) {
    budgetStore.updateRecord(editingRecord.value.id, { ...formData })
  } else {
    budgetStore.addRecord({ ...formData })
  }
  
  closeModal()
}

const confirmDelete = (record) => {
  if (confirm(`确定要删除这条记录吗？\n${getCategoryName(record)} - ¥${record.amount}`)) {
    budgetStore.deleteRecord(record.id)
  }
}
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
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

.month-group {
  border-bottom: 1px solid var(--border-color);
}

.month-group:last-child {
  border-bottom: none;
}

.month-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: var(--bg-primary);
  border-bottom: 1px solid var(--border-color);
}

.month-stats {
  display: flex;
  align-items: center;
}

.record-item {
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-color);
}

.record-item:last-child {
  border-bottom: none;
}
</style>
