<template>
  <div class="control-panel card">
    <h3 class="panel-title">参数调节</h3>
    
    <div class="slider-group">
      <div class="slider-container">
        <label>
          <span class="label-icon">🌡️</span>
          炒制温度
        </label>
        <input
          type="range"
          :min="minTemp"
          :max="maxTemp"
          :value="temperature"
          @input="onTemperatureChange"
          :disabled="disabled"
        />
        <div class="slider-value">
          <span>{{ minTemp }}°C</span>
          <span class="current-value">{{ temperature }}°C</span>
          <span>{{ maxTemp }}°C</span>
        </div>
        <div class="optimal-hint" v-if="optimalTemp">
          最佳温度: {{ optimalTemp }}°C
        </div>
      </div>

      <div class="slider-container">
        <label>
          <span class="label-icon">⏱️</span>
          炒制时长
        </label>
        <input
          type="range"
          :min="minDuration"
          :max="maxDuration"
          :value="duration"
          @input="onDurationChange"
          :disabled="disabled"
        />
        <div class="slider-value">
          <span>{{ minDuration }}分钟</span>
          <span class="current-value">{{ duration }}分钟</span>
          <span>{{ maxDuration }}分钟</span>
        </div>
        <div class="optimal-hint" v-if="optimalDuration">
          最佳时长: {{ optimalDuration }}分钟
        </div>
      </div>

      <div class="slider-container">
        <label>
          <span class="label-icon">🔄</span>
          翻炒频率
        </label>
        <input
          type="range"
          min="1"
          max="10"
          :value="stirFrequency"
          @input="onStirFrequencyChange"
          :disabled="disabled"
        />
        <div class="slider-value">
          <span>慢</span>
          <span class="current-value">{{ stirFrequency }} 次/10秒</span>
          <span>快</span>
        </div>
      </div>
    </div>

    <div class="action-buttons">
      <button
        class="btn btn-accent"
        @click="$emit('manualStir')"
        :disabled="disabled"
      >
        手动翻炒
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  temperature: number
  duration: number
  stirFrequency: number
  minTemp: number
  maxTemp: number
  optimalTemp?: number
  minDuration: number
  maxDuration: number
  optimalDuration?: number
  disabled?: boolean
}>()

const emit = defineEmits<{
  'update:temperature': [value: number]
  'update:duration': [value: number]
  'update:stirFrequency': [value: number]
  'manualStir': []
}>()

function onTemperatureChange(e: Event) {
  const target = e.target as HTMLInputElement
  emit('update:temperature', Number(target.value))
}

function onDurationChange(e: Event) {
  const target = e.target as HTMLInputElement
  emit('update:duration', Number(target.value))
}

function onStirFrequencyChange(e: Event) {
  const target = e.target as HTMLInputElement
  emit('update:stirFrequency', Number(target.value))
}
</script>

<style lang="scss" scoped>
.control-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;

  .panel-title {
    font-size: $font-size-lg;
    font-weight: 600;
    color: $primary-color;
    margin: 0;
    padding-bottom: 10px;
    border-bottom: 2px solid $border-color;
  }

  .slider-group {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .label-icon {
    margin-right: 6px;
  }

  .current-value {
    color: $primary-color;
    font-size: $font-size-base;
  }

  .optimal-hint {
    font-size: $font-size-xs;
    color: $secondary-color;
    margin-top: 4px;
    font-style: italic;
  }

  .action-buttons {
    display: flex;
    justify-content: center;
    margin-top: 10px;
  }
}
</style>
