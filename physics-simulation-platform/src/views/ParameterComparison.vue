<template>
  <div class="comparison-container">
    <div class="page-header">
      <h1 class="page-title">参数对比</h1>
      <n-space>
        <n-button type="primary" @click="showAddModal = true" :disabled="!selectedType">
          添加对比项
        </n-button>
        <n-button @click="store.clearComparison()" v-if="store.comparisonItems.length > 0">
          清空列表
        </n-button>
        <n-select v-model:value="selectedType" placeholder="先选择实验类型" style="width: 180px">
          <n-option v-for="(info, type) in store.SIMULATION_TYPES" :key="type" :label="info.name" :value="type" />
        </n-select>
      </n-space>
    </div>

    <n-card :bordered="false" class="content-card" v-if="store.comparisonItems.length > 0">
      <div class="comparison-header">
        <span class="comparison-title">
          {{ store.getTypeName(selectedType) }} - 参数对比分析
        </span>
        <span class="comparison-count">
          共 {{ store.comparisonItems.length }} 个实验
        </span>
      </div>

      <div class="table-wrapper">
        <n-table :single-line="false" bordered>
          <thead>
            <tr>
              <th style="width: 160px; background: #fafafa; position: sticky; left: 0; z-index: 1;">参数名称</th>
              <th v-for="item in store.comparisonItems" :key="item.id" style="min-width: 180px;">
                <div class="column-header">
                  <span class="item-name">{{ item.name }}</span>
                  <n-button text size="small" type="error" @click="store.removeFromComparison(item.id)">
                    移除
                  </n-button>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(param, key) in allParams" :key="key">
              <td style="background: #fafafa; font-weight: 500; position: sticky; left: 0; z-index: 1;">
                {{ key }}
              </td>
              <td v-for="item in store.comparisonItems" :key="item.id + '_' + key"
                  :class="{ 'cell-diff': isDifferent(key) }">
                <span v-if="item.params[key] !== undefined">
                  {{ formatValue(item.params[key]) }}
                </span>
                <span v-else style="color: #ccc;">-</span>
              </td>
            </tr>
          </tbody>
        </n-table>
      </div>

      <n-divider />

      <div class="analysis-section">
        <h3 class="section-title">差异分析</h3>
        <div v-if="differentParams.length > 0" class="diff-list">
          <n-space vertical size="medium">
            <div v-for="param in differentParams" :key="param" class="diff-item">
              <n-tag type="warning">{{ param }}</n-tag>
              <span>参数存在差异：</span>
              <n-space>
                <n-tag v-for="item in store.comparisonItems" :key="item.id" size="small">
                  {{ item.name }}: {{ formatValue(item.params[param]) }}
                </n-tag>
              </n-space>
            </div>
          </n-space>
        </div>
        <p v-else style="color: #999;">所有参数完全相同</p>
      </div>

      <div class="chart-section" v-if="store.comparisonItems.length >= 2">
        <h3 class="section-title">可视化对比</h3>
        <div class="chart-wrapper">
          <Bar :data="chartData" :options="chartOptions" />
        </div>
      </div>
    </n-card>

    <n-empty v-else description="请先选择实验类型，然后添加需要对比的实验">
      <template #description>
        <div style="text-align: center;">
          <p style="margin-bottom: 12px;">请先选择实验类型，然后添加需要对比的实验</p>
          <p style="color: #999; font-size: 13px;">最多支持同时对比5个实验的参数差异</p>
        </div>
      </template>
    </n-empty>

    <n-modal v-model:show="showAddModal" preset="card" title="选择要对比的实验" style="width: 700px">
      <n-tabs v-model:value="addTab" size="large">
        <n-tab-pane name="records" tab="从台账选择">
          <div class="select-list">
            <n-checkbox-group v-model:value="selectedRecordIds">
              <n-space vertical>
                <div v-for="record in availableRecords" :key="record.id" class="select-item">
                  <n-checkbox :value="record.id" :disabled="store.isInComparison(record.id)">
                    <span class="item-title">{{ record.title }}</span>
                    <n-tag size="small" :type="getTagType(record.simulationType)" style="margin-left: 8px;">
                      {{ store.getTypeName(record.simulationType) }}
                    </n-tag>
                    <span class="item-time" v-if="store.isInComparison(record.id)" style="color: #f0a020;">（已添加）</span>
                  </n-checkbox>
                </div>
              </n-space>
            </n-checkbox-group>
            <n-empty v-if="availableRecords.length === 0" description="暂无该类型的台账记录" />
          </div>
        </n-tab-pane>
        <n-tab-pane name="templates" tab="从模板选择">
          <div class="select-list">
            <n-checkbox-group v-model:value="selectedTemplateIds">
              <n-space vertical>
                <div v-for="template in availableTemplates" :key="template.id" class="select-item">
                  <n-checkbox :value="template.id" :disabled="store.isInComparison(template.id)">
                    <span class="item-title">{{ template.name }}</span>
                    <n-tag size="small" :type="getTagType(template.simulationType)" style="margin-left: 8px;">
                      {{ store.getTypeName(template.simulationType) }}
                    </n-tag>
                    <span class="item-time" v-if="store.isInComparison(template.id)" style="color: #f0a020;">（已添加）</span>
                  </n-checkbox>
                </div>
              </n-space>
            </n-checkbox-group>
            <n-empty v-if="availableTemplates.length === 0" description="暂无该类型的模板" />
          </div>
        </n-tab-pane>
        <n-tab-pane name="saves" tab="从存档选择">
          <div class="select-list">
            <n-checkbox-group v-model:value="selectedSaveIds">
              <n-space vertical>
                <div v-for="save in availableSaves" :key="save.id" class="select-item">
                  <n-checkbox :value="save.id" :disabled="store.isInComparison(save.id)">
                    <span class="item-title">{{ save.name }}</span>
                    <n-tag size="small" :type="getTagType(save.type)" style="margin-left: 8px;">
                      {{ store.getTypeName(save.type) }}
                    </n-tag>
                    <span class="item-time" v-if="store.isInComparison(save.id)" style="color: #f0a020;">（已添加）</span>
                  </n-checkbox>
                </div>
              </n-space>
            </n-checkbox-group>
            <n-empty v-if="availableSaves.length === 0" description="暂无该类型的存档" />
          </div>
        </n-tab-pane>
      </n-tabs>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showAddModal = false">取消</n-button>
          <n-button type="primary" @click="addSelected">添加选中项</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useSimulationStore } from '../stores/simulation'
import { useMessage } from 'naive-ui'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

const store = useSimulationStore()
const message = useMessage()

const selectedType = ref(null)
const showAddModal = ref(false)
const addTab = ref('records')
const selectedRecordIds = ref([])
const selectedTemplateIds = ref([])
const selectedSaveIds = ref([])

const availableRecords = computed(() => {
  if (!selectedType.value) return []
  return store.allRecords.filter(r => r.simulationType === selectedType.value)
})

const availableTemplates = computed(() => {
  if (!selectedType.value) return []
  return store.allTemplates.filter(t => t.simulationType === selectedType.value)
})

const availableSaves = computed(() => {
  if (!selectedType.value) return []
  return store.getSimulationsByType(selectedType.value)
})

const allParams = computed(() => {
  const params = {}
  store.comparisonItems.forEach(item => {
    if (item.params) {
      Object.keys(item.params).forEach(key => {
        params[key] = true
      })
    }
  })
  return params
})

const differentParams = computed(() => {
  const diffs = []
  Object.keys(allParams.value).forEach(key => {
    if (isDifferent(key)) {
      diffs.push(key)
    }
  })
  return diffs
})

function isDifferent(key) {
  const values = store.comparisonItems
    .map(item => item.params[key])
    .filter(v => v !== undefined)
  if (values.length < 2) return false
  const first = values[0]
  return values.some(v => Math.abs(v - first) > 0.0001)
}

function formatValue(value) {
  if (typeof value === 'number') {
    return value.toFixed(4)
  }
  return value
}

function getTagType(type) {
  const category = store.getTypeCategory(type)
  const typeMap = {
    '力学': 'primary',
    '光学': 'info',
    '声学': 'info',
    '电磁学': 'error',
    '热学': 'warning'
  }
  return typeMap[category] || 'default'
}

function addSelected() {
  let count = 0
  selectedRecordIds.value.forEach(id => {
    const record = store.getExperimentRecordById(id)
    if (record && !store.isInComparison(id)) {
      store.addToComparison({
        id: record.id,
        type: 'record',
        simulationType: record.simulationType,
        name: record.title,
        params: record.params || {}
      })
      count++
    }
  })
  selectedTemplateIds.value.forEach(id => {
    const template = store.experimentTemplates.find(t => t.id === id)
    if (template && !store.isInComparison(id)) {
      store.addToComparison({
        id: template.id,
        type: 'template',
        simulationType: template.simulationType,
        name: template.name,
        params: template.params || {}
      })
      count++
    }
  })
  selectedSaveIds.value.forEach(id => {
    const save = store.getSimulationById(id)
    if (save && !store.isInComparison(id)) {
      store.addToComparison({
        id: save.id,
        type: 'save',
        simulationType: save.type,
        name: save.name,
        params: save.params || {}
      })
      count++
    }
  })
  message.success(`已添加 ${count} 个对比项`)
  showAddModal.value = false
  selectedRecordIds.value = []
  selectedTemplateIds.value = []
  selectedSaveIds.value = []
}

const colors = [
  'rgba(24, 160, 88, 0.8)',
  'rgba(32, 128, 240, 0.8)',
  'rgba(240, 160, 32, 0.8)',
  'rgba(208, 48, 80, 0.8)',
  'rgba(114, 46, 209, 0.8)'
]

const chartData = computed(() => {
  const numericParams = Object.keys(allParams.value).filter(key => {
    return store.comparisonItems.every(item => typeof item.params[key] === 'number')
  }).slice(0, 6)

  const datasets = store.comparisonItems.map((item, index) => ({
    label: item.name,
    data: numericParams.map(key => item.params[key] || 0),
    backgroundColor: colors[index % colors.length],
    borderColor: colors[index % colors.length].replace('0.8', '1'),
    borderWidth: 1
  }))

  return {
    labels: numericParams,
    datasets
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top'
    }
  },
  scales: {
    y: {
      beginAtZero: false
    }
  }
}

watch(selectedType, () => {
  store.clearComparison()
})
</script>

<style scoped>
.comparison-container {
  padding: 20px;
  height: calc(100vh - 64px);
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  margin: 0;
}

.content-card {
  flex: 1;
  overflow: auto;
}

.comparison-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #eee;
}

.comparison-title {
  font-size: 18px;
  font-weight: 600;
}

.comparison-count {
  color: #999;
  font-size: 14px;
}

.table-wrapper {
  overflow-x: auto;
  max-height: 400px;
  overflow-y: auto;
}

.column-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.item-name {
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cell-diff {
  background: rgba(240, 160, 32, 0.1);
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
}

.diff-list {
  max-height: 200px;
  overflow-y: auto;
}

.diff-item {
  background: #fff7e6;
  padding: 12px;
  border-radius: 6px;
}

.chart-section {
  margin-top: 24px;
}

.chart-wrapper {
  height: 300px;
}

.select-list {
  max-height: 400px;
  overflow-y: auto;
}

.select-item {
  padding: 8px 12px;
  background: #f5f5f5;
  border-radius: 6px;
}

.item-title {
  font-weight: 500;
}

.item-time {
  font-size: 12px;
  color: #999;
}
</style>
