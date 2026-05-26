<template>
  <div class="app-container">
    <div class="app-header">
      <div class="header-title">
        <n-icon size="28" class="title-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 16.5c.9-1 2.5-1.5 4-1.5 1.5 0 3 .5 4 1.5 1-1 2.5-1.5 4-1.5 1.5 0 3 .5 4 1.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10.5z"/><path d="M14 8h0"/><path d="M10 8h0"/><path d="M14 12h0"/><path d="M10 12h0"/><path d="M3 21h18"/></svg>
        </n-icon>
        <span>混凝土配比测算工具</span>
      </div>
      <n-tag type="info" size="large">小型施工场景专用</n-tag>
    </div>

    <div class="app-main">
      <aside class="sidebar">
        <n-card class="sidebar-card" content-style="padding: 16px;">
          <n-tabs v-model:value="activeTab" type="segment" style="margin-bottom: 16px;">
            <n-tab-pane name="single" tab="单批次" />
            <n-tab-pane name="batch" tab="多批次" />
          </n-tabs>

          <div class="sidebar-section">
            <h4 class="section-title">
              <n-icon size="18" class="section-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 20h.01"/><path d="M7 20v-4"/><path d="M12 20v-8"/><path d="M17 20V8"/><path d="M22 4v16"/></svg>
              </n-icon>
              施工场景
            </h4>
            <SceneSelector v-model:scene="selectedScene" @update:scene="onSceneChange" />
          </div>

          <div class="sidebar-section">
            <h4 class="section-title">
              <n-icon size="18" class="section-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
              </n-icon>
              强度等级
            </h4>
            <StrengthGradeSelector
              v-model:grade="selectedGrade"
              :scene="selectedScene"
              :grades="applicableGrades"
            />
          </div>

          <div class="sidebar-section">
            <h4 class="section-title">
              <n-icon size="18" class="section-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
              </n-icon>
              浇筑体积
            </h4>
            <template v-if="activeTab === 'single'">
              <VolumeInput v-model:volume="volume" />
            </template>
            <template v-else>
              <BatchVolumeInput
                v-model:baseVolume="baseVolume"
                v-model:batchCount="batchCount"
                :batches="batches"
                @update:batches="onBatchesUpdate"
              />
            </template>
          </div>

          <div class="sidebar-section">
            <h4 class="section-title">
              <n-icon size="18" class="section-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/></svg>
              </n-icon>
              损耗设置
            </h4>
            <WastageSettings v-model:wastage="wastageRates" />
          </div>
        </n-card>

        <div class="quick-ref">
          <n-button type="default" block size="small" @click="showReference = !showReference">
            <template #icon>
              <n-icon>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              </n-icon>
            </template>
            {{ showReference ? '隐藏' : '查看' }}配比参考表
          </n-button>
        </div>
      </aside>

      <main class="main-content">
        <div v-if="showReference" class="reference-panel">
          <RatioReferenceTable />
        </div>
        <div v-else class="result-panel">
          <template v-if="activeTab === 'single'">
            <ResultDisplay
              v-if="calculationResult"
              :result="calculationResult"
              :grade="selectedGrade"
              :volume="volume"
            />
            <n-empty v-else description="请选择参数进行计算" />
          </template>
          <template v-else>
            <BatchResultDisplay
              v-if="batchResult"
              :result="batchResult"
              :grade="selectedGrade"
            />
            <n-empty v-else description="请选择参数进行计算" />
          </template>
        </div>
      </main>
    </div>

    <div class="app-footer">
      <n-text depth="3">
        注：以上配比仅供参考，实际施工请根据砂石含水率、水泥标号等现场条件调整
      </n-text>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { NCard, NTabs, NTabPane, NTag, NText, NIcon, NButton, NEmpty } from 'naive-ui'
import { strengthGrades } from './data/concreteData'
import { getApplicableGrades, calculateMaterials, calculateTotalBatchMaterials, generateBatchVolumes } from './utils/calculator'
import SceneSelector from './components/SceneSelector.vue'
import StrengthGradeSelector from './components/StrengthGradeSelector.vue'
import VolumeInput from './components/VolumeInput.vue'
import WastageSettings from './components/WastageSettings.vue'
import ResultDisplay from './components/ResultDisplay.vue'
import BatchVolumeInput from './components/BatchVolumeInput.vue'
import BatchResultDisplay from './components/BatchResultDisplay.vue'
import RatioReferenceTable from './components/RatioReferenceTable.vue'

const activeTab = ref('single')
const showReference = ref(false)
const selectedScene = ref('foundation')
const selectedGrade = ref('C25')
const volume = ref(1)
const baseVolume = ref(1)
const batchCount = ref(5)
const batches = ref([])

const wastageRates = ref({
  cement: 2,
  sand: 5,
  gravel: 5,
  water: 3
})

const applicableGrades = computed(() => {
  return getApplicableGrades(selectedScene.value, strengthGrades)
})

const calculationResult = computed(() => {
  if (!selectedGrade.value || volume.value <= 0) return null
  return calculateMaterials(selectedGrade.value, volume.value, wastageRates.value)
})

const batchResult = computed(() => {
  if (!selectedGrade.value || batches.value.length === 0) return null
  return calculateTotalBatchMaterials(selectedGrade.value, batches.value, wastageRates.value)
})

function onSceneChange(scene) {
  const applicable = getApplicableGrades(scene, strengthGrades)
  if (applicable.length > 0 && !applicable.find(g => g.value === selectedGrade.value)) {
    selectedGrade.value = applicable[0].value
  }
}

function onBatchesUpdate(newBatches) {
  batches.value = newBatches
}

watch([baseVolume, batchCount], () => {
  batches.value = generateBatchVolumes(baseVolume.value, batchCount.value)
}, { immediate: true })
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 8px;
  margin: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header-title {
  display: flex;
  align-items: center;
  font-size: 20px;
  font-weight: 600;
  color: #333;
}

.title-icon {
  margin-right: 10px;
  color: #2080f0;
}

.app-main {
  flex: 1;
  display: flex;
  gap: 16px;
  padding: 0 12px;
  overflow: hidden;
}

.sidebar {
  width: 360px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow-y: auto;
  padding-bottom: 12px;
}

.sidebar::-webkit-scrollbar {
  width: 6px;
}

.sidebar::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

.sidebar-card {
  flex-shrink: 0;
}

.sidebar-section {
  margin-bottom: 16px;
}

.sidebar-section:last-child {
  margin-bottom: 0;
}

.section-title {
  display: flex;
  align-items: center;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin: 0 0 10px 0;
}

.section-icon {
  margin-right: 6px;
  color: #2080f0;
}

.quick-ref {
  flex-shrink: 0;
}

.main-content {
  flex: 1;
  overflow-y: auto;
  min-width: 0;
}

.main-content::-webkit-scrollbar {
  width: 6px;
}

.main-content::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

.result-panel,
.reference-panel {
  padding-bottom: 12px;
}

.app-footer {
  text-align: center;
  padding: 12px 24px;
  background: rgba(255, 255, 255, 0.9);
  margin: 12px;
  border-radius: 8px;
}
</style>
