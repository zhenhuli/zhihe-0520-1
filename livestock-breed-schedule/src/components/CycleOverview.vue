<template>
  <n-card title="养殖周期概览" :bordered="false">
    <template v-if="cycleData">
      <n-grid cols="1 s:2 m:4" :x-gap="12" :y-gap="12">
        <n-grid-item>
          <n-statistic label="畜禽种类" :value="cycleData.typeName" />
        </n-grid-item>
        <n-grid-item>
          <n-statistic label="养殖数量" :value="cycleData.quantity" :suffix="cycleData.unit" />
        </n-grid-item>
        <n-grid-item>
          <n-statistic label="购入日期" :value="cycleData.purchaseDate" />
        </n-grid-item>
        <n-grid-item>
          <n-statistic label="预计出栏日期" :value="cycleData.marketDate" />
        </n-grid-item>
        <n-grid-item>
          <n-statistic label="养殖周期" :value="cycleData.totalCycleDays" suffix="天" />
        </n-grid-item>
        <n-grid-item>
          <n-statistic label="出栏体重" :value="cycleData.marketWeight" />
        </n-grid-item>
        <n-grid-item>
          <n-statistic label="预计总耗料" :value="cycleData.totalFeed" suffix="kg" />
        </n-grid-item>
        <n-grid-item>
          <n-statistic label="当前进度" :value="currentStatus.progress" suffix="%" />
        </n-grid-item>
      </n-grid>

      <n-divider />

      <n-space vertical size="large">
        <div>
          <n-text strong>当前阶段：</n-text>
          <n-tag v-if="currentStatus.stage" type="success">
            {{ currentStatus.stage.name }}
            <template #suffix>
              第 {{ currentStatus.stageDay }}/{{ currentStatus.stage.days }} 天
            </template>
          </n-tag>
          <n-tag v-else-if="currentStatus.status === 'not_started'" type="info">
            尚未开始
          </n-tag>
          <n-tag v-else type="default">
            已出栏
          </n-tag>
        </div>

        <div>
          <n-text strong>总进度：</n-text>
          <n-progress 
            type="line" 
            :percentage="parseFloat(currentStatus.progress)" 
            :status="progressStatus"
          />
        </div>

        <div v-if="todayFeeding.frequency > 0">
          <n-text strong>今日喂食计划：</n-text>
          <n-space>
            <n-tag type="primary">每日 {{ todayFeeding.frequency }} 次</n-tag>
            <n-tag>每只 {{ todayFeeding.feedPerAnimal }} kg</n-tag>
            <n-tag type="warning">总计 {{ todayFeeding.totalFeed }} kg</n-tag>
          </n-space>
        </div>

        <div v-if="upcomingVacs.length > 0">
          <n-text strong>即将到来的防疫：</n-text>
          <n-space>
            <n-tag v-for="vac in upcomingVacs" :key="vac.day" type="error">
              {{ vac.date }} - {{ vac.name }}
            </n-tag>
          </n-space>
        </div>
      </n-space>
    </template>
    <n-empty v-else description="请先录入种苗信息" />
  </n-card>
</template>

<script setup>
import { computed } from 'vue'
import { getCurrentStage, getUpcomingVaccinations, getTodayFeeding } from '../utils/calculator'

const props = defineProps({
  cycleData: {
    type: Object,
    default: null
  }
})

const currentStatus = computed(() => {
  if (!props.cycleData) {
    return { stage: null, progress: 0, status: 'not_started' }
  }
  return getCurrentStage(props.cycleData)
})

const progressStatus = computed(() => {
  const progress = parseFloat(currentStatus.value.progress)
  if (progress >= 100) return 'success'
  if (progress >= 70) return 'warning'
  return 'info'
})

const todayFeeding = computed(() => {
  if (!props.cycleData) return { frequency: 0, feedPerAnimal: 0, totalFeed: 0 }
  return getTodayFeeding(props.cycleData)
})

const upcomingVacs = computed(() => {
  if (!props.cycleData) return []
  return getUpcomingVaccinations(props.cycleData, 14)
})
</script>
