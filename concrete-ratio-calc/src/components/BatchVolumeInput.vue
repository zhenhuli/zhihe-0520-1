<template>
  <n-space vertical :size="12" style="width: 100%;">
    <n-grid :cols="2" :x-gap="12">
      <n-gi>
        <n-input-number
          v-model:value="localBaseVolume"
          :min="0.1"
          :max="100"
          :step="0.5"
          size="small"
          placeholder="单批体积"
          @update:value="updateBaseVolume"
          style="width: 100%;"
        />
      </n-gi>
      <n-gi>
        <n-input-number
          v-model:value="localBatchCount"
          :min="1"
          :max="20"
          :step="1"
          size="small"
          placeholder="批次数量"
          @update:value="updateBatchCount"
          style="width: 100%;"
        />
      </n-gi>
    </n-grid>

    <n-table :single-line="true" bordered size="small" class="batch-table">
      <thead>
        <tr>
          <th style="width: 40px;">#</th>
          <th>体积</th>
          <th style="width: 50px;">操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(batch, index) in localBatches" :key="batch.id">
          <td>{{ index + 1 }}</td>
          <td>
            <n-input-number
              v-model:value="batch.volume"
              :min="0.1"
              :max="1000"
              :step="0.5"
              size="tiny"
              @update:value="updateBatches"
              style="width: 100%;"
            />
          </td>
          <td>
            <n-button
              size="tiny"
              type="error"
              quaternary
              @click="removeBatch(index)"
              :disabled="localBatches.length <= 1"
            >
              -
            </n-button>
          </td>
        </tr>
      </tbody>
    </n-table>

    <n-space :size="8">
      <n-button type="primary" size="tiny" @click="addBatch">
        + 添加批次
      </n-button>
      <n-button size="tiny" @click="resetBatches">
        重置
      </n-button>
    </n-space>

    <n-descriptions :column="2" bordered size="tiny">
      <n-descriptions-item label="总批数">
        {{ localBatches.length }}
      </n-descriptions-item>
      <n-descriptions-item label="总体积">
        {{ totalVolume.toFixed(2) }} m³
      </n-descriptions-item>
    </n-descriptions>
  </n-space>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import {
  NInputNumber, NTable, NButton, NSpace, NDescriptions, NDescriptionsItem, NGrid, NGi
} from 'naive-ui'
import { generateBatchVolumes } from '../utils/calculator'

const props = defineProps({
  baseVolume: {
    type: Number,
    required: true
  },
  batchCount: {
    type: Number,
    required: true
  },
  batches: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['update:baseVolume', 'update:batchCount', 'update:batches'])

const localBaseVolume = ref(props.baseVolume)
const localBatchCount = ref(props.batchCount)
const localBatches = ref([...props.batches])

watch(() => props.batches, (newVal) => {
  localBatches.value = [...newVal]
}, { deep: true })

watch(() => props.baseVolume, (newVal) => {
  localBaseVolume.value = newVal
})

watch(() => props.batchCount, (newVal) => {
  localBatchCount.value = newVal
})

const totalVolume = computed(() => {
  return localBatches.value.reduce((sum, b) => sum + b.volume, 0)
})

function updateBaseVolume(value) {
  localBaseVolume.value = value
  emit('update:baseVolume', value)
  resetBatches()
}

function updateBatchCount(value) {
  localBatchCount.value = value
  emit('update:batchCount', value)
  resetBatches()
}

function updateBatches() {
  emit('update:batches', [...localBatches.value])
}

function addBatch() {
  const maxId = Math.max(...localBatches.value.map(b => b.id), 0)
  localBatches.value.push({
    id: maxId + 1,
    name: `批次 ${maxId + 1}`,
    volume: localBaseVolume.value
  })
  updateBatches()
}

function removeBatch(index) {
  if (localBatches.value.length > 1) {
    localBatches.value.splice(index, 1)
    updateBatches()
  }
}

function resetBatches() {
  localBatches.value = generateBatchVolumes(localBaseVolume.value, localBatchCount.value)
  updateBatches()
}
</script>

<style scoped>
.batch-table {
  font-size: 12px;
}

:deep(.n-input-number) {
  width: 100%;
}
</style>
