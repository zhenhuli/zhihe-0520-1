<template>
  <div class="simulation-container">
    <div class="simulation-header">
      <h1 class="simulation-title">热扩散仿真</h1>
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
              <n-switch v-model:value="showIsotherms" />
              <span>显示等温线</span>
            </n-space>
          </div>
        </div>

        <div class="data-display">
          <n-grid :cols="4" :x-gap="16" :y-gap="16">
            <n-grid-item>
              <n-statistic label="热扩散系数" :value="params.alpha.toFixed(4)" suffix="m²/s" />
            </n-grid-item>
            <n-grid-item>
              <n-statistic label="网格精度" :value="params.gridSize" suffix="×" />
            </n-grid-item>
            <n-grid-item>
              <n-statistic label="最高温度" :value="engine.maxTemp.toFixed(1)" suffix="°C" />
            </n-grid-item>
            <n-grid-item>
              <n-statistic label="最低温度" :value="engine.minTemp.toFixed(1)" suffix="°C" />
            </n-grid-item>
            <n-grid-item>
              <n-statistic label="边界-上" :value="params.boundaryTemps.top" suffix="°C" />
            </n-grid-item>
            <n-grid-item>
              <n-statistic label="边界-下" :value="params.boundaryTemps.bottom" suffix="°C" />
            </n-grid-item>
            <n-grid-item>
              <n-statistic label="边界-左" :value="params.boundaryTemps.left" suffix="°C" />
            </n-grid-item>
            <n-grid-item>
              <n-statistic label="边界-右" :value="params.boundaryTemps.right" suffix="°C" />
            </n-grid-item>
          </n-grid>
        </div>

        <div class="charts-container">
          <n-tabs type="line" size="large">
            <n-tab-pane name="cross" tab="横截面温度">
              <div class="chart-wrapper">
                <Line :data="crossSectionChartData" :options="chartOptions" />
              </div>
            </n-tab-pane>
            <n-tab-pane name="center" tab="中心温度变化">
              <div class="chart-wrapper">
                <Line :data="centerTempChartData" :options="centerTempChartOptions" />
              </div>
            </n-tab-pane>
          </n-tabs>
        </div>
      </div>

      <div class="simulation-sidebar">
        <n-card title="参数设置" :bordered="false">
          <n-space vertical size="large" fill>
            <div>
              <label>热扩散系数 (α): {{ params.alpha.toFixed(4) }} m²/s</label>
              <n-slider v-model:value="params.alpha" :min="0.001" :max="0.1" :step="0.001" @update:value="updateParams" />
            </div>
            <div>
              <label>网格精度: {{ params.gridSize }} × {{ params.gridSize }}</label>
              <n-slider v-model:value="params.gridSize" :min="20" :max="80" :step="5" @update:value="updateParams" />
            </div>
            <div>
              <label>空间步长: {{ (params.dx * 100).toFixed(2) }} cm</label>
              <n-slider v-model:value="params.dx" :min="0.01" :max="0.05" :step="0.001" @update:value="updateParams" />
            </div>
            <div>
              <label>时间步长: {{ params.dt.toFixed(3) }} s</label>
              <n-slider v-model:value="params.dt" :min="0.001" :max="0.1" :step="0.001" @update:value="updateParams" />
            </div>
          </n-space>
        </n-card>

        <n-card title="边界条件" :bordered="false" style="margin-top: 16px;">
          <n-space vertical size="medium" fill>
            <div>
              <label>上边界: {{ params.boundaryTemps.top }} °C</label>
              <n-slider v-model:value="params.boundaryTemps.top" :min="0" :max="100" :step="1" @update:value="updateParams" />
            </div>
            <div>
              <label>下边界: {{ params.boundaryTemps.bottom }} °C</label>
              <n-slider v-model:value="params.boundaryTemps.bottom" :min="0" :max="100" :step="1" @update:value="updateParams" />
            </div>
            <div>
              <label>左边界: {{ params.boundaryTemps.left }} °C</label>
              <n-slider v-model:value="params.boundaryTemps.left" :min="0" :max="100" :step="1" @update:value="updateParams" />
            </div>
            <div>
              <label>右边界: {{ params.boundaryTemps.right }} °C</label>
              <n-slider v-model:value="params.boundaryTemps.right" :min="0" :max="100" :step="1" @update:value="updateParams" />
            </div>
          </n-space>
        </n-card>

        <n-card title="热源" :bordered="false" style="margin-top: 16px;">
          <div class="source-list">
            <div v-for="(source, idx) in params.heatSources" :key="idx" class="source-item">
              <div class="source-row">
                <label>温度:</label>
                <n-input-number v-model:value="source.temperature" :min="0" :max="200" :step="5" style="width: 100px;" @update:value="updateParams" />
                <label>半径:</label>
                <n-input-number v-model:value="source.radius" :min="0.05" :max="0.5" :step="0.05" style="width: 100px;" @update:value="updateParams" />
                <n-button size="small" type="error" @click="removeHeatSource(idx)">✕</n-button>
              </div>
            </div>
          </div>
          <n-button style="width: 100%; margin-top: 8px;" @click="addHeatSource">+ 添加热源</n-button>
        </n-card>

        <n-card title="公式说明" :bordered="false" style="margin-top: 16px;">
          <div class="formula">
            <p><strong>热扩散方程：</strong></p>
            <p>∂T/∂t = α·∇²T</p>
            <br>
            <p><strong>有限差分法：</strong></p>
            <p>T[i][j]ⁿ⁺¹ = T[i][j]ⁿ + r·(T[i+1][j] + T[i-1][j] + T[i][j+1] + T[i][j-1] - 4T[i][j])</p>
            <br>
            <p><strong>稳定条件：</strong></p>
            <p>r = α·dt/dx² ≤ 0.25</p>
            <p><strong>热扩散系数：</strong></p>
            <p>α = k/(ρ·c)</p>
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
          <n-button type="primary" @click="saveAsRecord('基于热传导方程 ∂T/∂t = α ∇²T 的有限差分模拟')">保存</n-button>
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
        <n-empty v-else description="暂无热扩散实验模板" />
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
          <n-button type="primary" @click="generateAndDownloadReport('基于热传导方程 ∂T/∂t = α ∇²T 的有限差分模拟')">生成并下载</n-button>
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
import { HeatDiffusionEngine } from '../engines/HeatDiffusionEngine'
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
const showIsotherms = ref(true)
const showSaveModal = ref(false)
const showLoadModal = ref(false)
const saveName = ref('')

const dropdownOptions = [
  { label: '保存为台账记录', key: 'saveRecord' },
  { label: '保存为实验模板', key: 'saveTemplate' }
]

const params = reactive({
  gridSize: 50,
  alpha: 0.01,
  dx: 0.02,
  dt: 0.01,
  boundaryType: 'dirichlet',
  boundaryTemps: {
    top: 0,
    bottom: 100,
    left: 0,
    right: 0
  },
  heatSources: [
    { x: 0.5, y: 0.5, temperature: 80, radius: 0.1 }
  ]
})

const engine = new HeatDiffusionEngine(params)

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
  'heat-diffusion',
  params,
  engine,
  () => {
    const tempGrid = engine.getTemperatureGrid()
    const n = params.gridSize
    let maxT = 0, minT = Infinity, avgT = 0
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        const t = tempGrid[i][j]
        maxT = Math.max(maxT, t)
        minT = Math.min(minT, t)
        avgT += t
      }
    }
    avgT /= (n * n)
    return {
      '最高温度': maxT,
      '最低温度': minT,
      '平均温度': avgT,
      '热源数量': params.heatSources.length
    }
  }
)
let animationId = null
let lastTime = 0

const centerTemperatureHistory = ref([])

const savedSims = computed(() => store.getSimulationsByType('heat-diffusion'))

const crossSectionChartData = computed(() => {
  const n = params.gridSize
  const middleRow = Math.floor(n / 2)
  const temp = engine.getTemperatureGrid()
  if (!temp[middleRow]) return { labels: [], datasets: [] }

  return {
    labels: Array.from({ length: n }, (_, i) => (i * params.dx * 100).toFixed(1)),
    datasets: [{
      label: '温度 (°C)',
      data: Array.from(temp[middleRow]),
      borderColor: '#f0a020',
      backgroundColor: 'rgba(240, 160, 32, 0.1)',
      tension: 0.1,
      pointRadius: 0,
      fill: true
    }]
  }
})

const centerTempChartData = computed(() => ({
  labels: centerTemperatureHistory.value.map(d => d.time.toFixed(2)),
  datasets: [{
    label: '中心温度 (°C)',
    data: centerTemperatureHistory.value.map(d => d.temp),
    borderColor: '#d03050',
    backgroundColor: 'rgba(208, 48, 80, 0.1)',
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
      title: { display: true, text: '温度 (°C)' }
    }
  },
  plugins: {
    legend: { display: false }
  }
}

const centerTempChartOptions = {
  ...chartOptions,
  scales: {
    ...chartOptions.scales,
    x: {
      title: { display: true, text: '时间 (s)' }
    }
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

function addHeatSource() {
  params.heatSources.push({
    x: 0.5, y: 0.5, temperature: 80, radius: 0.1 })
  updateParams()
}

function removeHeatSource(idx) {
  if (params.heatSources.length > 0) {
    params.heatSources.splice(idx, 1)
    updateParams()
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
  centerTemperatureHistory.value = []
  engine.setParams(params)
  engine.reset()
  engine.update(0)
  draw()
}

function animate(currentTime = performance.now()) {
  if (!isRunning.value) return

  const deltaTime = Math.min((currentTime - lastTime) / 1000, 0.1)
  lastTime = currentTime

  const steps = 5
  for (let i = 0; i < steps; i++) {
    engine.update(params.dt)
  }

  const centerIdx = Math.floor(params.gridSize / 2)
  const centerTemp = engine.temperature[centerIdx][centerIdx]
  centerTemperatureHistory.value.push({ time: engine.time, temp: centerTemp })

  if (centerTemperatureHistory.value.length > 200) {
    centerTemperatureHistory.value.shift()
  }

  draw()
  animationId = requestAnimationFrame(animate)
}

function draw() {
  const canvas = canvasRef.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  const width = canvas.width
  const height = canvas.height

  ctx.fillStyle = '#1a1a2e'
  ctx.fillRect(0, 0, width, height)

  const padding = 40
  const plotWidth = width - padding * 2
  const plotHeight = height - padding * 2

  const n = params.gridSize
  const cellWidth = plotWidth / n
  const cellHeight = plotHeight / n

  const temp = engine.getTemperatureGrid()
  const maxT = engine.maxTemp
  const minT = engine.minTemp
  const rangeT = maxT - minT || 1

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const t = temp[i][j]
      const normalized = (t - minT) / rangeT

      const r = Math.round(normalized * 255)
      const g = Math.round((1 - Math.abs(normalized - 0.5) * 200))
      const b = Math.round((1 - normalized) * 255)

      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`
      ctx.fillRect(padding + j * cellWidth, padding + i * cellHeight, cellWidth + 1, cellHeight + 1)
    }
  }

  if (showIsotherms.value) {
    const levels = [0.25, 0.5, 0.75]
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)'
    ctx.lineWidth = 1

    for (const level of levels) {
      const targetTemp = minT + level * rangeT
      ctx.beginPath()

      for (let i = 0; i < n - 1; i++) {
        for (let j = 0; j < n - 1; j++) {
          const t1 = temp[i][j]
          const t2 = temp[i][j + 1]
          const t3 = temp[i + 1][j]
          const t4 = temp[i + 1][j + 1]

          const vals = [t1, t2, t3, t4]

          if (Math.max(...vals) > targetTemp && Math.min(...vals) < targetTemp) {
            const x = padding + j * cellWidth
            const y = padding + i * cellHeight
            ctx.rect(x, y, cellWidth, cellHeight)
          }
        }
      }
      ctx.stroke()
    }
  }

  for (const source of params.heatSources) {
    const x = padding + source.x * (n - 1) * cellWidth
    const y = padding + source.y * (n - 1) * cellHeight
    const r = source.radius * (n - 1) * cellWidth

    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 2
    ctx.stroke()

    ctx.fillStyle = '#fff'
    ctx.font = '12px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(`${source.temperature}°C`, x, y - r - 8)
  }

  ctx.fillStyle = '#666'
  ctx.font = '12px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText(`${minT.toFixed(0)}°C`, padding - 30, padding + 5)
  ctx.fillText(`${maxT.toFixed(0)}°C`, padding - 30, padding + plotHeight)

  const gradient = ctx.createLinearGradient(padding, height - 20, padding + 200, height - 20)
  gradient.addColorStop(0, 'rgb(0, 200, 255)')
  gradient.addColorStop(0.5, 'rgb(255, 200, 0)')
  gradient.addColorStop(1, 'rgb(255, 0, 0)')

  ctx.fillStyle = gradient
  ctx.fillRect(padding, height - 25, 200, 15)

  ctx.fillStyle = '#666'
  ctx.font = '10px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('冷', padding, height - 30)
  ctx.fillText('热', padding + 200, height - 30)
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
  store.saveSimulation('heat-diffusion', saveName.value, {
    gridSize: params.gridSize,
    alpha: params.alpha,
    dx: params.dx,
    dt: params.dt,
    boundaryTemps: { ...params.boundaryTemps },
    heatSources: JSON.parse(JSON.stringify(params.heatSources))
  })
  saveName.value = ''
  showSaveModal.value = false
}

function loadSimulation(sim) {
  Object.assign(params, sim.params)
  params.boundaryTemps = { ...sim.params.boundaryTemps }
  params.heatSources = JSON.parse(JSON.stringify(sim.params.heatSources || []))
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
  background: #1a1a2e;
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

.source-list {
  max-height: 150px;
  overflow-y: auto;
}

.source-item {
  padding: 8px 0;
  border-bottom: 1px solid #eee;
}

.source-row {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.source-row label {
  font-size: 12px;
  color: #666;
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