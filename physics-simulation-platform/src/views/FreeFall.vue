<template>
  <div class="simulation-container">
    <div class="simulation-header">
      <h1 class="simulation-title">自由落体仿真</h1>
      <n-space>
        <n-dropdown @select="handleDropdownSelect" :options="dropdownOptions" trigger="click">
          <n-button type="primary">
            保存实验
          </n-button>
        </n-dropdown>
        <n-button @click="showLoadModal = true">
          加载存档
        </n-button>
        <n-button @click="tools.showLoadTemplateModal = true" type="success">
          加载模板
        </n-button>
        <n-button @click="tools.showAddToCompare = true" type="warning">
          加入对比
        </n-button>
        <n-button @click="tools.showGenerateReportModal = true" type="info">
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
              <n-switch v-model:value="showTrajectory" />
              <span>显示轨迹</span>
            </n-space>
          </div>
          <div v-if="currentData.hasLanded" class="landed-badge">
            <n-tag type="success" size="large">已落地！用时: {{ currentData.landTime.toFixed(3) }}s</n-tag>
          </div>
        </div>

        <div class="data-display">
          <n-grid :cols="3" :x-gap="16" :y-gap="16">
            <n-grid-item>
              <n-statistic label="高度 (h)" :value="currentData.position.toFixed(3)" suffix="m" />
            </n-grid-item>
            <n-grid-item>
              <n-statistic label="速度 (v)" :value="currentData.velocity.toFixed(2)" suffix="m/s" />
            </n-grid-item>
            <n-grid-item>
              <n-statistic label="加速度 (a)" :value="currentData.acceleration.toFixed(2)" suffix="m/s²" />
            </n-grid-item>
            <n-grid-item>
              <n-statistic label="能量 (E)" :value="currentData.energy.toFixed(2)" suffix="J" />
            </n-grid-item>
            <n-grid-item>
              <n-statistic label="终端速度" :value="terminalVelocityDisplay" suffix="m/s" />
            </n-grid-item>
            <n-grid-item>
              <n-statistic label="时间" :value="currentData.time.toFixed(2)" suffix="s" />
            </n-grid-item>
          </n-grid>
        </div>

        <div class="charts-container">
          <n-tabs type="line" size="large">
            <n-tab-pane name="position" tab="高度-时间">
              <div class="chart-wrapper">
                <Line :data="positionChartData" :options="chartOptions" />
              </div>
            </n-tab-pane>
            <n-tab-pane name="velocity" tab="速度-时间">
              <div class="chart-wrapper">
                <Line :data="velocityChartData" :options="chartOptions" />
              </div>
            </n-tab-pane>
            <n-tab-pane name="force" tab="受力分析">
              <div class="chart-wrapper">
                <Line :data="forceChartData" :options="chartOptions" />
              </div>
            </n-tab-pane>
          </n-tabs>
        </div>
      </div>

      <div class="simulation-sidebar">
        <n-card title="参数设置" :bordered="false">
          <n-space vertical size="large" fill>
            <div>
              <label>初始高度 (h₀): {{ params.h0.toFixed(1) }} m</label>
              <n-slider v-model:value="params.h0" :min="1" :max="100" :step="1" @update:value="updateParams" />
            </div>
            <div>
              <label>质量 (m): {{ params.m.toFixed(2) }} kg</label>
              <n-slider v-model:value="params.m" :min="0.1" :max="50" :step="0.1" @update:value="updateParams" />
            </div>
            <div>
              <label>重力加速度 (g): {{ params.g.toFixed(2) }} m/s²</label>
              <n-slider v-model:value="params.g" :min="1" :max="30" :step="0.1" @update:value="updateParams" />
            </div>
            <div>
              <label>初始速度 (v₀): {{ params.v0.toFixed(2) }} m/s</label>
              <n-slider v-model:value="params.v0" :min="-20" :max="20" :step="0.1" @update:value="updateParams" />
            </div>
            <div>
              <n-space>
                <label>考虑空气阻力</label>
                <n-switch v-model:value="params.useAirResistance" @update:value="updateParams" />
              </n-space>
            </div>
            <div v-if="params.useAirResistance">
              <label>阻力系数 (Cd): {{ params.Cd.toFixed(2) }}</label>
              <n-slider v-model:value="params.Cd" :min="0.1" :max="2" :step="0.01" @update:value="updateParams" />
            </div>
            <div v-if="params.useAirResistance">
              <label>横截面积 (A): {{ params.A.toFixed(4) }} m²</label>
              <n-slider v-model:value="params.A" :min="0.0001" :max="0.1" :step="0.0001" @update:value="updateParams" />
            </div>
            <div v-if="params.useAirResistance">
              <label>空气密度 (ρ): {{ params.rho.toFixed(3) }} kg/m³</label>
              <n-slider v-model:value="params.rho" :min="0.1" :max="5" :step="0.01" @update:value="updateParams" />
            </div>
          </n-space>
        </n-card>

        <n-card title="公式说明" :bordered="false" style="margin-top: 16px;">
          <div class="formula">
            <p><strong>运动方程：</strong></p>
            <p>ma = mg - ½ρCdAv²</p>
            <br>
            <p><strong>无阻力下落时间：</strong></p>
            <p>t = √(2h/g)</p>
            <br>
            <p><strong>终端速度：</strong></p>
            <p>v_t = √(2mg/(ρCdA))</p>
            <br>
            <p><strong>能量：</strong></p>
            <p>E = ½mv² + mgh</p>
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

    <n-modal v-model:show="tools.showSaveRecordModal" preset="card" title="保存为实验台账" style="width: 600px">
      <n-form :model="tools.recordForm" label-placement="left" label-width="100px">
        <n-form-item label="实验名称" required>
          <n-input v-model:value="tools.recordForm.title" placeholder="请输入实验名称" />
        </n-form-item>
        <n-form-item label="实验人员">
          <n-input v-model:value="tools.recordForm.experimenter" placeholder="请输入实验人员姓名" />
        </n-form-item>
        <n-form-item label="实验目的">
          <n-input v-model:value="tools.recordForm.purpose" type="textarea" :rows="2" placeholder="请输入实验目的" />
        </n-form-item>
        <n-form-item label="备注">
          <n-input v-model:value="tools.recordForm.notes" type="textarea" :rows="2" placeholder="其他备注信息" />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="tools.showSaveRecordModal = false">取消</n-button>
          <n-button type="primary" @click="tools.saveAsRecord('基于自由落体运动方程 ma = mg - ½ρCdAv²')">保存</n-button>
        </n-space>
      </template>
    </n-modal>

    <n-modal v-model:show="tools.showSaveTemplateModal" preset="card" title="保存为实验模板" style="width: 500px">
      <n-form :model="tools.templateForm" label-placement="left" label-width="100px">
        <n-form-item label="模板名称" required>
          <n-input v-model:value="tools.templateForm.name" placeholder="请输入模板名称" />
        </n-form-item>
        <n-form-item label="模板描述">
          <n-input v-model:value="tools.templateForm.description" type="textarea" :rows="2" placeholder="请输入模板描述" />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="tools.showSaveTemplateModal = false">取消</n-button>
          <n-button type="primary" @click="tools.saveAsTemplate">保存</n-button>
        </n-space>
      </template>
    </n-modal>

    <n-modal v-model:show="tools.showLoadTemplateModal" preset="card" title="加载实验模板" style="width: 600px">
      <div class="save-list">
        <n-list v-if="tools.availableTemplates.length > 0">
          <n-list-item v-for="template in tools.availableTemplates" :key="template.id">
            <template #prefix>
              <span style="margin-right: 8px;">📋</span>
            </template>
            <div class="save-item-content">
              <div class="save-name">{{ template.name }}</div>
              <div class="save-time">{{ template.description || '暂无描述' }}</div>
            </div>
            <template #suffix>
              <n-space>
                <n-button size="small" type="primary" @click="tools.applyTemplate(template, resetSimulation)">应用</n-button>
              </n-space>
            </template>
          </n-list-item>
        </n-list>
        <n-empty v-else description="暂无自由落体实验模板" />
      </div>
    </n-modal>

    <n-modal v-model:show="tools.showGenerateReportModal" preset="card" title="生成实验报告" style="width: 600px">
      <n-form :model="tools.reportForm" label-placement="left" label-width="100px">
        <n-form-item label="实验名称" required>
          <n-input v-model:value="tools.reportForm.title" placeholder="请输入实验名称" />
        </n-form-item>
        <n-form-item label="实验人员">
          <n-input v-model:value="tools.reportForm.experimenter" placeholder="请输入实验人员姓名" />
        </n-form-item>
        <n-form-item label="实验目的">
          <n-input v-model:value="tools.reportForm.purpose" type="textarea" :rows="2" placeholder="请输入实验目的" />
        </n-form-item>
        <n-form-item label="实验原理">
          <n-input v-model:value="tools.reportForm.principle" type="textarea" :rows="2" placeholder="请输入实验原理" />
        </n-form-item>
        <n-form-item label="实验结论">
          <n-input v-model:value="tools.reportForm.conclusion" type="textarea" :rows="2" placeholder="请输入实验结论" />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="tools.showGenerateReportModal = false">取消</n-button>
          <n-button type="primary" @click="tools.generateAndDownloadReport('基于自由落体运动方程 ma = mg - ½ρCdAv²')">生成并下载</n-button>
        </n-space>
      </template>
    </n-modal>

    <n-modal v-model:show="tools.showAddToCompare" preset="card" title="加入参数对比" style="width: 500px">
      <p style="margin-bottom: 16px;">将当前实验参数加入对比列表，最多支持同时对比5个实验。</p>
      <n-descriptions v-if="tools.currentCompareInfo" bordered :column="1">
        <n-descriptions-item v-for="(value, key) in tools.currentCompareInfo.params" :key="key" :label="key">
          {{ typeof value === 'number' ? value.toFixed(4) : value }}
        </n-descriptions-item>
      </n-descriptions>
      <template #footer>
        <n-space justify="end">
          <n-button @click="tools.showAddToCompare = false">取消</n-button>
          <n-button type="primary" @click="tools.confirmAddToCompare">确认加入</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, computed } from 'vue'
import { useSimulationStore } from '../stores/simulation'
import { FreeFallEngine } from '../engines/FreeFallEngine'
import { Line } from 'vue-chartjs'
import { useExperimentTools } from '../composables/useExperimentTools'
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

const canvasRef = ref(null)
const isRunning = ref(false)
const showTrajectory = ref(true)
const showSaveModal = ref(false)
const showLoadModal = ref(false)
const saveName = ref('')

const dropdownOptions = [
  { label: '保存为存档', key: 'save' },
  { label: '保存为实验台账', key: 'record' },
  { label: '保存为实验模板', key: 'template' }
]

const params = reactive({
  g: 9.8,
  m: 1.0,
  Cd: 0.47,
  A: 0.01,
  rho: 1.225,
  h0: 50.0,
  v0: 0,
  useAirResistance: true
})

const currentData = reactive({
  position: params.h0,
  velocity: params.v0,
  acceleration: 0,
  energy: 0,
  time: 0,
  airResistance: 0,
  gravityForce: 0,
  totalForce: 0,
  hasLanded: false,
  landTime: null
})

const engine = new FreeFallEngine(params)
let animationId = null
let lastTime = 0

const tools = useExperimentTools('free-fall', params, engine, () => {
  const latestData = engine.dataHistory[engine.dataHistory.length - 1]
  return latestData ? {
    最终高度: latestData.position,
    最终速度: latestData.velocity,
    最终能量: latestData.energy,
    运行时间: latestData.time,
    落地时间: latestData.landTime || '未落地',
    终端速度: engine.getTerminalVelocity()
  } : {}
})

const savedSims = computed(() => store.getSimulationsByType('free-fall'))

const terminalVelocityDisplay = computed(() => {
  const vt = engine.getTerminalVelocity()
  return vt === Infinity ? '∞' : vt.toFixed(2)
})

const positionChartData = computed(() => ({
  labels: engine.dataHistory.map(d => d.time.toFixed(1)),
  datasets: [{
    label: '高度 (m)',
    data: engine.dataHistory.map(d => d.position),
    borderColor: '#f0a020',
    backgroundColor: 'rgba(240, 160, 32, 0.1)',
    tension: 0.1,
    pointRadius: 0
  }]
}))

const velocityChartData = computed(() => ({
  labels: engine.dataHistory.map(d => d.time.toFixed(1)),
  datasets: [
    {
      label: '速度 (m/s)',
      data: engine.dataHistory.map(d => d.velocity),
      borderColor: '#18a058',
      backgroundColor: 'rgba(24, 160, 88, 0.1)',
      tension: 0.1,
      pointRadius: 0
    },
    {
      label: '终端速度 (m/s)',
      data: engine.dataHistory.map(() => engine.getTerminalVelocity()),
      borderColor: '#d03050',
      borderDash: [5, 5],
      pointRadius: 0,
      fill: false
    }
  ]
}))

const forceChartData = computed(() => ({
  labels: engine.dataHistory.map(d => d.time.toFixed(1)),
  datasets: [
    {
      label: '重力 (N)',
      data: engine.dataHistory.map(d => d.gravityForce),
      borderColor: '#f0a020',
      tension: 0.1,
      pointRadius: 0
    },
    {
      label: '空气阻力 (N)',
      data: engine.dataHistory.map(d => d.airResistance),
      borderColor: '#2080f0',
      tension: 0.1,
      pointRadius: 0
    },
    {
      label: '合力 (N)',
      data: engine.dataHistory.map(d => d.totalForce),
      borderColor: '#18a058',
      tension: 0.1,
      pointRadius: 0
    }
  ]
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  animation: false,
  scales: {
    x: {
      title: { display: true, text: '时间 (s)' }
    },
    y: {
      title: { display: true, text: '数值' }
    }
  },
  plugins: {
    legend: { display: true, position: 'top' }
  }
}

function handleDropdownSelect(key) {
  if (key === 'save') {
    showSaveModal.value = true
  } else if (key === 'record') {
    tools.showSaveRecordModal = true
  } else if (key === 'template') {
    tools.showSaveTemplateModal = true
  }
}

function updateParams() {
  if (!isRunning.value) {
    engine.setParams(params)
    engine.reset()
    currentData.position = params.h0
    currentData.velocity = params.v0
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
  currentData.position = params.h0
  currentData.velocity = params.v0
  currentData.acceleration = 0
  currentData.energy = 0
  currentData.time = 0
  currentData.hasLanded = false
  currentData.landTime = null
  draw()
}

function animate(currentTime = performance.now()) {
  if (!isRunning.value) return
  
  const deltaTime = Math.min((currentTime - lastTime) / 1000, 0.05)
  lastTime = currentTime
  
  const subSteps = 10
  const dt = deltaTime / subSteps
  
  for (let i = 0; i < subSteps; i++) {
    const state = engine.update(dt)
    if (i === subSteps - 1) {
      Object.assign(currentData, state)
      currentData.time = engine.time
    }
  }
  
  draw()
  
  if (currentData.hasLanded) {
    isRunning.value = false
    return
  }
  
  animationId = requestAnimationFrame(animate)
}

function draw() {
  const canvas = canvasRef.value
  if (!canvas) return
  
  const ctx = canvas.getContext('2d')
  const width = canvas.width
  const height = canvas.height
  
  const gradient = ctx.createLinearGradient(0, 0, 0, height)
  gradient.addColorStop(0, '#1a1a2e')
  gradient.addColorStop(1, '#16213e')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)
  
  const groundY = height - 50
  const scale = (groundY - 50) / params.h0
  const centerX = width / 2
  
  ctx.fillStyle = '#2d4a3e'
  ctx.fillRect(0, groundY, width, 50)
  
  ctx.fillStyle = '#3d5a4e'
  for (let i = 0; i < width; i += 20) {
    ctx.beginPath()
    ctx.moveTo(i, groundY)
    ctx.lineTo(i + 10, groundY - 8)
    ctx.lineTo(i + 20, groundY)
    ctx.fill()
  }
  
  const ballY = groundY - currentData.position * scale
  const ballRadius = 15 + params.m * 0.5
  
  if (showTrajectory.value && engine.dataHistory.length > 1) {
    ctx.beginPath()
    ctx.strokeStyle = 'rgba(240, 160, 32, 0.3)'
    ctx.lineWidth = 2
    engine.dataHistory.forEach((point, index) => {
      const x = centerX + (index - engine.dataHistory.length / 2) * 2
      const y = groundY - point.position * scale
      if (index === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })
    ctx.stroke()
  }
  
  ctx.beginPath()
  const ballGradient = ctx.createRadialGradient(
    centerX - ballRadius * 0.3, ballY - ballRadius * 0.3, 0,
    centerX, ballY, ballRadius
  )
  ballGradient.addColorStop(0, '#ffd700')
  ballGradient.addColorStop(1, '#f0a020')
  ctx.fillStyle = ballGradient
  ctx.arc(centerX, ballY, ballRadius, 0, Math.PI * 2)
  ctx.fill()
  
  if (Math.abs(currentData.velocity) > 0.01 && !currentData.hasLanded) {
    const arrowLength = Math.min(currentData.velocity * 2, 50)
    ctx.beginPath()
    ctx.strokeStyle = '#18a058'
    ctx.lineWidth = 3
    ctx.moveTo(centerX + 50, ballY)
    ctx.lineTo(centerX + 50, ballY + arrowLength)
    ctx.stroke()
    
    ctx.beginPath()
    ctx.moveTo(centerX + 45, ballY + arrowLength - 10)
    ctx.lineTo(centerX + 50, ballY + arrowLength)
    ctx.lineTo(centerX + 55, ballY + arrowLength - 10)
    ctx.stroke()
  }
  
  if (params.useAirResistance && currentData.airResistance > 0.1) {
    const arrowLength = Math.min(currentData.airResistance * 5, 30)
    ctx.beginPath()
    ctx.strokeStyle = '#2080f0'
    ctx.lineWidth = 3
    ctx.moveTo(centerX - 50, ballY)
    ctx.lineTo(centerX - 50, ballY - arrowLength)
    ctx.stroke()
    
    ctx.beginPath()
    ctx.moveTo(centerX - 55, ballY - arrowLength + 10)
    ctx.lineTo(centerX - 50, ballY - arrowLength)
    ctx.lineTo(centerX - 45, ballY - arrowLength + 10)
    ctx.stroke()
  }
  
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
  ctx.fillRect(centerX + 80, ballY - 30, 120, 60)
  ctx.fillStyle = '#fff'
  ctx.font = '12px Arial'
  ctx.fillText(`v: ${currentData.velocity.toFixed(2)} m/s`, centerX + 90, ballY - 10)
  ctx.fillText(`h: ${currentData.position.toFixed(2)} m`, centerX + 90, ballY + 10)
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
  store.saveSimulation('free-fall', saveName.value, { ...params })
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

onMounted(() => {
  resizeCanvas()
  window.addEventListener('resize', resizeCanvas)
  engine.reset()
  draw()
  tools.checkReproduceParams(resetSimulation)
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

.landed-badge {
  position: absolute;
  top: 16px;
  right: 16px;
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
