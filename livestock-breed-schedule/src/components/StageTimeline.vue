<template>
  <n-card title="生长阶段划分" :bordered="false">
    <template v-if="cycleData">
      <n-steps :current="currentStepIndex" size="small" vertical>
        <n-step
          v-for="(stage, index) in cycleData.stages"
          :key="index"
          :status="getStepStatus(index)"
          :title="stage.name"
        >
          <template #description>
            <n-space vertical size="small">
              <span>{{ stage.startDate }} 至 {{ stage.endDate }} ({{ stage.days }}天)</span>
              <n-space>
                <n-tag size="small">每日喂食 {{ stage.feedingFrequency }} 次</n-tag>
                <n-tag size="small" type="info">每只日耗料 {{ stage.feedPerDay }} kg</n-tag>
                <n-tag size="small" type="warning">阶段耗料 {{ stage.totalFeed }} kg</n-tag>
              </n-space>
            </n-space>
          </template>
        </n-step>
      </n-steps>

      <n-divider />

      <n-data-table
        :columns="stageColumns"
        :data="cycleData.stages"
        :bordered="false"
        :single-line="false"
      />
    </template>
    <n-empty v-else description="请先录入种苗信息" />
  </n-card>
</template>

<script setup>
import { computed, h } from 'vue'
import { getCurrentStage } from '../utils/calculator'

const props = defineProps({
  cycleData: {
    type: Object,
    default: null
  }
})

const currentStatus = computed(() => {
  if (!props.cycleData) return { stage: null, status: 'not_started' }
  return getCurrentStage(props.cycleData)
})

const currentStepIndex = computed(() => {
  if (!currentStatus.value.stage) return 0
  return currentStatus.value.stage.stageIndex
})

function getStepStatus(index) {
  if (currentStatus.value.status === 'completed') return 'finish'
  if (currentStatus.value.status === 'not_started') return 'wait'
  if (index < currentStepIndex.value) return 'finish'
  if (index === currentStepIndex.value) return 'process'
  return 'wait'
}

const stageColumns = [
  { title: '阶段', key: 'name' },
  { title: '天数', key: 'days' },
  { title: '开始日期', key: 'startDate' },
  { title: '结束日期', key: 'endDate' },
  { title: '每日喂食次数', key: 'feedingFrequency' },
  { title: '每只日耗料(kg)', key: 'feedPerDay' },
  { 
    title: '阶段总耗料(kg)', 
    key: 'totalFeed',
    render: (row) => h('n-tag', { type: 'warning' }, { default: () => row.totalFeed })
  }
]
</script>
