<template>
  <n-card>
    <template #header>
      <div class="card-header">
        <n-icon size="20" style="margin-right: 8px; color: #13c2c2;">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
        </n-icon>
        <span>多批次测算结果</span>
        <n-tag type="success" style="margin-left: auto;">{{ grade }}</n-tag>
      </div>
    </template>

    <n-table :single-line="false" bordered size="small" class="batch-table">
      <thead>
        <tr>
          <th rowspan="2">批次</th>
          <th rowspan="2">体积<br/>(m³)</th>
          <th colspan="2">水泥 (kg)</th>
          <th colspan="2">砂子 (kg)</th>
          <th colspan="2">石子 (kg)</th>
          <th colspan="2">水 (kg)</th>
        </tr>
        <tr>
          <th>净量</th>
          <th>含损耗</th>
          <th>净量</th>
          <th>含损耗</th>
          <th>净量</th>
          <th>含损耗</th>
          <th>净量</th>
          <th>含损耗</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="batch in result.batches" :key="batch.id">
          <td style="font-weight: 500;">{{ batch.name }}</td>
          <td>{{ batch.volume.toFixed(2) }}</td>
          <td>{{ batch.materials.cement.net.toFixed(1) }}</td>
          <td class="highlight">{{ batch.materials.cement.total.toFixed(1) }}</td>
          <td>{{ batch.materials.sand.net.toFixed(1) }}</td>
          <td class="highlight">{{ batch.materials.sand.total.toFixed(1) }}</td>
          <td>{{ batch.materials.gravel.net.toFixed(1) }}</td>
          <td class="highlight">{{ batch.materials.gravel.total.toFixed(1) }}</td>
          <td>{{ batch.materials.water.net.toFixed(1) }}</td>
          <td class="highlight">{{ batch.materials.water.total.toFixed(1) }}</td>
        </tr>
      </tbody>
      <tfoot>
        <tr class="total-row">
          <td style="font-weight: 600;">累计总计</td>
          <td style="font-weight: 600;">{{ totalVolume.toFixed(2) }}</td>
          <td>{{ grandTotalNet.cement.toFixed(1) }}</td>
          <td style="font-weight: 600; color: #18a058;">{{ result.grandTotal.cement.toFixed(1) }}</td>
          <td>{{ grandTotalNet.sand.toFixed(1) }}</td>
          <td style="font-weight: 600; color: #18a058;">{{ result.grandTotal.sand.toFixed(1) }}</td>
          <td>{{ grandTotalNet.gravel.toFixed(1) }}</td>
          <td style="font-weight: 600; color: #18a058;">{{ result.grandTotal.gravel.toFixed(1) }}</td>
          <td>{{ grandTotalNet.water.toFixed(1) }}</td>
          <td style="font-weight: 600; color: #18a058;">{{ result.grandTotal.water.toFixed(1) }}</td>
        </tr>
      </tfoot>
    </n-table>

    <n-divider title-placement="left" style="margin: 24px 0;">
      <span style="font-weight: 500;">用料汇总 (含损耗)</span>
    </n-divider>

    <n-grid :cols="2" :x-gap="16" :y-gap="16">
      <n-gi>
        <n-statistic label="水泥总用量" :value="result.grandTotal.cement" :formatter="formatTon">
          <template #suffix>t</template>
        </n-statistic>
      </n-gi>
      <n-gi>
        <n-statistic label="砂子总用量" :value="result.grandTotal.sand" :formatter="formatTon">
          <template #suffix>t</template>
        </n-statistic>
      </n-gi>
      <n-gi>
        <n-statistic label="石子总用量" :value="result.grandTotal.gravel" :formatter="formatTon">
          <template #suffix>t</template>
        </n-statistic>
      </n-gi>
      <n-gi>
        <n-statistic label="水总用量" :value="result.grandTotal.water" :formatter="formatTon">
          <template #suffix>t</template>
        </n-statistic>
      </n-gi>
    </n-grid>
  </n-card>
</template>

<script setup>
import { computed } from 'vue'
import { NCard, NIcon, NTag, NTable, NDivider, NStatistic, NGrid, NGi } from 'naive-ui'

const props = defineProps({
  result: {
    type: Object,
    required: true
  },
  grade: {
    type: String,
    required: true
  }
})

const totalVolume = computed(() => {
  return props.result.batches.reduce((sum, b) => sum + b.volume, 0)
})

const grandTotalNet = computed(() => {
  return props.result.batches.reduce(
    (acc, b) => ({
      cement: acc.cement + b.materials.cement.net,
      sand: acc.sand + b.materials.sand.net,
      gravel: acc.gravel + b.materials.gravel.net,
      water: acc.water + b.materials.water.net
    }),
    { cement: 0, sand: 0, gravel: 0, water: 0 }
  )
})

function formatTon(value) {
  return (value / 1000).toFixed(2)
}
</script>

<style scoped>
.card-header {
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: 500;
}

.batch-table {
  overflow-x: auto;
}

.highlight {
  color: #2080f0;
  font-weight: 500;
}

.total-row {
  background-color: #f0f5ff;
}

:deep(th), :deep(td) {
  text-align: center;
  padding: 8px 12px;
}

:deep(th) {
  background-color: #fafafa;
}
</style>
