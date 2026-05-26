<template>
  <n-space vertical :size="12" style="width: 100%;">
    <div class="input-row">
      <n-input-number
        v-model:value="volume"
        :min="0.1"
        :max="1000"
        :step="0.5"
        size="small"
        placeholder="体积"
        style="flex: 1;"
      />
      <n-select
        v-model:value="unit"
        :options="unitOptions"
        size="small"
        style="width: 80px; margin-left: 8px;"
      />
    </div>
    <n-space :size="6" wrap>
      <n-button
        v-for="preset in presets"
        :key="preset.value"
        size="tiny"
        type="default"
        @click="setPreset(preset.value)"
      >
        {{ preset.label }}
      </n-button>
    </n-space>
    <n-descriptions :column="1" bordered size="tiny" v-if="volume > 0">
      <n-descriptions-item label="换算成立方米">
        {{ volumeInCubicMeters.toFixed(4) }} m³
      </n-descriptions-item>
    </n-descriptions>
  </n-space>
</template>

<script setup>
import { ref, computed } from 'vue'
import { NInputNumber, NSelect, NSpace, NButton, NDescriptions, NDescriptionsItem } from 'naive-ui'

const props = defineProps({
  volume: {
    type: Number,
    required: true
  }
})

const emit = defineEmits(['update:volume'])

const unit = ref('m³')

const unitOptions = [
  { label: 'm³', value: 'm³' },
  { label: 'L', value: 'L' }
]

const presets = [
  { label: '0.5', value: 0.5 },
  { label: '1', value: 1 },
  { label: '2', value: 2 },
  { label: '5', value: 5 },
  { label: '10', value: 10 }
]

const volumeInCubicMeters = computed(() => {
  if (unit.value === 'L') {
    return props.volume / 1000
  }
  return props.volume
})

const volume = computed({
  get() {
    return props.volume
  },
  set(value) {
    emit('update:volume', value)
  }
})

function setPreset(value) {
  unit.value = 'm³'
  emit('update:volume', value)
}
</script>

<style scoped>
.input-row {
  display: flex;
  align-items: center;
  width: 100%;
}
</style>
