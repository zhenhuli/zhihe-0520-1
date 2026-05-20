export const livestockTypes = {
  pig: {
    name: '生猪',
    unit: '头',
    totalCycleDays: 180,
    stages: [
      { name: '哺乳期', days: 35, feedPerDay: 0.5, feedingFrequency: 5 },
      { name: '保育期', days: 40, feedPerDay: 1.2, feedingFrequency: 4 },
      { name: '育成期', days: 50, feedPerDay: 2.0, feedingFrequency: 3 },
      { name: '育肥期', days: 55, feedPerDay: 2.8, feedingFrequency: 3 }
    ],
    vaccinations: [
      { day: 1, name: '猪瘟疫苗' },
      { day: 7, name: '伪狂犬疫苗' },
      { day: 14, name: '蓝耳病疫苗' },
      { day: 21, name: '猪瘟疫苗（二免）' },
      { day: 35, name: '口蹄疫疫苗' },
      { day: 60, name: '伪狂犬疫苗（二免）' },
      { day: 90, name: '口蹄疫疫苗（二免）' }
    ],
    marketWeight: '110-130kg'
  },
  chicken: {
    name: '肉鸡',
    unit: '羽',
    totalCycleDays: 45,
    stages: [
      { name: '育雏期', days: 10, feedPerDay: 0.03, feedingFrequency: 6 },
      { name: '生长期', days: 15, feedPerDay: 0.08, feedingFrequency: 5 },
      { name: '育肥期', days: 20, feedPerDay: 0.15, feedingFrequency: 4 }
    ],
    vaccinations: [
      { day: 1, name: '马立克疫苗' },
      { day: 7, name: '新城疫+传支二联苗' },
      { day: 14, name: '法氏囊疫苗' },
      { day: 21, name: '新城疫疫苗（二免）' },
      { day: 28, name: '禽流感疫苗' }
    ],
    marketWeight: '2.0-2.5kg'
  },
  cow: {
    name: '肉牛',
    unit: '头',
    totalCycleDays: 365,
    stages: [
      { name: '犊牛期', days: 90, feedPerDay: 2.0, feedingFrequency: 4 },
      { name: '生长期', days: 180, feedPerDay: 5.0, feedingFrequency: 3 },
      { name: '育肥期', days: 95, feedPerDay: 8.0, feedingFrequency: 3 }
    ],
    vaccinations: [
      { day: 30, name: '口蹄疫疫苗' },
      { day: 90, name: '牛瘟疫苗' },
      { day: 150, name: '口蹄疫疫苗（二免）' },
      { day: 270, name: '口蹄疫疫苗（三免）' }
    ],
    marketWeight: '500-600kg'
  },
  sheep: {
    name: '肉羊',
    unit: '只',
    totalCycleDays: 180,
    stages: [
      { name: '哺乳期', days: 45, feedPerDay: 0.3, feedingFrequency: 4 },
      { name: '育成期', days: 75, feedPerDay: 0.8, feedingFrequency: 3 },
      { name: '育肥期', days: 60, feedPerDay: 1.2, feedingFrequency: 3 }
    ],
    vaccinations: [
      { day: 15, name: '羊痘疫苗' },
      { day: 30, name: '口蹄疫疫苗' },
      { day: 60, name: '羊三联四防疫苗' },
      { day: 120, name: '口蹄疫疫苗（二免）' }
    ],
    marketWeight: '40-50kg'
  },
  duck: {
    name: '肉鸭',
    unit: '羽',
    totalCycleDays: 40,
    stages: [
      { name: '育雏期', days: 7, feedPerDay: 0.025, feedingFrequency: 6 },
      { name: '生长期', days: 15, feedPerDay: 0.08, feedingFrequency: 5 },
      { name: '育肥期', days: 18, feedPerDay: 0.18, feedingFrequency: 4 }
    ],
    vaccinations: [
      { day: 1, name: '鸭肝炎疫苗' },
      { day: 7, name: '鸭瘟疫苗' },
      { day: 14, name: '禽流感疫苗' },
      { day: 25, name: '鸭瘟疫苗（二免）' }
    ],
    marketWeight: '2.5-3.0kg'
  },
  goose: {
    name: '肉鹅',
    unit: '羽',
    totalCycleDays: 70,
    stages: [
      { name: '育雏期', days: 10, feedPerDay: 0.05, feedingFrequency: 6 },
      { name: '生长期', days: 25, feedPerDay: 0.15, feedingFrequency: 5 },
      { name: '育肥期', days: 35, feedPerDay: 0.25, feedingFrequency: 4 }
    ],
    vaccinations: [
      { day: 1, name: '小鹅瘟疫苗' },
      { day: 7, name: '鹅副粘病毒疫苗' },
      { day: 20, name: '禽流感疫苗' },
      { day: 40, name: '鹅副粘病毒疫苗（二免）' }
    ],
    marketWeight: '3.5-4.5kg'
  }
}

export const feedTypes = [
  { value: 'concentrate', label: '精饲料', price: 3.5 },
  { value: 'roughage', label: '粗饲料', price: 1.2 },
  { value: 'greenfeed', label: '青绿饲料', price: 0.8 },
  { value: 'additive', label: '饲料添加剂', price: 8.0 }
]
