export const EXPENSE_CATEGORIES = {
  food: { name: '餐饮', icon: '🍔', color: '#FF6B6B' },
  transport: { name: '交通', icon: '🚗', color: '#4ECDC4' },
  shopping: { name: '购物', icon: '🛍️', color: '#FFE66D' },
  entertainment: { name: '娱乐', icon: '🎮', color: '#95E1D3' },
  housing: { name: '居住', icon: '🏠', color: '#DDA0DD' },
  other: { name: '其他', icon: '📦', color: '#A8D8EA' }
}

export const INCOME_CATEGORIES = {
  salary: { name: '工资', icon: '💰', color: '#27AE60' },
  bonus: { name: '奖金', icon: '🎁', color: '#F39C12' },
  investment: { name: '理财', icon: '📈', color: '#9B59B6' },
  parttime: { name: '兼职', icon: '💼', color: '#3498DB' },
  other_income: { name: '其他', icon: '📦', color: '#95A5A6' }
}

export const CATEGORIES = { ...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES }

export const CATEGORY_KEYS = Object.keys(CATEGORIES)

export const getCategoryByType = (type) => {
  return type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES
}

export const getDefaultCategoryByType = (type) => {
  return type === 'income' ? 'salary' : 'food'
}

export const DEFAULT_BUDGET = {
  total: 10000,
  categories: {
    food: 3000,
    transport: 1500,
    shopping: 2000,
    entertainment: 1500,
    housing: 2000
  }
}

export const STORAGE_KEYS = {
  BUDGET: 'budget_data',
  RECORDS: 'records_data',
  SETTINGS: 'settings_data',
  CURRENT_MONTH: 'current_month'
}
