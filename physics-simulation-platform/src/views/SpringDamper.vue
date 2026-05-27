<template>
  <div class="simulation-container">
    <div class="simulation-header">
      <h1 class="simulation-title">弹簧阻尼仿真</h1>
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
              <n-switch v-model:value="showTrajectory" />
              <span>显示轨迹</span>
            </n-space>
          </div>
        </div>

        <div class="data-display">
          <n-grid :cols="3" :x-gap="16" :y-gap="16">
            <n-grid-item>
              <n-statistic label="位置 (x)" :value="currentData.position.toFixed(3)" suffix="m" />
            </n-grid-item>
            <n-grid-item>
              <n-statistic label="速度 (v)" :value="currentData.velocity.toFixed(3)" suffix="m/s" />
            </n-grid-item>
            <n-grid-item>
              <n-statistic label="加速度 (a)" :value="currentData.acceleration.toFixed(3)" suffix="m/s²" />
            </n-grid-item>
            <n-grid-item>
              <n-statistic label="能量 (E)" :value="currentData.energy.toFixed(2)" suffix="J" />
            </n-grid-item>
            <n-grid-item>
              <n-statistic label="固有频率 (ω₀)" :value="engine.getNaturalFrequency().toFixed(3)" suffix="rad/s" />
            </n-grid-item>
            <n-grid-item>
              <n-statistic label="阻尼比 (ζ)" :value="engine.getDampingRatio().toFixed(3)" />
            </n-grid-item>
          </n-grid>
        </div>

        <div class="charts-container">
          <n-tabs type="line" size="large">
            <n-tab-pane name="position" tab="位移-时间">
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
              <label>弹簧刚度 (k): {{ params.k.toFixed(1) }} N/m</label>
              <n-slider v-model:value="params.k" :min="10" :max="200" :step="1" @update:value="updateParams" />
            </div>
            <div>
              <label>质量 (m): {{ params.m.toFixed(2) }} kg</label>
              <n-slider v-model:value="params.m" :min="0.1" :max="10" :step="0.1" @update:value="updateParams" />
            </div>
            <div>
              <label>阻尼系数 (b): {{ params.b.toFixed(2) }} N·s/m</label>
              <n-slider v-model:value="params.b" :min="0" :max="20" :step="0.1" @update:value="updateParams" />
            </div>
            <div>
              <label>重力加速度 (g): {{ params.g.toFixed(2) }} m/s²</label>
              <n-slider v-model:value="params.g" :min="1" :max="20" :step="0.1" @update:value="updateParams" />
            </div>
            <div>
              <label>初始位移 (x₀): {{ params.x0.toFixed(2) }} m</label>
              <n-slider v-model:value="params.x0" :min="-1" :max="1" :step="0.01" @update:value="updateParams" />
            </div>
            <div>
              <label>初始速度 (v₀): {{ params.v0.toFixed(2) }} m/s</label>
              <n-slider v-model:value="params.v0" :min="-5" :max="5" :step="0.1" @update:value="updateParams" />
            </div>
          </n-space>
        </n-card>

        <n-card title="公式说明" :bordered="false" style="margin-top: 16px;">
          <div class="formula">
            <p><strong>运动方程：</strong></p>
            <p>mx'' + bx' + kx = mg</p>
            <br>
            <p><strong>固有频率：</strong></p>
            <p>ω₀ = √(k/m)</p>
            <br>
            <p><strong>阻尼比：</strong></p>
            <p>ζ = b / (2√(km))</p>
            <br>
            <p><strong>能量：</strong></p>
            <p>E = ½mv² + ½kx² + mgh</p>
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
          <n-button type="primary" @click="saveAsRecord">保存</n-button>
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
                <n-button size="small" type="primary" @click="applyTemplate(template)">应用</n-button>
              </n-space>
            </template>
          </n-list-item>
        </n-list>
        <n-empty v-else description="暂无弹簧阻尼实验模板" />
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
          <n-button type="primary" @click="generateAndDownloadReport">生成并下载</n-button>
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
import { SpringDamperEngine } from '../engines/SpringDamperEngine'
import { Line } from 'vue-chartjs'
import { useMessage } from 'naive-ui'
import { useRouter } from 'vue-router'
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
const message = useMessage()
const router = useRouter()

const canvasRef = ref(null)
const isRunning = ref(false)
const showTrajectory = ref(true)
const showSaveModal = ref(false)
const showLoadModal = ref(false)
const showSaveRecordModal = ref(false)
const showSaveTemplateModal = ref(false)
const showLoadTemplateModal = ref(false)
const showGenerateReportModal = ref(false)
const showAddToCompare = ref(false)
const saveName = ref('')

const dropdownOptions = [
  { label: '保存为存档', key: 'save' },
  { label: '保存为实验台账', key: 'record' },
  { label: '保存为实验模板', key: 'template' }
]

const recordForm = reactive({
  title: '',
  experimenter: '',
  purpose: '',
  notes: ''
})

const templateForm = reactive({
  name: '',
  description: ''
})

const reportForm = reactive({
  title: '',
  experimenter: '',
  purpose: '',
  principle: '',
  conclusion: ''
})

const params = reactive({
  k: 50,
  m: 1.0,
  b: 0.5,
  g: 9.8,
  x0: 0.5,
  v0: 0
})

const currentData = reactive({
  position: params.x0,
  velocity: params.v0,
  acceleration: 0,
  energy: 0,
  time: 0,
  equilibrium: 0,
  springForce: 0,
  dampingForce: 0,
  totalForce: 0
})

const engine = new SpringDamperEngine(params)
let animationId = null
let lastTime = 0

const savedSims = computed(() => store.getSimulationsByType('spring-damper'))
const availableTemplates = computed(() => store.getTemplatesByType('spring-damper'))
const currentCompareInfo = computed(() => ({
  params: { ...params }
}))

const positionChartData = computed(() => ({
  labels: engine.dataHistory.map(d => d.time.toFixed(1)),
  datasets: [
    {
      label: '位移 (m)',
      data: engine.dataHistory.map(d => d.position),
      borderColor: '#2080f0',
      backgroundColor: 'rgba(32, 128, 240, 0.1)',
      tension: 0.1,
      pointRadius: 0
    },
    {
      label: '平衡位置 (m)',
      data: engine.dataHistory.map(() => engine.equilibrium),
      borderColor: '#f0a020',
      borderDash: [5, 5],
      pointRadius: 0,
      fill: false
    }
  ]
}))

const velocityChartData = computed(() => ({
  labels: engine.dataHistory.map(d => d.time.toFixed(1)),
  datasets: [{
    label: '速度 (m/s)',
    data: engine.dataHistory.map(d => d.velocity),
    borderColor: '#18a058',
    backgroundColor: 'rgba(24, 160, 88, 0.1)',
    tension: 0.1,
    pointRadius: 0
  }]
}))

const forceChartData = computed(() => ({
  labels: engine.dataHistory.map(d => d.time.toFixed(1)),
  datasets: [
    {
      label: '弹簧力 (N)',
      data: engine.dataHistory.map(d => d.springForce),
      borderColor: '#2080f0',
      tension: 0.1,
      pointRadius: 0
    },
    {
      label: '阻尼力 (N)',
      data: engine.dataHistory.map(d => d.dampingForce),
      borderColor: '#d03050',
      tension: 0.1,
      pointRadius: 0
    },
    {
      label: '合力 (N)',
      data: engine.dataHistory.map(d => d.totalForce),
      borderColor: '#f0a020',
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

function updateParams() {
  if (!isRunning.value) {
    engine.setParams(params)
    engine.reset()
    currentData.position = params.x0
    currentData.velocity = params.v0
    currentData.equilibrium = engine.equilibrium
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
  currentData.position = params.x0
  currentData.velocity = params.v0
  currentData.acceleration = 0
  currentData.energy = 0
  currentData.time = 0
  currentData.equilibrium = engine.equilibrium
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
  
  const fixedY = height * 0.2
  const scale = height * 0.3
  const centerX = width / 2
  
  const equilibriumY = fixedY + engine.equilibrium * scale
  ctx.beginPath()
  ctx.strokeStyle = 'rgba(240, 160, 32, 0.5)'
  ctx.setLineDash([5, 5])
  ctx.moveTo(centerX - 100, equilibriumY)
  ctx.lineTo(centerX + 100, equilibriumY)
  ctx.stroke()
  ctx.setLineDash([])
  
  const bobY = fixedY + currentData.position * scale
  const springLength = bobY - fixedY
  const coils = 10
  const coilWidth = 30
  
  ctx.beginPath()
  ctx.strokeStyle = '#888'
  ctx.lineWidth = 3
  ctx.moveTo(centerX, fixedY)
  
  for (let i = 0; i <= coils; i++) {
    const y = fixedY + (springLength * i) / coils
    const x = centerX + (i % 2 === 0 ? -coilWidth : coilWidth)
    ctx.lineTo(x, y)
  }
  
  ctx.lineTo(centerX, bobY)
  ctx.stroke()
  
  if (showTrajectory.value && engine.dataHistory.length > 1) {
    ctx.beginPath()
    ctx.strokeStyle = 'rgba(32, 128, 240, 0.3)'
    ctx.lineWidth = 2
    engine.dataHistory.forEach((point, index) => {
      const x = centerX + (index - engine.dataHistory.length / 2) * 2
      const y = fixedY + point.position * scale
      if (index === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })
    ctx.stroke()
  }
  
  ctx.beginPath()
  ctx.fillStyle = '#2080f0'
  ctx.arc(centerX, bobY, 20 + params.m * 3, 0, Math.PI * 2)
  ctx.fill()
  
  ctx.fillStyle = '#444'
  ctx.fillRect(centerX - 80, fixedY - 20, 160, 20)
  
  if (Math.abs(currentData.velocity) > 0.01) {
    const arrowLength = currentData.velocity * 30
    ctx.beginPath()
    ctx.strokeStyle = '#18a058'
    ctx.lineWidth = 3
    ctx.moveTo(centerX + 60, bobY)
    ctx.lineTo(centerX + 60, bobY + arrowLength)
    ctx.stroke()
    
    if (arrowLength > 0) {
      ctx.beginPath()
      ctx.moveTo(centerX + 55, bobY + arrowLength - 10)
      ctx.lineTo(centerX + 60, bobY + arrowLength)
      ctx.lineTo(centerX + 65, bobY + arrowLength - 10)
      ctx.stroke()
    } else {
      ctx.beginPath()
      ctx.moveTo(centerX + 55, bobY + arrowLength + 10)
      ctx.lineTo(centerX + 60, bobY + arrowLength)
      ctx.lineTo(centerX + 65, bobY + arrowLength + 10)
      ctx.stroke()
    }
  }
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
  store.saveSimulation('spring-damper', saveName.value, { ...params })
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
  if (key === 'save') {
    showSaveModal.value = true
  } else if (key === 'record') {
    showSaveRecordModal.value = true
  } else if (key === 'template') {
    showSaveTemplateModal.value = true
  }
}

function saveAsRecord() {
  if (!recordForm.title.trim()) {
    message.warning('请输入实验名称')
    return
  }
  const latestData = engine.dataHistory[engine.dataHistory.length - 1]
  const results = latestData ? {
    最终位移: latestData.position,
    最终速度: latestData.velocity,
    最终能量: latestData.energy,
    运行时间: latestData.time,
    固有频率: engine.getNaturalFrequency(),
    阻尼比: engine.getDampingRatio()
  } : {}
  
  store.saveExperimentRecord({
    title: recordForm.title,
    simulationType: 'spring-damper',
    experimenter: recordForm.experimenter,
    purpose: recordForm.purpose,
    principle: '基于弹簧阻尼运动方程 mx\'\' + bx\' + kx = mg',
    notes: recordForm.notes,
    params: { ...params },
    results,
    conclusion: ''
  })
  message.success('实验台账保存成功')
  showSaveRecordModal.value = false
  resetRecordForm()
}

function resetRecordForm() {
  recordForm.title = ''
  recordForm.experimenter = ''
  recordForm.purpose = ''
  recordForm.notes = ''
}

function saveAsTemplate() {
  if (!templateForm.name.trim()) {
    message.warning('请输入模板名称')
    return
  }
  store.saveTemplate({
    name: templateForm.name,
    simulationType: 'spring-damper',
    description: templateForm.description,
    params: { ...params }
  })
  message.success('实验模板保存成功')
  showSaveTemplateModal.value = false
  resetTemplateForm()
}

function resetTemplateForm() {
  templateForm.name = ''
  templateForm.description = ''
}

function applyTemplate(template) {
  Object.assign(params, template.params)
  resetSimulation()
  showLoadTemplateModal.value = false
  message.success('模板已应用')
}

function generateAndDownloadReport() {
  if (!reportForm.title.trim()) {
    message.warning('请输入实验名称')
    return
  }
  const latestData = engine.dataHistory[engine.dataHistory.length - 1]
  const results = latestData ? {
    最终位移: latestData.position,
    最终速度: latestData.velocity,
    最终能量: latestData.energy,
    运行时间: latestData.time,
    固有频率: engine.getNaturalFrequency(),
    阻尼比: engine.getDampingRatio()
  } : {}
  
  const record = {
    title: reportForm.title,
    simulationType: 'spring-damper',
    experimenter: reportForm.experimenter,
    purpose: reportForm.purpose,
    principle: reportForm.principle,
    notes: '',
    params: { ...params },
    results,
    conclusion: reportForm.conclusion,
    createdAt: Date.now()
  }
  store.downloadReport(record)
  message.success('实验报告已生成并下载')
  showGenerateReportModal.value = false
  resetReportForm()
}

function resetReportForm() {
  reportForm.title = ''
  reportForm.experimenter = ''
  reportForm.purpose = ''
  reportForm.principle = ''
  reportForm.conclusion = ''
}

function confirmAddToCompare() {
  const item = {
    id: `current_${Date.now()}`,
    type: 'current',
    simulationType: 'spring-damper',
    name: '当前实验参数',
    params: { ...params }
  }
  if (store.addToComparison(item)) {
    message.success('已加入对比列表')
    showAddToCompare.value = false
  }
}

function checkReproduceParams() {
  try {
    const reproduceData = sessionStorage.getItem('reproduce_params')
    if (reproduceData) {
      const data = JSON.parse(reproduceData)
      if (data.type === 'spring-damper' && data.params) {
        Object.assign(params, data.params)
        message.success('已复现实验参数')
        sessionStorage.removeItem('reproduce_params')
      }
    }
  } catch (e) {
    console.error('Failed to load reproduce params:', e)
  }
}

onMounted(() => {
  resizeCanvas()
  window.addEventListener('resize', resizeCanvas)
  engine.reset()
  currentData.equilibrium = engine.equilibrium
  draw()
  checkReproduceParams()
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
