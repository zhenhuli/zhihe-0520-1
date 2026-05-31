import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { DEFAULT_BUDGET, STORAGE_KEYS, CATEGORY_KEYS } from '../types'

const getCurrentMonth = () => {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

const loadFromStorage = (key, defaultValue, checkMonth = true) => {
  try {
    const stored = localStorage.getItem(key)
    if (stored) {
      const data = JSON.parse(stored)
      if (!checkMonth) {
        return data
      }
      const storedMonth = localStorage.getItem(STORAGE_KEYS.CURRENT_MONTH)
      if (storedMonth === getCurrentMonth()) {
        return data
      }
    }
  } catch (e) {
    console.error('加载数据失败:', e)
  }
  return defaultValue
}

const saveToStorage = (key, value, updateMonth = true) => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    if (updateMonth) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_MONTH, getCurrentMonth())
    }
  } catch (e) {
    console.error('保存数据失败:', e)
  }
}

export const useBudgetStore = defineStore('budget', () => {
  const totalBudget = ref(loadFromStorage(STORAGE_KEYS.BUDGET, DEFAULT_BUDGET).total || DEFAULT_BUDGET.total)
  const categoryBudgets = ref(loadFromStorage(STORAGE_KEYS.BUDGET, DEFAULT_BUDGET).categories || DEFAULT_BUDGET.categories)
  const records = ref(loadFromStorage(STORAGE_KEYS.RECORDS, [], false))

  const saveBudget = () => {
    saveToStorage(STORAGE_KEYS.BUDGET, {
      total: totalBudget.value,
      categories: categoryBudgets.value
    })
  }

  const saveRecords = () => {
    saveToStorage(STORAGE_KEYS.RECORDS, records.value, false)
  }

  const setTotalBudget = (amount) => {
    totalBudget.value = amount
    saveBudget()
  }

  const setCategoryBudget = (category, amount) => {
    categoryBudgets.value[category] = amount
    saveBudget()
  }

  const addRecord = (record) => {
    records.value.push({
      ...record,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    })
    saveRecords()
  }

  const updateRecord = (id, updates) => {
    const index = records.value.findIndex(r => r.id === id)
    if (index !== -1) {
      records.value[index] = { ...records.value[index], ...updates }
      saveRecords()
    }
  }

  const deleteRecord = (id) => {
    records.value = records.value.filter(r => r.id !== id)
    saveRecords()
  }

  const getCategorySpent = (category) => {
    return records.value
      .filter(r => r.type === 'expense' && r.category === category)
      .reduce((sum, r) => sum + Number(r.amount), 0)
  }

  const getCategoryRemaining = (category) => {
    const budget = categoryBudgets.value[category] || 0
    const spent = getCategorySpent(category)
    return budget - spent
  }

  const isCategoryOverBudget = (category) => {
    return getCategoryRemaining(category) < 0
  }

  const totalExpense = computed(() => {
    return records.value
      .filter(r => r.type === 'expense')
      .reduce((sum, r) => sum + Number(r.amount), 0)
  })

  const totalIncome = computed(() => {
    return records.value
      .filter(r => r.type === 'income')
      .reduce((sum, r) => sum + Number(r.amount), 0)
  })

  const remainingBudget = computed(() => {
    return totalBudget.value - totalExpense.value
  })

  const budgetUsageRate = computed(() => {
    if (totalBudget.value === 0) return 0
    return (totalExpense.value / totalBudget.value) * 100
  })

  const monthlyBalance = computed(() => {
    return totalIncome.value - totalExpense.value
  })

  const savingsRate = computed(() => {
    if (totalIncome.value === 0) return 0
    return (monthlyBalance.value / totalIncome.value) * 100
  })

  const getExpensesByDateRange = (startDate, endDate) => {
    return records.value.filter(r => {
      if (r.type !== 'expense') return false
      const date = new Date(r.date)
      return date >= new Date(startDate) && date <= new Date(endDate)
    }).reduce((sum, r) => sum + Number(r.amount), 0)
  }

  const todayExpense = computed(() => {
    const today = new Date().toISOString().split('T')[0]
    return getExpensesByDateRange(today, today)
  })

  const weekExpense = computed(() => {
    const now = new Date()
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - now.getDay())
    return getExpensesByDateRange(weekStart.toISOString().split('T')[0], now.toISOString().split('T')[0])
  })

  const monthExpense = computed(() => totalExpense.value)

  const categorySpendingSummary = computed(() => {
    return CATEGORY_KEYS.map(key => ({
      key,
      name: key,
      spent: getCategorySpent(key),
      budget: categoryBudgets.value[key] || 0,
      remaining: getCategoryRemaining(key)
    }))
  })

  const resetMonthData = () => {
    records.value = []
    saveRecords()
  }

  const resetAllBudget = () => {
    totalBudget.value = DEFAULT_BUDGET.total
    categoryBudgets.value = { ...DEFAULT_BUDGET.categories }
    saveBudget()
  }

  const getExpensesByDay = () => {
    const dailyData = {}
    records.value
      .filter(r => r.type === 'expense')
      .forEach(r => {
        const date = r.date
        if (!dailyData[date]) dailyData[date] = 0
        dailyData[date] += Number(r.amount)
      })
    return Object.entries(dailyData)
      .sort((a, b) => new Date(a[0]) - new Date(b[0]))
      .map(([date, amount]) => ({ date, amount }))
  }

  const getCategoryExpenses = () => {
    return CATEGORY_KEYS.map(key => ({
      category: key,
      amount: getCategorySpent(key)
    })).filter(c => c.amount > 0)
  }

  const getExpensesByMonth = (year) => {
    const monthlyData = {}
    records.value
      .filter(r => r.type === 'expense')
      .forEach(r => {
        const date = new Date(r.date)
        const recordYear = date.getFullYear()
        if (recordYear === year) {
          const month = date.getMonth()
          if (!monthlyData[month]) monthlyData[month] = 0
          monthlyData[month] += Number(r.amount)
        }
      })
    return Array.from({ length: 12 }, (_, i) => ({
      month: i,
      amount: monthlyData[i] || 0
    }))
  }

  const getFilteredRecords = (year, month = null) => {
    return records.value.filter(r => {
      const date = new Date(r.date)
      if (date.getFullYear() !== year) return false
      if (month !== null && date.getMonth() !== month) return false
      return true
    })
  }

  const getExpensesByDayFiltered = (year, month) => {
    const dailyData = {}
    records.value
      .filter(r => {
        if (r.type !== 'expense') return false
        const date = new Date(r.date)
        return date.getFullYear() === year && date.getMonth() === month
      })
      .forEach(r => {
        const date = r.date
        if (!dailyData[date]) dailyData[date] = 0
        dailyData[date] += Number(r.amount)
      })
    return Object.entries(dailyData)
      .sort((a, b) => new Date(a[0]) - new Date(b[0]))
      .map(([date, amount]) => ({ date, amount }))
  }

  const getCategoryExpensesFiltered = (year, month = null) => {
    const categoryTotals = {}
    CATEGORY_KEYS.forEach(key => {
      categoryTotals[key] = 0
    })
    
    records.value
      .filter(r => {
        if (r.type !== 'expense') return false
        const date = new Date(r.date)
        if (date.getFullYear() !== year) return false
        if (month !== null && date.getMonth() !== month) return false
        return true
      })
      .forEach(r => {
        categoryTotals[r.category] += Number(r.amount)
      })
    
    return CATEGORY_KEYS.map(key => ({
      category: key,
      amount: categoryTotals[key]
    })).filter(c => c.amount > 0)
  }

  const getTotalIncomeFiltered = (year, month = null) => {
    return records.value
      .filter(r => {
        if (r.type !== 'income') return false
        const date = new Date(r.date)
        if (date.getFullYear() !== year) return false
        if (month !== null && date.getMonth() !== month) return false
        return true
      })
      .reduce((sum, r) => sum + Number(r.amount), 0)
  }

  const getTotalExpenseFiltered = (year, month = null) => {
    return records.value
      .filter(r => {
        if (r.type !== 'expense') return false
        const date = new Date(r.date)
        if (date.getFullYear() !== year) return false
        if (month !== null && date.getMonth() !== month) return false
        return true
      })
      .reduce((sum, r) => sum + Number(r.amount), 0)
  }

  return {
    totalBudget,
    categoryBudgets,
    records,
    totalExpense,
    totalIncome,
    remainingBudget,
    budgetUsageRate,
    monthlyBalance,
    savingsRate,
    todayExpense,
    weekExpense,
    monthExpense,
    categorySpendingSummary,
    setTotalBudget,
    setCategoryBudget,
    addRecord,
    updateRecord,
    deleteRecord,
    getCategorySpent,
    getCategoryRemaining,
    isCategoryOverBudget,
    resetMonthData,
    resetAllBudget,
    getExpensesByDay,
    getCategoryExpenses,
    getExpensesByMonth,
    getFilteredRecords,
    getExpensesByDayFiltered,
    getCategoryExpensesFiltered,
    getTotalIncomeFiltered,
    getTotalExpenseFiltered
  }
})
