<template>
  <div class="quality-status card">
    <h3 class="status-title">炒制品质</h3>
    
    <div class="quality-score">
      <div class="score-circle" :style="{ '--score-color': qualityColor }">
        <svg viewBox="0 0 120 120" class="score-svg">
          <circle
            cx="60"
            cy="60"
            r="50"
            fill="none"
            stroke="#E0E0E0"
            stroke-width="10"
          />
          <circle
            cx="60"
            cy="60"
            r="50"
            fill="none"
            :stroke="qualityColor"
            stroke-width="10"
            stroke-linecap="round"
            :stroke-dasharray="circumference"
            :stroke-dashoffset="dashOffset"
            transform="rotate(-90 60 60)"
            class="score-progress"
          />
        </svg>
        <div class="score-content">
          <span class="score-value">{{ score }}</span>
          <span class="score-label">分</span>
        </div>
      </div>
      <div class="quality-label" :style="{ color: qualityColor }">
        {{ qualityLabel }}
      </div>
    </div>

    <div class="quality-details">
      <h4>品质影响因素</h4>
      <div class="factor-list">
        <div class="factor-item">
          <div class="factor-header">
            <span class="factor-name">温度控制</span>
            <span class="factor-score" :style="{ color: getFactorColor(tempScore) }">{{ tempScore }}%</span>
          </div>
          <div class="factor-bar-bg">
            <div class="factor-bar" :style="{ width: `${tempScore}%`, backgroundColor: getFactorColor(tempScore) }"></div>
          </div>
        </div>
        <div class="factor-item">
          <div class="factor-header">
            <span class="factor-name">时长控制</span>
            <span class="factor-score" :style="{ color: getFactorColor(durationScore) }">{{ durationScore }}%</span>
          </div>
          <div class="factor-bar-bg">
            <div class="factor-bar" :style="{ width: `${durationScore}%`, backgroundColor: getFactorColor(durationScore) }"></div>
          </div>
        </div>
        <div class="factor-item">
          <div class="factor-header">
            <span class="factor-name">翻炒频率</span>
            <span class="factor-score" :style="{ color: getFactorColor(stirScore) }">{{ stirScore }}%</span>
          </div>
          <div class="factor-bar-bg">
            <div class="factor-bar" :style="{ width: `${stirScore}%`, backgroundColor: getFactorColor(stirScore) }"></div>
          </div>
        </div>
      </div>
    </div>

    <div class="tips-section">
      <h4>工艺提示</h4>
      <ul class="tips-list">
        <li v-for="(tip, index) in currentTips" :key="index">
          <span class="tip-icon">💡</span>
          {{ tip }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ProcessStage } from '~/composables/useTeaFiring'

const props = defineProps<{
  score: number
  qualityLabel: string
  qualityColor: string
  currentStage: ProcessStage
  temperature: number
  optimalTemp: number
  duration: number
  optimalDuration: number
  stirFrequency: number
}>()

const circumference = 2 * Math.PI * 50
const dashOffset = computed(() => {
  return circumference - (props.score / 100) * circumference
})

const tempScore = computed(() => {
  const diff = Math.abs(props.temperature - props.optimalTemp)
  return Math.max(0, 100 - diff * 0.5)
})

const durationScore = computed(() => {
  const diff = Math.abs(props.duration - props.optimalDuration)
  return Math.max(0, 100 - diff * 2)
})

const stirScore = computed(() => {
  const optimal = props.currentStage === 'fixing' ? 3 : props.currentStage === 'rolling' ? 5 : 2
  const diff = Math.abs(props.stirFrequency - optimal)
  return Math.max(0, 100 - diff * 10)
})

function getFactorColor(score: number): string {
  if (score >= 85) return '#22c55e'
  if (score >= 70) return '#eab308'
  if (score >= 50) return '#f97316'
  return '#ef4444'
}

const tipsMap: Record<Exclude<ProcessStage, 'idle'>, string[]> = {
  fixing: [
    '杀青温度要先高后低，迅速破坏酶活性',
    '注意"抛闷结合，多抛少闷"，避免茶叶闷黄',
    '当茶叶叶色暗绿、失去光泽、略有粘性时即为适度'
  ],
  rolling: [
    '揉捻要掌握"轻-重-轻"的加压原则',
    '嫩叶轻揉、老叶重揉，避免茶叶破碎',
    '揉至茶叶成条率达80%以上，茶汁溢出即可'
  ],
  drying: [
    '干燥通常分毛火和足火两次进行',
    '毛火温度要高，速度要快，避免茶叶闷结',
    '足火低温慢烘，发展茶叶香气，含水率控制在5%以下'
  ]
}

const currentTips = computed(() => {
  if (props.currentStage === 'idle') {
    return [
      '选择一个工序开始模拟茶叶炒制过程',
      '调节各项参数，观察茶叶变化',
      '参数越接近最佳值，成品品质越高'
    ]
  }
  return tipsMap[props.currentStage as Exclude<ProcessStage, 'idle'>] || []
})
</script>

<style lang="scss" scoped>
.quality-status {
  display: flex;
  flex-direction: column;
  gap: 20px;

  .status-title {
    font-size: $font-size-lg;
    font-weight: 600;
    color: $primary-color;
    margin: 0;
    padding-bottom: 10px;
    border-bottom: 2px solid $border-color;
  }

  .quality-score {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;

    .score-circle {
      position: relative;
      width: 120px;
      height: 120px;

      .score-svg {
        width: 100%;
        height: 100%;
      }

      .score-progress {
        transition: stroke-dashoffset 0.5s ease, stroke 0.3s ease;
      }

      .score-content {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        text-align: center;

        .score-value {
          display: block;
          font-size: $font-size-2xl;
          font-weight: 700;
          color: var(--score-color);
          line-height: 1;
        }

        .score-label {
          font-size: $font-size-xs;
          color: $text-secondary;
        }
      }
    }

    .quality-label {
      font-size: $font-size-lg;
      font-weight: 600;
    }
  }

  .quality-details {
    h4 {
      margin: 0 0 12px 0;
      font-size: $font-size-sm;
      color: $text-primary;
      font-weight: 600;
    }

    .factor-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .factor-item {
      .factor-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 6px;

        .factor-name {
          font-size: $font-size-sm;
          color: $text-secondary;
        }

        .factor-score {
          font-size: $font-size-sm;
          font-weight: 600;
        }
      }

      .factor-bar-bg {
        width: 100%;
        height: 8px;
        background: $border-color;
        border-radius: $radius-full;
        overflow: hidden;

        .factor-bar {
          height: 100%;
          border-radius: $radius-full;
          transition: width 0.5s ease, background-color 0.3s ease;
        }
      }
    }
  }

  .tips-section {
    padding: 16px;
    background: linear-gradient(135deg, rgba(139, 69, 19, 0.05), rgba(210, 105, 30, 0.05));
    border-radius: $radius-md;
    border-left: 4px solid $accent-color;

    h4 {
      margin: 0 0 10px 0;
      font-size: $font-size-sm;
      color: $text-primary;
      font-weight: 600;
    }

    .tips-list {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 8px;

      li {
        font-size: $font-size-xs;
        color: $text-secondary;
        line-height: 1.5;
        display: flex;
        gap: 6px;

        .tip-icon {
          flex-shrink: 0;
        }
      }
    }
  }
}
</style>
