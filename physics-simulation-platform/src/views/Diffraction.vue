<template>
  <div class="simulation-container">
    <div class="simulation-header">
      <h1 class="simulation-title">光波衍射仿真</h1>
      <n-space>
        <n-dropdown @select="handleDropdownSelect" :options="dropdownOptions" trigger="click">
          <n-button type="primary">
            保存实验
          </n-button>
        </n-dropdown>
        <n-button @click="showLoadModal = true">
          加载存档
        </n-button>
        <n-button @click="showLoadTemplateModal = true" type="success">
          加载模板
        </n-button>
        <n-button @click="showAddToCompare = true" type="warning">
          加入对比
        </n-button>
        <n-button @click="showGenerateReportModal = true" type="info">
          生成报告
        </n-button>
      </n-space>
    </div>

    <div class="simulation-content">
      <div class="simulation-main">
        <div class="canvas-wrapper">
          <canvas ref="canvasRef" class="simulation-canvas"></canvas>
          <div class="canvas-controls">
            <n-space>
              <n-button @click="toggleSimulation" :type="isRunning ? 'warning' : 'success'">
                {{ isRunning ? '暂停' : '开始' }}
              </n-button>
              <n-button @click="resetSimulation">重置</n-button>
            </n-space>
          </div>
        </div>

        <div class="data-display">
          <n-grid :cols="4" :x-gap="16" :y-gap="16">
            <n-grid-item>
              <n-statistic label="波长" :value="params.wavelength" suffix="nm" />
            </n-grid-item>
            <n-grid-item>
              <n-statistic label="缝宽" :value="params.slitWidth" suffix="μm" />
            </n-grid-item>
            <n-grid-item>
              <n-statistic label="缝间距" :value="params.slitSpacing" suffix="μm" />
            </n-grid-item>
            <n-grid-item>
              <n-statistic label="缝数" :value="params.slitCount" suffix="条" />
            </n-grid-item>
            <n-grid-item>
              <n-statistic label="中央峰宽" :value="(engine.calculateCentralPeakWidth() * 100).toFixed(4)" suffix="cm" />
            </n-grid-item>
            <n-grid-item>
              <n-statistic label="第一暗纹位置" :value="(engine.calculateFirstMinimum() * 100).toFixed(4)" suffix="cm" />
            </n-grid-item>
            <n-grid-item>
              <n-statistic label="条纹间距" :value="(engine.calculateFringeSpacing() * 100).toFixed(4)" suffix="cm" />
            </n-grid-item>
            <n-grid-item>
              <n-statistic label="色分辨本领" :value="engine.calculateResolution().toFixed(4)" />
            </n-grid-item>
          </n-grid>
        </div>

        <div class="charts-container">
          <n-tabs type="line" size="large">
            <n-tab-pane name="intensity" tab="光强分布">
              <div class="chart-wrapper">
                <Line :data="intensityChartData" :options="chartOptions" />
              </div>
            </n-tab-pane>
            <n-tab-pane name="wavefield" tab="波场分布">
              <div class="chart-wrapper">
                <Line :data="wavefieldChartData" :options="wavefieldChartOptions" />
              </div>
            </n-tab-pane>
          </n-tabs>
        </div>
      </div>

      <div class="simulation-sidebar">
        <n-card title="参数设置" :bordered="false">
          <n-space vertical size="large" fill>
            <div>
              <label>波长 (λ): {{ params.wavelength }} nm</label>
              <n-slider v-model:value="params.wavelength" :min="380" :max="760" :step="10" @update:value="updateParams" />
            </div>
            <div>
              <label>缝宽 (a): {{ params.slitWidth }} μm</label>
              <n-slider v-model:value="params.slitWidth" :min="10" :max="200" :step="5" @update:value="updateParams" />
            </div>
            <div>
              <label>缝数 (N): {{ params.slitCount }}</label>
              <n-slider v-model:value="params.slitCount" :min="1" :max="10" :step="1" @update:value="updateParams" />
            </div>
            <div v-if="params.slitCount > 1">
              <label>缝间距 (d): {{ params.slitSpacing }} μm</label>
              <n-slider v-model:value="params.slitSpacing" :min="50" :max="500" :step="10" @update:value="updateParams" />
            </div>
            <div>
              <label>屏距 (L): {{ params.screenDistance.toFixed(2) }} m</label>
              <n-slider v-model:value="params.screenDistance" :min="0.5" :max="5" :step="0.1" @update:value="updateParams" />
            </div>
            <div>
              <label>屏宽: {{ params.screenWidth.toFixed(2) }} m</label>
              <n-slider v-model:value="params.screenWidth" :min="1" :max="5" :step="0.1" @update:value="updateParams" />
            </div>
          </n-space>
        </n-card>

        <n-card title="公式说明" :bordered="false" style="margin-top: 16px;">
          <div class="formula">
            <p><strong>单缝衍射光强：</strong></p>
            <p>I = I₀ (sin(β)/β)²</p>
            <p>β = πa sin(θ)/λ</p>
            <br>
            <p><strong>多缝干涉光强：</strong></p>
            <p>I = I₀ (sin(Nα)/sin(α))²</p>
            <p>α = πd sin(θ)/λ</p>
            <br>
            <p><strong>中央条纹宽度：</strong></p>
            <p>Δx = 2λL/a</p>
          </div>
        </n-card>
      </div>
    </div>

    <n-modal v-model:show="showSaveModal" preset="dialog" title="保存仿真参数">
      <div class="modal-content">
        <n-input v-model:value="saveName" placeholder="请输入存档名称" />
      </div>
      <template #action>
        <n-button @click="showSaveModal = false">取消</n-button>
        <n-button type="primary" @click="saveCurrentSimulation">保存</n-button>
      </template>
    </n-modal>

    <n-modal v-model:show="showLoadModal" preset="card" title="加载存档" style="width: 600px">
      <div class="save-list">
        <n-list v-if="savedSims.length > 0">
          <n-list-item v-for="sim in savedSims" :key="sim.id">
            <template #prefix>
              <span style="margin-right: 8px;">📄</span>
            </template>
            <div class="save-item-content">
              <div class="save-name">{{ sim.name }}</div>
              <div class="save-time">{{ formatDate(sim.timestamp) }}</div>
            </div>
            <template #suffix>
              <n-space>
                <n-button size="small" type="primary" @click="loadSimulation(sim)">加载</n-button>
                <n-button size="small" type="error" @click="deleteSim(sim.id)">删除</n-button>
              </n-space>
            </template>
          </n-list-item>
        </n-list>
        <n-empty v-else description="暂无存档" />
      </div>
    </n-modal>

    <n-modal v-model:show="showSaveRecordModal" preset="card" title="保存为实验台账" style="width: 600px">
      <n-form :model="recordForm" label-placement="left" label-width="100px">
        <n-form-item label="实验名称" required>
          <n-input v-model:value="recordForm.title" placeholder="请输入实验名称" />
        </n-form-item>
        <n-form-item label="实验人员">
          <n-input v-model:value="recordForm.experimenter" placeholder="请输入实验人员姓名" />
        </n-form-item>
        <n-form-item label="实验目的">
          <n-input v-model:value="recordForm.purpose" type="textarea" :rows="2" placeholder="请输入实验目的" />
        </n-form-item>
        <n-form-item label="备注">
          <n-input v-model:value="recordForm.notes" type="textarea" :rows="2" placeholder="其他备注信息" />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showSaveRecordModal = false">取消</n-button>
          <n-button type="primary" @click="saveAsRecord('基于光的衍射原理，单缝衍射光强 I = I₀ (sin(β)/β)²')">保存</n-button>
        </n-space>
      </template>
    </n-modal>

    <n-modal v-model:show="showSaveTemplateModal" preset="card" title="保存为实验模板" style="width: 500px">
      <n-form :model="templateForm" label-placement="left" label-width="100px">
        <n-form-item label="模板名称" required>
          <n-input v-model:value="templateForm.name" placeholder="请输入模板名称" />
        </n-form-item>
        <n-form-item label="模板描述">
          <n-input v-model:value="templateForm.description" type="textarea" :rows="2" placeholder="请输入模板描述" />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showSaveTemplateModal = false">取消</n-button>
          <n-button type="primary" @click="saveAsTemplate">保存</n-button>
        </n-space>
      </template>
    </n-modal>

    <n-modal v-model:show="showLoadTemplateModal" preset="card" title="加载实验模板" style="width: 600px">
      <div class="save-list">
        <n-list v-if="availableTemplates.length > 0">
          <n-list-item v-for="template in availableTemplates" :key="template.id">
            <template #prefix>
              <span style="margin-right: 8px;">📋</span>
            </template>
            <div class="save-item-content">
              <div class="save-name">{{ template.name }}</div>
              <div class="save-time">{{ template.description || '暂无描述' }}</div>
            </div>
            <template #suffix>
              <n-space>
                <n-button size="small" type="primary" @click="applyTemplate(template, resetSimulation)">应用</n-button>
              </n-space>
            </template>
          </n-list-item>
        </n-list>
        <n-empty v-else description="暂无光波衍射实验模板" />
      </div>
    </n-modal>

    <n-modal v-model:show="showGenerateReportModal" preset="card" title="生成实验报告" style="width: 600px">
      <n-form :model="reportForm" label-placement="left" label-width="100px">
        <n-form-item label="实验名称" required>
          <n-input v-model:value="reportForm.title" placeholder="请输入实验名称" />
        </n-form-item>
        <n-form-item label="实验人员">
          <n-input v-model:value="reportForm.experimenter" placeholder="请输入实验人员姓名" />
        </n-form-item>
        <n-form-item label="实验目的">
          <n-input v-model:value="reportForm.purpose" type="textarea" :rows="2" placeholder="请输入实验目的" />
        </n-form-item>
        <n-form-item label="实验原理">
          <n-input v-model:value="reportForm.principle" type="textarea" :rows="2" placeholder="请输入实验原理" />
        </n-form-item>
        <n-form-item label="实验结论">
          <n-input v-model:value="reportForm.conclusion" type="textarea" :rows="2" placeholder="请输入实验结论" />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showGenerateReportModal = false">取消</n-button>
          <n-button type="primary" @click="generateAndDownloadReport('基于光的衍射原理，单缝衍射光强 I = I₀ (sin(β)/β)²')">生成并下载</n-button>
        </n-space>
      </template>
    </n-modal>

    <n-modal v-model:show="showAddToCompare" preset="card" title="加入参数对比" style="width: 500px">
      <p style="margin-bottom: 16px;">将当前实验参数加入对比列表，最多支持同时对比5个实验。</p>
      <n-descriptions v-if="currentCompareInfo" bordered :column="1">
        <n-descriptions-item v-for="(value, key) in currentCompareInfo.params" :key="key" :label="key">
          {{ typeof value === 'number' ? value.toFixed(4) : value }}
        </n-descriptions-item>
      </n-descriptions>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showAddToCompare = false">取消</n-button>
          <n-button type="primary" @click="confirmAddToCompare">确认加入</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, computed } from 'vue'
import { useSimulationStore } from '../stores/simulation'
import { DiffractionEngine } from '../engines/DiffractionEngine'
import { useExperimentTools } from '../composables/useExperimentTools'
import { useRoute } from 'vue-router'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

const store = useSimulationStore()
const route = useRoute()

const canvasRef = ref(null)
const isRunning = ref(false)
const showSaveModal = ref(false)
const showLoadModal = ref(false)
const saveName = ref('')

const dropdownOptions = [
  { label: '保存为台账记录', key: 'saveRecord' },
  { label: '保存为实验模板', key: 'saveTemplate' }
]

const params = reactive({
  wavelength: 550,
  slitWidth: 50,
  slitCount: 2,
  slitSpacing: 100,
  screenDistance: 1.0,
  screenWidth: 2.0
})

const engine = new DiffractionEngine(params)

const {
  showSaveRecordModal,
  showSaveTemplateModal,
  showLoadTemplateModal,
  showGenerateReportModal,
  showAddToCompare,
  recordForm,
  templateForm,
  reportForm,
  availableTemplates,
  currentCompareInfo,
  saveAsRecord,
  saveAsTemplate,
  applyTemplate,
  generateAndDownloadReport,
  confirmAddToCompare,
  checkReproduceParams
} = useExperimentTools(
  'diffraction',
  params,
  engine,
  () => ({
    '中央峰宽': engine.calculateCentralPeakWidth(),
    '第一暗纹位置': engine.calculateFirstMinimum(),
    '条纹间距': engine.calculateFringeSpacing(),
    '色分辨本领': engine.calculateResolution()
  })
)
let animationId = null
let lastTime = 0

const savedSims = computed(() => store.getSimulationsByType('diffraction'))

const intensityChartData = computed(() => {
  const color = wavelengthToColor(params.wavelength)
  return {
    labels: engine.intensityPattern.map(p => (p.x * 100).toFixed(2)),
    datasets: [{
      label: '光强 (a.u.)',
      data: engine.intensityPattern.map(p => p.intensity / engine.maxIntensity),
      borderColor: color.rgb,
      backgroundColor: color.rgba(0.2),
      tension: 0.1,
      pointRadius: 0,
      fill: true
    }]
  }
})

const wavefieldChartData = computed(() => ({
  labels: engine.waveField.map(p => (p.x * 100).toFixed(2)),
  datasets: [{
    label: '实部',
    data: engine.waveField.map(p => p.real),
    borderColor: '#2080f0',
    backgroundColor: 'rgba(32, 128, 240, 0.1)',
    tension: 0.1,
    pointRadius: 0
  }, {
    label: '虚部',
    data: engine.waveField.map(p => p.imag),
    borderColor: '#f0a020',
    backgroundColor: 'rgba(240, 160, 32, 0.1)',
    tension: 0.1,
    pointRadius: 0
  }]
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  animation: false,
  scales: {
    x: {
      title: { display: true, text: '位置 (cm)' }
    },
    y: {
      title: { display: true, text: '相对光强' },
      min: 0,
      max: 1
    }
  },
  plugins: {
    legend: { display: true, position: 'top' }
  }
}

const wavefieldChartOptions = {
  ...chartOptions,
  scales: {
    ...chartOptions.scales,
    y: {
      title: { display: true, text: '振幅' },
      min: -1.5,
      max: 1.5
    }
  }
}

function wavelengthToColor(wavelength) {
  let r, g, b
  if (wavelength >= 380 && wavelength < 440) {
    r = -(wavelength - 440) / (440 - 380)
    g = 0
    b = 1
  } else if (wavelength >= 440 && wavelength < 490) {
    r = 0
    g = (wavelength - 440) / (490 - 440)
    b = 1
  } else if (wavelength >= 490 && wavelength < 510) {
    r = 0
    g = 1
    b = -(wavelength - 510) / (510 - 490)
  } else if (wavelength >= 510 && wavelength < 580) {
    r = (wavelength - 510) / (580 - 510)
    g = 1
    b = 0
  } else if (wavelength >= 580 && wavelength < 645) {
    r = 1
    g = -(wavelength - 645) / (645 - 580)
    b = 0
  } else {
    r = 1
    g = 0
    b = 0
  }
  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
    rgb: `rgb(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)})`,
    rgba: (alpha) => `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${alpha})`
  }
}

function updateParams() {
  engine.setParams(params)
  if (!isRunning.value) {
    engine.reset()
    engine.update(0)
    draw()
  }
}

function toggleSimulation() {
  isRunning.value = !isRunning.value
  if (isRunning.value) {
    lastTime = performance.now()
    animate()
  } else if (animationId) {
    cancelAnimationFrame(animationId)
  }
}

function resetSimulation() {
  isRunning.value = false
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
  engine.setParams(params)
  engine.reset()
  engine.update(0)
  draw()
}

function animate(currentTime = performance.now()) {
  if (!isRunning.value) return

  const deltaTime = Math.min((currentTime - lastTime) / 1000, 0.1)
  lastTime = currentTime

  engine.update(deltaTime)
  draw()
  animationId = requestAnimationFrame(animate)
}

function draw() {
  const canvas = canvasRef.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  const width = canvas.width
  const height = canvas.height

  ctx.fillStyle = '#0a0a1a'
  ctx.fillRect(0, 0, width, height)

  const pattern = engine.intensityPattern
  if (!pattern.length) return

  const color = wavelengthToColor(params.wavelength)
  const halfWidth = width * 0.9
  const startX = (width - halfWidth) / 2
  const centerY = height * 0.4

  ctx.beginPath()
  for (let i = 0; i < pattern.length; i++) {
    const x = startX + (i / (pattern.length - 1)) * halfWidth
    const intensity = pattern[i].intensity / engine.maxIntensity
    const barHeight = intensity * height * 0.25

    if (i === 0) {
      ctx.moveTo(x, centerY)
    }
    ctx.lineTo(x, centerY - barHeight)
  }
  for (let i = pattern.length - 1; i >= 0; i--) {
    const x = startX + (i / (pattern.length - 1)) * halfWidth
    const intensity = pattern[i].intensity / engine.maxIntensity
    const barHeight = intensity * height * 0.25
    ctx.lineTo(x, centerY + barHeight)
  }
  ctx.closePath()

  const gradient = ctx.createLinearGradient(0, centerY - height * 0.25, 0, centerY + height * 0.25)
  gradient.addColorStop(0, color.rgb)
  gradient.addColorStop(0.5, color.rgba(1))
  gradient.addColorStop(1, color.rgb)
  ctx.fillStyle = gradient
  ctx.fill()

  const slitY = height * 0.15
  const slitHeight = height * 0.08
  const totalSlitWidth = params.slitCount * 20 + (params.slitCount - 1) * (params.slitSpacing / 200) * 80
  const slitStartX = (width - totalSlitWidth) / 2

  for (let i = 0; i < params.slitCount; i++) {
    const slitX = slitStartX + i * (20 + (params.slitSpacing / 200) * 80)
    ctx.fillStyle = '#333'
    ctx.fillRect(slitX - 2, slitY, 4, slitHeight)
    ctx.fillStyle = '#666'
    ctx.fillRect(slitX - 15, slitY + slitHeight + 2, 30, 5)
  }

  const screenY = height * 0.6
  ctx.strokeStyle = '#444'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(startX, screenY)
  ctx.lineTo(startX + halfWidth, screenY)
  ctx.stroke()

  for (let i = 0; i < pattern.length; i += 5) {
    const x = startX + (i / (pattern.length - 1)) * halfWidth
    const intensity = pattern[i].intensity / engine.maxIntensity
    const dotRadius = Math.max(2, intensity * 8)

    ctx.beginPath()
    ctx.arc(x, screenY + 15, dotRadius, 0, Math.PI * 2)
    ctx.fillStyle = color.rgb
    ctx.globalAlpha = intensity
    ctx.fill()
    ctx.globalAlpha = 1
  }

  ctx.fillStyle = '#666'
  ctx.font = '12px sans-serif'
  ctx.fillText('0', width / 2 - 5, screenY + 45)
  ctx.fillText((-params.screenWidth * 50).toFixed(0) + 'cm', startX - 20, screenY + 45)
  ctx.fillText((params.screenWidth * 50).toFixed(0) + 'cm', startX + halfWidth - 30, screenY + 45)
}

function resizeCanvas() {
  const canvas = canvasRef.value
  if (!canvas) return

  const wrapper = canvas.parentElement
  canvas.width = wrapper.clientWidth
  canvas.height = wrapper.clientHeight
  draw()
}

function saveCurrentSimulation() {
  if (!saveName.value.trim()) return
  store.saveSimulation('diffraction', saveName.value, { ...params })
  saveName.value = ''
  showSaveModal.value = false
}

function loadSimulation(sim) {
  Object.assign(params, sim.params)
  resetSimulation()
  showLoadModal.value = false
}

function deleteSim(id) {
  store.deleteSimulation(id)
}

function formatDate(timestamp) {
  return new Date(timestamp).toLocaleString()
}

function handleDropdownSelect(key) {
  if (key === 'saveRecord') {
    showSaveRecordModal = true
  } else if (key === 'saveTemplate') {
    showSaveTemplateModal = true
  }
}

onMounted(() => {
  resizeCanvas()
  window.addEventListener('resize', resizeCanvas)
  engine.reset()
  engine.update(0)
  draw()
  checkReproduceParams(resetSimulation)
})

onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
  window.removeEventListener('resize', resizeCanvas)
})
</script>

<style scoped>
.simulation-container {
  padding: 20px;
  height: calc(100vh - 64px);
  display: flex;
  flex-direction: column;
}

.simulation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.simulation-title {
  font-size: 24px;
  font-weight: 600;
  margin: 0;
}

.simulation-content {
  display: flex;
  flex: 1;
  gap: 20px;
  min-height: 0;
}

.simulation-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 0;
}

.canvas-wrapper {
  position: relative;
  background: #0a0a1a;
  border-radius: 8px;
  overflow: hidden;
  flex: 1;
  min-height: 300px;
}

.simulation-canvas {
  width: 100%;
  height: 100%;
  display: block;
}

.canvas-controls {
  position: absolute;
  top: 16px;
  left: 16px;
  background: rgba(0, 0, 0, 0.6);
  padding: 12px;
  border-radius: 8px;
  backdrop-filter: blur(8px);
}

.data-display {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
}

.charts-container {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  flex: 1;
  min-height: 250px;
}

.chart-wrapper {
  height: 220px;
}

.simulation-sidebar {
  width: 320px;
  overflow-y: auto;
}

.formula {
  font-family: 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.8;
  color: #333;
}

.modal-content {
  padding: 20px 0;
}

.save-list {
  max-height: 400px;
  overflow-y: auto;
}

.save-item-content {
  flex: 1;
}

.save-name {
  font-weight: 500;
}

.save-time {
  font-size: 12px;
  color: #999;
}
</style>