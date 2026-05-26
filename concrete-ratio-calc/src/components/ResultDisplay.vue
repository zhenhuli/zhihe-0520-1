<template>
  <n-card>
    <template #header>
      <div class="card-header">
        <n-icon size="20" style="margin-right: 8px; color: #18a058;">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
        </n-icon>
        <span>测算结果</span>
        <n-tag type="success" style="margin-left: auto;">
          {{ grade }} · {{ volume }} m³</n-tag>
      </div>
    </template>

    <n-alert v-if="ratioInfo" type="info" style="margin-bottom: 20px;">
      <template #header>
        标准配比：{{ ratioInfo.ratio }}
      </template>
      {{ ratioInfo.description }}
    </n-alert>

    <n-grid :cols="2" :x-gap="16" :y-gap="16" class="stat-grid">
      <n-gi>
        <n-statistic label="水泥用量" :value="result.cement.total" :formatter="formatWeight">
          <template #prefix>
            <n-icon size="18">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.3"/></svg>
            </n-icon>
          </template>
          <template #suffix>
            kg
          </template>
        </n-statistic>
      </n-gi>
      <n-gi>
        <n-statistic label="砂子用量" :value="result.sand.total" :formatter="formatWeight">
          <template #prefix>
            <n-icon size="18">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>
            </n-icon>
          </template>
          <template #suffix>
            kg
          </template>
        </n-statistic>
      </n-gi>
      <n-gi>
        <n-statistic label="石子用量" :value="result.gravel.total" :formatter="formatWeight">
          <template #prefix>
            <n-icon size="18">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
            </n-icon>
          </template>
          <template #suffix>
            kg
          </template>
        </n-statistic>
      </n-gi>
      <n-gi>
        <n-statistic label="用水量" :value="result.water.total" :formatter="formatWeight">
          <template #prefix>
            <n-icon size="18">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>
            </n-icon>
          </template>
          <template #suffix>
            kg
          </template>
        </n-statistic>
      </n-gi>
    </n-grid>

    <n-divider title-placement="left" style="margin: 24px 0;">
      <span style="font-weight: 500;">损耗明细</span>
    </n-divider>

    <n-table :single-line="false" bordered>
      <thead>
        <tr>
          <th>材料</th>
          <th>净用量</th>
          <th>损耗量</th>
          <th>损耗率</th>
          <th>总用量</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, key) in tableData" :key="key">
          <td>{{ item.name }}</td>
          <td>{{ formatWeight(item.net) }}</td>
          <td style="color: #d03050;">+ {{ formatWeight(item.wastage) }}</td>
          <td>{{ item.rate }}%</td>
          <td style="font-weight: 600; color: #18a058;">{{ formatWeight(item.total) }}</td>
        </tr>
      </tbody>
    </n-table>
  </n-card>
</template>

<script setup>
import { computed } from 'vue'
import {
  NCard, NIcon, NTag, NAlert, NStatistic, NDivider, NTable, NGrid, NGi
} from 'naive-ui'
import { mixRatios } from '../data/concreteData'
import { formatWeight as formatWeightUtil } from '../utils/calculator'

const props = defineProps({
  result: {
    type: Object,
    required: true
  },
  grade: {
    type: String,
    required: true
  },
  volume: {
    type: Number,
    required: true
  }
})

const ratioInfo = computed(() => {
  return mixRatios[props.grade]
})

const tableData = computed(() => {
  const r = props.result
  return [
    { name: '水泥', ...r.cement, rate: '2' },
    { name: '砂子', ...r.sand, rate: '5' },
    { name: '石子', ...r.gravel, rate: '5' },
    { name: '水', ...r.water, rate: '3' }
  ]
})

function formatWeight(value) {
  return value.toFixed(2)
}
</script>

<style scoped>
.card-header {
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: 500;
}

.stat-grid {
  margin-bottom: 16px;
}

:deep(th), :deep(td) {
  text-align: center;
}
</style>
