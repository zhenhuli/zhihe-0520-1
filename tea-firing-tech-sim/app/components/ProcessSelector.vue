<template>
  <div class="process-selector card">
    <h3 class="selector-title">工序选择</h3>
    
    <div class="process-flow">
      <div
        v-for="(stage, index) in stages"
        :key="stage.key"
        class="process-item"
        :class="{
          active: currentStage === stage.key,
          completed: completedStages.includes(stage.key),
          disabled: disabled && currentStage !== stage.key
        }"
        @click="selectStage(stage.key)"
      >
        <div class="process-icon">
          <span class="icon">{{ stage.icon }}</span>
          <span class="step-number">{{ index + 1 }}</span>
        </div>
        <div class="process-info">
          <h4 class="process-name">{{ stage.name }}</h4>
          <p class="process-desc">{{ stage.shortDesc }}</p>
        </div>
        <div class="process-status" v-if="currentStage === stage.key">
          <span class="status-dot" :class="{ running: isRunning }"></span>
          {{ isRunning ? '进行中' : '已选择' }}
        </div>
        <div class="process-status completed" v-else-if="completedStages.includes(stage.key)">
          ✓ 已完成
        </div>
      </div>

      <div class="flow-arrow" v-for="i in stages.length - 1" :key="'arrow-' + i">
        <span>→</span>
      </div>
    </div>

    <div class="process-detail" v-if="currentProcessInfo">
      <div class="detail-header">
        <h4>{{ currentProcessInfo.name }} - 工艺说明</h4>
      </div>
      <p class="detail-desc">{{ currentProcessInfo.description }}</p>
      <div class="detail-params">
        <div class="param-item">
          <span class="param-label">温度范围:</span>
          <span class="param-value">{{ currentProcessInfo.minTemp }}°C - {{ currentProcessInfo.maxTemp }}°C</span>
        </div>
        <div class="param-item">
          <span class="param-label">最佳温度:</span>
          <span class="param-value highlight">{{ currentProcessInfo.optimalTemp }}°C</span>
        </div>
        <div class="param-item">
          <span class="param-label">时长范围:</span>
          <span class="param-value">{{ currentProcessInfo.minDuration }} - {{ currentProcessInfo.maxDuration }}分钟</span>
        </div>
        <div class="param-item">
          <span class="param-label">最佳时长:</span>
          <span class="param-value highlight">{{ currentProcessInfo.optimalDuration }}分钟</span>
        </div>
      </div>
    </div>

    <div class="process-detail idle" v-else>
      <p class="idle-hint">请选择一个工序开始模拟</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ProcessStage, ProcessInfo } from '~/composables/useTeaFiring'

const props = defineProps<{
  currentStage: ProcessStage
  isRunning: boolean
  completedStages: ProcessStage[]
  currentProcessInfo: ProcessInfo | null
  disabled?: boolean
}>()

const emit = defineEmits<{
  'update:currentStage': [stage: ProcessStage]
}>()

const stages = [
  { key: 'fixing' as const, name: '杀青', icon: '🔥', shortDesc: '高温破坏酶活性' },
  { key: 'rolling' as const, name: '揉捻', icon: '🌀', shortDesc: '塑造茶叶外形' },
  { key: 'drying' as const, name: '烘干', icon: '☀️', shortDesc: '蒸发水分固形' }
]

function selectStage(stage: ProcessStage) {
  if (props.disabled && props.currentStage !== stage) return
  emit('update:currentStage', stage)
}
</script>

<style lang="scss" scoped>
.process-selector {
  display: flex;
  flex-direction: column;
  gap: 20px;

  .selector-title {
    font-size: $font-size-lg;
    font-weight: 600;
    color: $primary-color;
    margin: 0;
    padding-bottom: 10px;
    border-bottom: 2px solid $border-color;
  }

  .process-flow {
    display: flex;
    align-items: stretch;
    gap: 10px;
    flex-wrap: wrap;
    justify-content: center;
  }

  .process-item {
    flex: 1;
    min-width: 180px;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 16px;
    border: 2px solid $border-color;
    border-radius: $radius-md;
    cursor: pointer;
    transition: all $transition-normal;
    background: white;
    position: relative;
    animation: fadeIn 0.3s ease;

    &:hover:not(.disabled) {
      border-color: $accent-color;
      transform: translateY(-2px);
      box-shadow: $shadow-md;
    }

    &.active {
      border-color: $primary-color;
      background: linear-gradient(135deg, rgba(139, 69, 19, 0.05), rgba(210, 105, 30, 0.05));
    }

    &.completed {
      border-color: $secondary-color;
      background: linear-gradient(135deg, rgba(34, 139, 34, 0.05), rgba(144, 238, 144, 0.05));
    }

    &.disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  .process-icon {
    position: relative;
    width: 50px;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 10px;

    .icon {
      font-size: 32px;
    }

    .step-number {
      position: absolute;
      top: -5px;
      right: -5px;
      width: 20px;
      height: 20px;
      background: $primary-color;
      color: white;
      border-radius: $radius-full;
      font-size: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
    }
  }

  .process-info {
    text-align: center;

    .process-name {
      font-size: $font-size-base;
      font-weight: 600;
      color: $text-primary;
      margin: 0 0 4px 0;
    }

    .process-desc {
      font-size: $font-size-xs;
      color: $text-secondary;
      margin: 0;
    }
  }

  .process-status {
    margin-top: 10px;
    font-size: $font-size-xs;
    color: $primary-color;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 6px;

    &.completed {
      color: $secondary-color;
    }

    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: $radius-full;
      background: $primary-color;

      &.running {
        animation: pulse 1s infinite;
        background: #ef4444;
      }
    }
  }

  .flow-arrow {
    display: flex;
    align-items: center;
    font-size: 24px;
    color: $border-color;
    padding: 0 5px;
  }

  .process-detail {
    padding: 16px;
    background: rgba(139, 69, 19, 0.03);
    border-radius: $radius-md;
    border-left: 4px solid $primary-color;

    &.idle {
      border-left-color: $border-color;
      text-align: center;
    }

    .detail-header h4 {
      margin: 0 0 10px 0;
      color: $primary-color;
      font-size: $font-size-base;
    }

    .detail-desc {
      margin: 0 0 15px 0;
      color: $text-secondary;
      font-size: $font-size-sm;
      line-height: 1.6;
    }

    .detail-params {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;

      .param-item {
        display: flex;
        flex-direction: column;
        gap: 2px;

        .param-label {
          font-size: $font-size-xs;
          color: $text-secondary;
        }

        .param-value {
          font-size: $font-size-sm;
          font-weight: 600;
          color: $text-primary;

          &.highlight {
            color: $accent-color;
          }
        }
      }
    }

    .idle-hint {
      margin: 0;
      color: $text-secondary;
      font-style: italic;
    }
  }
}
</style>
