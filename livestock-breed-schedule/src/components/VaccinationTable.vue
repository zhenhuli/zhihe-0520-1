<template>
  <n-card title="疫病防疫节点" :bordered="false">
    <template v-if="cycleData">
      <n-alert v-if="upcomingVacs.length > 0" type="warning" style="margin-bottom: 16px">
        <template #title>即将到来的防疫提醒</template>
        <n-space vertical>
          <div v-for="vac in upcomingVacs" :key="vac.day">
            <n-tag type="error">{{ vac.date }}</n-tag>
            <span style="margin-left: 8px">{{ vac.name }}</span>
          </div>
        </n-space>
      </n-alert>
      
      <n-data-table
        :columns="vacColumns"
        :data="cycleData.vaccinations"
        :bordered="false"
      />
    </template>
    <n-empty v-else description="请先录入种苗信息" />
  </n-card>
</template>

<script setup>
import { computed, h } from 'vue'
import { getUpcomingVaccinations } from '../utils/calculator'

const props = defineProps({
  cycleData: {
    type: Object,
    default: null
  }
})

const upcomingVacs = computed(() => {
  if (!props.cycleData) return []
  return getUpcomingVaccinations(props.cycleData, 30)
})

const vacColumns = [
  { 
    title: '养殖日龄', 
    key: 'day',
    render: (row) => h('n-tag', { size: 'small' }, { default: () => `第 ${row.day} 天` })
  },
  { title: '防疫日期', key: 'date' },
  { 
    title: '疫苗名称', 
    key: 'name',
    render: (row) => h('n-text', { strong: true }, { default: () => row.name })
  }
]
</script>
