<template>
  <n-card title="饲料消耗量核算" :bordered="false">
    <template v-if="cycleData">
      <n-space vertical size="large">
        <n-grid cols="1 s:2 m:4" :x-gap="12" :y-gap="12">
          <n-grid-item>
            <n-statistic label="总耗料量" :value="cycleData.totalFeed" suffix="kg" />
          </n-grid-item>
          <n-grid-item>
            <n-statistic label="每只平均耗料" :value="avgFeedPerAnimal" suffix="kg" />
          </n-grid-item>
          <n-grid-item>
            <n-statistic label="日均耗料" :value="dailyFeedAvg" suffix="kg" />
          </n-grid-item>
          <n-grid-item>
            <n-statistic label="预计饲料成本" :value="totalCost" suffix="元" />
          </n-grid-item>
        </n-grid>

        <n-space>
          <n-text>饲料单价：</n-text>
          <n-input-number 
            v-model:value="feedPrice" 
            :min="0" 
            :step="0.1"
            placeholder="元/kg"
            style="width: 150px"
          />
          <n-text type="info">元/kg</n-text>
        </n-space>

        <n-divider />

        <n-text strong>各阶段饲料消耗明细：</n-text>
        <n-data-table
          :columns="feedColumns"
          :data="cycleData.stages"
          :bordered="false"
          :summary="createSummary"
        />

        <n-divider />

        <n-text strong>饲料消耗趋势：</n-text>
        <div class="feed-chart">
          <div 
            v-for="stage in cycleData.stages" 
            :key="stage.stageIndex"
            class="chart-bar"
            :style="{ height: `${(stage.days / cycleData.totalCycleDays) * 100}%` }"
          >
            <div class="bar-inner" :style="{ width: `${(parseFloat(stage.totalFeed) / parseFloat(cycleData.totalFeed)) * 100}%` }">
              <span class="bar-label">{{ stage.name }}</span>
              <span class="bar-value">{{ stage.totalFeed }} kg</span>
            </div>
          </div>
        </div>
      </n-space>
    </template>
    <n-empty v-else description="请先录入种苗信息" />
  </n-card>
</template>

<script setup>
import { ref, computed, h } from 'vue'
import { feedTypes } from '../data/livestockData'

const props = defineProps({
  cycleData: {
    type: Object,
    default: null
  }
})

const feedPrice = ref(3.5)

const avgFeedPerAnimal = computed(() => {
  if (!props.cycleData) return '0'
  return (parseFloat(props.cycleData.totalFeed) / props.cycleData.quantity).toFixed(2)
})

const dailyFeedAvg = computed(() => {
  if (!props.cycleData) return '0'
  return (parseFloat(props.cycleData.totalFeed) / props.cycleData.totalCycleDays).toFixed(2)
})

const totalCost = computed(() => {
  if (!props.cycleData) return '0'
  return (parseFloat(props.cycleData.totalFeed) * feedPrice.value).toFixed(2)
})

const feedColumns = [
  { title: '阶段', key: 'name' },
  { title: '天数', key: 'days' },
  { title: '每只日耗料(kg)', key: 'feedPerDay' },
  { title: '每日总耗料(kg)', key: 'dailyTotal', render: (row) => (row.feedPerDay * props.cycleData.quantity).toFixed(2) },
  { title: '阶段耗料(kg)', key: 'totalFeed' },
  { 
    title: '占比', 
    key: 'percentage',
    render: (row) => {
      const pct = (parseFloat(row.totalFeed) / parseFloat(props.cycleData.totalFeed) * 100).toFixed(1)
      return h('n-tag', { size: 'small' }, { default: () => `${pct}%` })
    }
  }
]

function createSummary(pageData) {
  return [
    {
      name: '合计',
      selfColspan: 4,
      value: h('span', { style: { fontWeight: 'bold' } }, pageData.reduce((s, r) => s + parseFloat(r.totalFeed), 0).toFixed(2) + ' kg')
    }
  ]
}
</script>

<style scoped>
.feed-chart {
  display: flex;
  align-items: flex-end;
  height: 200px;
  gap: 8px;
  padding: 16px 0;
  border-bottom: 2px solid #e0e0e0;
}

.chart-bar {
  flex: 1;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  min-height: 30px;
}

.bar-inner {
  background: linear-gradient(to top, #18a058, #63e2b7);
  border-radius: 4px 4px 0 0;
  width: 100%;
  min-height: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  padding: 8px 4px;
  color: white;
  font-size: 12px;
}

.bar-label {
  font-weight: bold;
  margin-bottom: 4px;
}

.bar-value {
  font-size: 11px;
  opacity: 0.9;
}
</style>
