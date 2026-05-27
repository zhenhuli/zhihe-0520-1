<template>
  <div class="tea-firing-app">
    <header class="app-header">
      <div class="header-content">
        <h1 class="app-title">
          <span class="title-icon">🍵</span>
          茶叶炒制工艺仿真演示
        </h1>
        <p class="app-subtitle">模拟杀青、揉捻、烘干三大核心工序，还原传统制茶工艺</p>
      </div>
    </header>

    <main class="container">
      <ProcessSelector
        :currentStage="currentStage"
        :isRunning="isRunning"
        :completedStages="completedStages"
        :currentProcessInfo="currentProcessInfo"
        :disabled="isRunning"
        @update:currentStage="handleStageChange"
      />

      <div class="main-content">
        <div class="left-panel">
          <ControlPanel
            v-if="currentConfig && currentProcessInfo"
            v-model:temperature="config[currentStage as Exclude<ProcessStage, 'idle'>].temperature"
            v-model:duration="config[currentStage as Exclude<ProcessStage, 'idle'>].duration"
            v-model:stirFrequency="config[currentStage as Exclude<ProcessStage, 'idle'>].stirFrequency"
            :minTemp="currentProcessInfo.minTemp"
            :maxTemp="currentProcessInfo.maxTemp"
            :optimalTemp="currentProcessInfo.optimalTemp"
            :minDuration="currentProcessInfo.minDuration"
            :maxDuration="currentProcessInfo.maxDuration"
            :optimalDuration="currentProcessInfo.optimalDuration"
            :disabled="isRunning || currentStage === 'idle'"
            @manualStir="triggerStir"
          />

          <div class="idle-panel card" v-else>
            <div class="idle-content">
              <span class="idle-icon">🍃</span>
              <h3>准备开始炒制</h3>
              <p>请从上方选择一个工序开始模拟</p>
            </div>
          </div>
        </div>

        <div class="center-panel">
          <TeaSimulation
            :teaLeaves="teaLeaves"
            :moisture="averageMoisture"
            :shape="averageShape"
            :temperature="currentConfig?.temperature || 0"
            :progress="progress"
            :elapsedTime="elapsedTime"
            :totalDuration="currentConfig?.duration || 0"
            :isRunning="isRunning"
            :isStirring="isStirring"
            :currentStage="currentStage"
            :averageColor="averageColor"
            :colorStages="currentProcessInfo?.colorStages || []"
          />

          <div class="control-buttons">
            <button
              class="btn btn-primary"
              @click="handleStartPause"
              :disabled="currentStage === 'idle' || (progress >= 100 && !isRunning)"
            >
              <span v-if="!isRunning">▶️ 开始</span>
              <span v-else>⏸️ 暂停</span>
            </button>
            <button
              class="btn btn-outline"
              @click="handleReset"
              :disabled="currentStage === 'idle' && teaLeaves.length === 0"
            >
              🔄 重置
            </button>
            <button
              class="btn btn-secondary"
              @click="handleAutoProcess"
              :disabled="isRunning || currentStage !== 'idle'"
            >
              🤖 全自动炒制
            </button>
          </div>
        </div>

        <div class="right-panel">
          <QualityStatus
            :score="qualityScore"
            :qualityLabel="qualityLabel"
            :qualityColor="qualityColor"
            :currentStage="currentStage"
            :temperature="currentConfig?.temperature || 0"
            :optimalTemp="currentProcessInfo?.optimalTemp || 0"
            :duration="currentConfig?.duration || 0"
            :optimalDuration="currentProcessInfo?.optimalDuration || 0"
            :stirFrequency="currentConfig?.stirFrequency || 0"
          />
        </div>
      </div>
    </main>

    <footer class="app-footer">
      <p>茶叶炒制工艺仿真演示工具 | 基于 Nuxt3 + SCSS 开发</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { watch, computed } from 'vue'
import type { ProcessStage } from '~/composables/useTeaFiring'

const {
  currentStage,
  isRunning,
  progress,
  elapsedTime,
  teaLeaves,
  isStirring,
  qualityScore,
  config,
  currentConfig,
  currentProcessInfo,
  averageMoisture,
  averageShape,
  averageColor,
  initTeaLeaves,
  setStage,
  startSimulation,
  pauseSimulation,
  resetSimulation,
  triggerStir,
  getQualityLabel,
  getQualityColor
} = useTeaFiring()

const completedStages = ref<ProcessStage[]>([])
let autoProcessActive = ref(false)

const qualityLabel = computed(() => getQualityLabel())
const qualityColor = computed(() => getQualityColor())

function handleStageChange(stage: ProcessStage) {
  setStage(stage)
  if (teaLeaves.value.length === 0) {
    initTeaLeaves()
  }
}

function handleStartPause() {
  if (isRunning.value) {
    pauseSimulation()
  } else {
    startSimulation()
  }
}

function handleReset() {
  autoProcessActive.value = false
  completedStages.value = []
  resetSimulation()
}

async function handleAutoProcess() {
  if (isRunning.value) return
  autoProcessActive.value = true
  initTeaLeaves()

  const stages: Exclude<ProcessStage, 'idle'>[] = ['fixing', 'rolling', 'drying']

  for (const stage of stages) {
    if (!autoProcessActive.value) break

    setStage(stage)
    await nextTick()

    await new Promise<void>(resolve => {
      const checkProgress = () => {
        if (!autoProcessActive.value || progress.value >= 100) {
          resolve()
          return
        }
        if (!isRunning.value) {
          startSimulation()
        }
        requestAnimationFrame(checkProgress)
      }
      startSimulation()
      checkProgress()
    })

    pauseSimulation()
    completedStages.value.push(stage)
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  autoProcessActive.value = false
}

watch(progress, (newVal) => {
  if (newVal >= 100 && !autoProcessActive.value) {
    if (currentStage.value !== 'idle' && !completedStages.value.includes(currentStage.value)) {
      completedStages.value.push(currentStage.value)
    }
  }
})
</script>

<style lang="scss" scoped>
.tea-firing-app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  background: linear-gradient(135deg, $primary-color 0%, $accent-color 100%);
  color: white;
  padding: 30px 20px;
  text-align: center;
  box-shadow: $shadow-md;

  .header-content {
    max-width: 1400px;
    margin: 0 auto;
    animation: fadeIn 0.6s ease;
  }

  .app-title {
    margin: 0 0 10px 0;
    font-size: $font-size-2xl;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;

    .title-icon {
      font-size: 36px;
    }
  }

  .app-subtitle {
    margin: 0;
    font-size: $font-size-base;
    opacity: 0.9;
  }
}

.container {
  flex: 1;
  padding: 24px;
  max-width: 1600px;
  margin: 0 auto;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.main-content {
  display: grid;
  grid-template-columns: 300px 1fr 300px;
  gap: 24px;
  align-items: start;

  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
  }
}

.left-panel,
.center-panel,
.right-panel {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.center-panel {
  gap: 20px;
}

.idle-panel {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;

  .idle-content {
    text-align: center;
    color: $text-secondary;

    .idle-icon {
      font-size: 64px;
      display: block;
      margin-bottom: 16px;
      animation: pulse 2s infinite;
    }

    h3 {
      margin: 0 0 8px 0;
      color: $text-primary;
      font-size: $font-size-lg;
    }

    p {
      margin: 0;
      font-size: $font-size-sm;
    }
  }
}

.control-buttons {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;

  .btn {
    min-width: 140px;
    padding: 12px 24px;
    font-size: $font-size-base;
  }
}

.app-footer {
  background: $text-primary;
  color: white;
  padding: 16px;
  text-align: center;
  font-size: $font-size-sm;
  opacity: 0.8;

  p {
    margin: 0;
  }
}
</style>
