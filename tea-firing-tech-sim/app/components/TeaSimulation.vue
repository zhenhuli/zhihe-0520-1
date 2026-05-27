<template>
  <div class="tea-simulation card">
    <div class="simulation-header">
      <h3 class="simulation-title">炒制仿真展示</h3>
      <div class="simulation-stats">
        <div class="stat-item">
          <span class="stat-label">水分</span>
          <span class="stat-value">{{ moisture }}%</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">成形</span>
          <span class="stat-value">{{ shape }}%</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">温度</span>
          <span class="stat-value">{{ temperature }}°C</span>
        </div>
      </div>
    </div>

    <div class="simulation-container">
      <div class="wok-container" :class="{ stirring: isStirring, running: isRunning }">
        <div class="wok">
          <div class="wok-inner" :style="getWokInnerStyle()">
            <div class="tea-leaves-container">
              <div
                v-for="leaf in teaLeaves"
                :key="leaf.id"
                class="tea-leaf"
                :class="{ rolling: currentStage === 'rolling' }"
                :style="getLeafStyle(leaf)"
              >
                <svg viewBox="0 0 40 20" class="leaf-shape" :style="{ fill: leaf.color }">
                  <path
                    :d="getLeafPath(leaf.shape)"
                    :stroke="darkenColor(leaf.color, 30)"
                    stroke-width="0.5"
                  />
                  <line
                    v-if="leaf.shape < 50"
                    x1="5"
                    y1="10"
                    x2="35"
                    y2="10"
                    :stroke="darkenColor(leaf.color, 20)"
                    stroke-width="0.3"
                    opacity="0.5"
                  />
                </svg>
              </div>
            </div>

            <div class="steam-container" v-if="showSteam">
              <div
                v-for="i in 8"
                :key="'steam-' + i"
                class="steam-particle"
                :style="{
                  left: `${20 + (i * 7)}%`,
                  animationDelay: `${i * 0.3}s`,
                  animationDuration: `${2 + Math.random()}s`
                }"
              ></div>
            </div>
          </div>
        </div>

        <div class="heat-glow" v-if="isRunning && currentStage !== 'rolling'" :style="getHeatGlowStyle()"></div>
      </div>

      <div class="color-preview">
        <h4>色泽变化</h4>
        <div class="color-spectrum">
          <div
            v-for="(color, index) in colorStages"
            :key="index"
            class="color-swatch"
            :style="{ backgroundColor: color }"
            :title="`阶段 ${index + 1}: ${color}`"
          ></div>
        </div>
        <div class="current-color">
          <span>当前色泽:</span>
          <div class="color-box" :style="{ backgroundColor: averageColor }"></div>
          <span class="color-hex">{{ averageColor }}</span>
        </div>
      </div>
    </div>

    <div class="progress-section">
      <div class="progress-header">
        <span class="progress-label">工序进度</span>
        <span class="progress-percent">{{ progress.toFixed(1) }}%</span>
      </div>
      <div class="progress-bar-container">
        <div class="progress-bar" :style="{ width: `${progress}%` }"></div>
      </div>
      <div class="progress-time">
        <span>已用时: {{ formatTime(elapsedTime) }}</span>
        <span>总时长: {{ totalDuration }}分钟</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TeaLeaf, ProcessStage } from '~/composables/useTeaFiring'

const props = defineProps<{
  teaLeaves: TeaLeaf[]
  moisture: number
  shape: number
  temperature: number
  progress: number
  elapsedTime: number
  totalDuration: number
  isRunning: boolean
  isStirring: boolean
  currentStage: ProcessStage
  averageColor: string
  colorStages: string[]
}>()

const showSteam = computed(() => {
  return props.isRunning && props.moisture > 20 && props.currentStage !== 'rolling'
})

function getLeafStyle(leaf: TeaLeaf) {
  return {
    left: `${leaf.x}%`,
    top: `${leaf.y}%`,
    transform: `rotate(${leaf.rotation}deg) scale(${leaf.scale})`,
    transition: 'all 0.3s ease'
  }
}

function getLeafPath(shape: number): string {
  const curlFactor = shape / 100
  const width = 40
  const height = 20
  const curl = curlFactor * 8

  if (curlFactor < 0.3) {
    return `M 5 ${height / 2} Q ${width / 2} ${height / 2 - curl} ${width - 5} ${height / 2} Q ${width / 2} ${height / 2 + curl} 5 ${height / 2}`
  } else if (curlFactor < 0.7) {
    return `M 5 ${height / 2} Q ${width / 3} ${height / 2 - curl * 1.5} ${width / 2} ${height / 2} Q ${width * 2 / 3} ${height / 2 + curl * 1.5} ${width - 5} ${height / 2} Q ${width / 2} ${height / 2 + curl} 5 ${height / 2}`
  } else {
    return `M ${width / 2} 5 Q ${width - 5} ${height / 3} ${width - 5} ${height / 2} Q ${width - 5} ${height * 2 / 3} ${width / 2} ${height - 5} Q 5 ${height * 2 / 3} 5 ${height / 2} Q 5 ${height / 3} ${width / 2} 5`
  }
}

function darkenColor(color: string, percent: number): string {
  const num = parseInt(color.slice(1), 16)
  const amt = Math.round(2.55 * percent)
  const R = Math.max(0, (num >> 16) - amt)
  const G = Math.max(0, ((num >> 8) & 0x00ff) - amt)
  const B = Math.max(0, (num & 0x0000ff) - amt)
  return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`
}

function getWokInnerStyle() {
  if (props.currentStage === 'idle') {
    return { background: 'linear-gradient(180deg, #8B7355 0%, #654321 100%)' }
  }
  const temp = props.temperature
  const heatFactor = Math.min(1, temp / 300)
  const r = Math.round(101 + heatFactor * 54)
  const g = Math.round(67 - heatFactor * 30)
  const b = Math.round(33 - heatFactor * 20)
  return {
    background: `linear-gradient(180deg, rgb(${r}, ${g}, ${b}) 0%, rgb(${Math.round(r * 0.7)}, ${Math.round(g * 0.7)}, ${Math.round(b * 0.7)}) 100%)`
  }
}

function getHeatGlowStyle() {
  const temp = props.temperature
  const intensity = Math.min(1, temp / 200)
  return {
    opacity: intensity,
    boxShadow: `0 0 ${30 + intensity * 50}px ${10 + intensity * 30}px rgba(255, ${100 + intensity * 100}, 0, ${0.3 + intensity * 0.4})`
  }
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}
</script>

<style lang="scss" scoped>
.tea-simulation {
  display: flex;
  flex-direction: column;
  gap: 20px;

  .simulation-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 10px;
    border-bottom: 2px solid $border-color;

    .simulation-title {
      font-size: $font-size-lg;
      font-weight: 600;
      color: $primary-color;
      margin: 0;
    }

    .simulation-stats {
      display: flex;
      gap: 20px;

      .stat-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 8px 16px;
        background: rgba(139, 69, 19, 0.05);
        border-radius: $radius-md;

        .stat-label {
          font-size: $font-size-xs;
          color: $text-secondary;
        }

        .stat-value {
          font-size: $font-size-lg;
          font-weight: 700;
          color: $primary-color;
        }
      }
    }
  }

  .simulation-container {
    display: flex;
    gap: 20px;
    align-items: stretch;

    @media (max-width: 900px) {
      flex-direction: column;
    }
  }

  .wok-container {
    flex: 1;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px;
    min-height: 400px;

    &.stirring .wok {
      animation: stir 0.5s ease-in-out infinite;
    }

    &.running .tea-leaf {
      transition: all 0.2s ease;
    }
  }

  .wok {
    width: 100%;
    max-width: 450px;
    aspect-ratio: 1;
    border-radius: $radius-full;
    background: linear-gradient(145deg, #4a3728 0%, #2d1f14 50%, #1a120b 100%);
    padding: 15px;
    box-shadow:
      inset 0 10px 30px rgba(0, 0, 0, 0.5),
      0 10px 40px rgba(0, 0, 0, 0.4),
      0 0 0 5px #3d2b1f,
      0 0 0 10px #2d1f14;
    position: relative;
    z-index: 1;
  }

  .wok-inner {
    width: 100%;
    height: 100%;
    border-radius: $radius-full;
    position: relative;
    overflow: hidden;
    box-shadow: inset 0 5px 20px rgba(0, 0, 0, 0.5);
    transition: background 0.5s ease;
  }

  .tea-leaves-container {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
  }

  .tea-leaf {
    position: absolute;
    width: 40px;
    height: 20px;
    transform-origin: center;
    filter: drop-shadow(1px 1px 1px rgba(0, 0, 0, 0.3));

    &.rolling {
      animation: roll 2s linear infinite;
    }

    .leaf-shape {
      width: 100%;
      height: 100%;
    }
  }

  .steam-container {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    pointer-events: none;
  }

  .steam-particle {
    position: absolute;
    bottom: 30%;
    width: 20px;
    height: 20px;
    background: radial-gradient(ellipse, rgba(255, 255, 255, 0.6) 0%, transparent 70%);
    border-radius: 50%;
    animation: steam 2s ease-out infinite;
    filter: blur(3px);
  }

  .heat-glow {
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    width: 60%;
    height: 20px;
    border-radius: 50%;
    pointer-events: none;
    transition: all 0.5s ease;
    z-index: 0;
  }

  .color-preview {
    width: 200px;
    display: flex;
    flex-direction: column;
    gap: 15px;
    padding: 15px;
    background: rgba(139, 69, 19, 0.03);
    border-radius: $radius-md;

    @media (max-width: 900px) {
      width: 100%;
    }

    h4 {
      margin: 0;
      font-size: $font-size-sm;
      color: $text-primary;
      font-weight: 600;
    }

    .color-spectrum {
      display: flex;
      gap: 5px;
      height: 40px;

      .color-swatch {
        flex: 1;
        border-radius: $radius-sm;
        box-shadow: $shadow-sm;
        transition: transform $transition-fast;

        &:hover {
          transform: scale(1.1);
        }
      }
    }

    .current-color {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: $font-size-xs;
      color: $text-secondary;

      .color-box {
        width: 30px;
        height: 30px;
        border-radius: $radius-sm;
        box-shadow: $shadow-sm;
      }

      .color-hex {
        font-family: monospace;
        font-weight: 600;
        color: $text-primary;
      }
    }
  }

  .progress-section {
    display: flex;
    flex-direction: column;
    gap: 10px;

    .progress-header {
      display: flex;
      justify-content: space-between;
      font-size: $font-size-sm;

      .progress-label {
        color: $text-secondary;
        font-weight: 500;
      }

      .progress-percent {
        color: $primary-color;
        font-weight: 700;
      }
    }

    .progress-bar-container {
      width: 100%;
      height: 12px;
      background: $border-color;
      border-radius: $radius-full;
      overflow: hidden;
    }

    .progress-bar {
      height: 100%;
      background: linear-gradient(90deg, $secondary-color, $accent-color, $primary-color);
      border-radius: $radius-full;
      transition: width 0.3s ease;
    }

    .progress-time {
      display: flex;
      justify-content: space-between;
      font-size: $font-size-xs;
      color: $text-secondary;
    }
  }
}
</style>
