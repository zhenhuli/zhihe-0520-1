<template>
  <n-card title="全周期养殖计划表" :bordered="false">
    <template v-if="cycleData">
      <n-space vertical size="large">
        <n-space>
          <n-button @click="exportCSV" type="primary">导出CSV</n-button>
          <n-button @click="printTable">打印表格</n-button>
          <n-tag type="info">共 {{ dailyPlans.length }} 天</n-tag>
        </n-space>

        <n-data-table
          :columns="tableColumns"
          :data="pagedData"
          :bordered="false"
          :pagination="pagination"
          :row-props="rowProps"
          scroll-x
        />
      </n-space>
    </template>
    <n-empty v-else description="请先录入种苗信息" />
  </n-card>
</template>

<script setup>
import { ref, computed, h } from 'vue'
import { NTag, NTooltip } from 'naive-ui'
import { generateDailyPlan } from '../utils/calculator'

const props = defineProps({
  cycleData: {
    type: Object,
    default: null
  }
})

const pagination = ref({
  pageSize: 30,
  itemCount: 0,
  showSizePicker: true,
  pageSizes: [15, 30, 50, 100]
})

const dailyPlans = computed(() => {
  if (!props.cycleData) return []
  const plans = generateDailyPlan(props.cycleData)
  pagination.value.itemCount = plans.length
  return plans
})

const pagedData = computed(() => {
  const { page, pageSize } = pagination.value
  const start = (page - 1) * pageSize
  const end = start + pageSize
  return dailyPlans.value.slice(start, end)
})

const tableColumns = [
  { 
    title: '养殖日龄', 
    key: 'day', 
    width: 100,
    render: (row) => h(NTooltip, { trigger: 'hover' }, {
      default: () => row.date,
      trigger: () => h('span', { style: { cursor: 'pointer' } }, `第 ${row.day} 天`)
    })
  },
  { title: '日期', key: 'date', width: 120 },
  { 
    title: '生长阶段', 
    key: 'stageName', 
    width: 100,
    render: (row) => {
      const stageColors = {
        '哺乳期': 'success',
        '保育期': 'info',
        '育成期': 'warning',
        '育肥期': 'error',
        '育雏期': 'success',
        '生长期': 'info',
        '犊牛期': 'success'
      }
      return h(NTag, { type: stageColors[row.stageName] || 'default', size: 'small' }, {
        default: () => row.stageName
      })
    }
  },
  { title: '每日喂食次数', key: 'feedingFrequency', width: 120 },
  { title: '每只日耗料(kg)', key: 'feedPerAnimal', width: 140 },
  { title: '当日总耗料(kg)', key: 'totalFeed', width: 140 },
  { 
    title: '防疫事项', 
    key: 'vaccination',
    render: (row) => row.vaccination !== '-' 
      ? h(NTag, { type: 'error', size: 'small' }, { default: () => row.vaccination })
      : '-'
  }
]

function rowProps(row) {
  const today = new Date().toISOString().split('T')[0]
  if (row.date === today) {
    return { style: 'background-color: rgba(24, 160, 88, 0.1)' }
  }
  return {}
}

function exportCSV() {
  const headers = ['养殖日龄', '日期', '生长阶段', '每日喂食次数', '每只日耗料(kg)', '当日总耗料(kg)', '防疫事项']
  const rows = dailyPlans.value.map(plan => [
    plan.day,
    plan.date,
    plan.stageName,
    plan.feedingFrequency,
    plan.feedPerAnimal,
    plan.totalFeed,
    plan.vaccination
  ])
  
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n')
  
  const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `养殖计划表_${props.cycleData.typeName}_${props.cycleData.purchaseDate}.csv`
  link.click()
}

function printTable() {
  window.print()
}
</script>
