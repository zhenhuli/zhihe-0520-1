<template>
  <div class="simulation-container">
    <div class="simulation-header">
      <h1 class="simulation-title">磁场分布仿真</h1>
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
              <n-switch v-model:value="showFieldLines" />
              <span>显示磁力线</span>
            </n-space>
          </div>
        </div>

        <div class="data-display">
          <n-grid :cols="3" :x-gap="16" :y-gap="16">
            <n-grid-item>
              <n-statistic label="电流导线数" :value="params.wires.length" suffix="条" />
            </n-grid-item>
            <n-grid-item>
              <n-statistic label="磁体数" :value="params.magnets.length" suffix="个" />
            </n-grid-item>
            <n-grid-item>
              <n-statistic label="网格精度" :value="params.gridSize" suffix="×" />
            </n-grid-item>
          </n-grid>
        </div>

        <div class="charts-container">
          <n-tabs type="line" size="large">
            <n-tab-pane name="fieldX" tab="Bx分布">
              <div class="chart-wrapper">
                <Line :data="fieldXChartData" :options="chartOptions" />
              </div>
            </n-tab-pane>
            <n-tab-pane name="fieldY" tab="By分布">
              <div class="chart-wrapper">
                <Line :data="fieldYChartData" :options="chartOptions" />
              </div>
            </n-tab-pane>
            <n-tab-pane name="magnitude" tab="磁场强度">
              <div class="chart-wrapper">
                <Line :data="magnitudeChartData" :options="magnitudeChartOptions" />
              </div>
            </n-tab-pane>
          </n-tabs>
        </div>
      </div>

      <div class="simulation-sidebar">
        <n-card title="参数设置" :bordered="false">
          <n-space vertical size="large" fill>
            <div>
              <label>网格精度: {{ params.gridSize }} × {{ params.gridSize }}</label>
              <n-slider v-model:value="params.gridSize" :min="20" :max="60" :step="5" @update:value="updateParams" />
            </div>
            <div>
              <label>区域大小: {{ params.domainSize.toFixed(2) }} m</label>
              <n-slider v-model:value="params.domainSize" :min="1" :max="5" :step="0.5" @update:value="updateParams" />
            </div>
          </n-space>
        </n-card>

        <n-card title="电流导线" :bordered="false" style="margin-top: 16px;">
          <div class="source-list">
            <div v-for="(wire, idx) in params.wires" :key="idx" class="source-item">
              <div class="source-row">
                <label>位置 (x):</label>
                <n-input-number v-model:value="wire.x" :min="0" :max="params.domainSize" :step="0.1" style="width: 100px;" @update:value="updateParams" />
                <label>电流:</label>
                <n-input-number v-model:value="wire.current" :min="-5" :max="5" :step="0.1" style="width: 100px;" @update:value="updateParams" />
                <n-button size="small" type="error" @click="removeWire(idx)">✕</n-button>
              </div>
            </div>
          </div>
          <n-button style="width: 100%; margin-top: 8px;" @click="addWire">+ 添加导线</n-button>
        </n-card>

        <n-card title="磁体" :bordered="false" style="margin-top: 16px;">
          <div class="source-list">
            <div v-for="(magnet, idx) in params.magnets" :key="idx" class="source-item">
              <div class="source-row">
                <label>强度:</label>
                <n-input-number v-model:value="magnet.strength" :min="0" :max="5" :step="0.1" style="width: 100px;" @update:value="updateParams" />
                <label>方向:</label>
                <n-input-number v-model:value="magnet.orientation" :min="0" :max="360" :step="5" style="width: 100px;" @update:value="updateParams" />
                <n-button size="small" type="error" @click="removeMagnet(idx)">✕</n-button>
              </div>
            </div>
          </div>
          <n-button style="width: 100%; margin-top: 8px;" @click="addMagnet">+ 添加磁体</n-button>
        </n-card>

        <n-card title="公式说明" :bordered="false" style="margin-top: 16px;">
          <div class="formula">
            <p><strong>毕奥-萨伐尔定律：</strong></p>
            <p>dB = (μ₀/4π)·(Idl×r̂)/r²</p>
            <br>
            <p><strong>长直导线磁场：</strong></p>
            <p>B = μ₀I/(2πr)</p>
            <br>
            <p><strong>磁偶极子场：</strong></p>
            <p>B = μ₀/(4π)·[3(m·r̂)r̂ - m]/r³</p>
            <br>
            <p><strong>安培力：</strong></p>
            <p>F = IL×B</p>
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
          <n-button type="primary" @click="saveAsRecord('基于毕奥-萨伐尔定律，载流导线产生的磁场 dB = (μ₀/4π) × (Idl × r̂)/r²')">保存</n-button>
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
        <n-empty v-else description="暂无磁场分布实验模板" />
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
          <n-button type="primary" @click="generateAndDownloadReport('基于毕奥-萨伐尔定律，载流导线产生的磁场 dB = (μ₀/4π) × (Idl × r̂)/r²')">生成并下载</n-button>
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
import { MagneticFieldEngine } from '../engines/MagneticFieldEngine'
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
const showFieldLines = ref(true)
const showSaveModal = ref(false)
const showLoadModal = ref(false)
const saveName = ref('')

const dropdownOptions = [
  { label: '保存为台账记录', key: 'saveRecord' },
  { label: '保存为实验模板', key: 'saveTemplate' }
]

const params = reactive({
  gridSize: 40,
  domainSize: 2.0,
  wires: [
    { x: 0.5, y: 0.5, current: 2.0, radius: 0.05 },
    { x: 1.5, y: 0.5, current: -2.0, radius: 0.05 }
  ],
  magnets: [
    { x: 0.25, y: 1.5, orientation: 0, strength: 1.0, size: 0.3 }
  ]
})

const engine = new MagneticFieldEngine(params)

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
  'magnetic-field',
  params,
  engine,
  () => ({
    '导线数量': params.wires.length,
    '磁铁数量': params.magnets.length,
    '网格大小': `${params.gridSize} × ${params.gridSize}`,
    '区域大小': `${params.domainSize} m × ${params.domainSize} m`
  })
)
let animationId = null
let lastTime = 0

const savedSims = computed(() => store.getSimulationsByType('magnetic-field'))

const fieldXChartData = computed(() => {
  const data = engine.fieldData
  const middleRow = params.gridSize / 2
  const rowData = data.slice(middleRow * params.gridSize, (middleRow + 1) * params.gridSize)
  return {
    labels: rowData.map(d => d.x.toFixed(2)),
    datasets: [{
      label: 'Bx (T)',
      data: rowData.map(d => d.Bx),
      borderColor: '#2080f0',
      backgroundColor: 'rgba(32, 128, 240, 0.1)',
      tension: 0.1,
      pointRadius: 0
    }]
  }
})

const fieldYChartData = computed(() => {
  const data = engine.fieldData
  const middleRow = params.gridSize / 2
  const rowData = data.slice(middleRow * params.gridSize, (middleRow + 1) * params.gridSize)
  return {
    labels: rowData.map(d => d.x.toFixed(2)),
    datasets: [{
      label: 'By (T)',
      data: rowData.map(d => d.By),
      borderColor: '#18a058',
      backgroundColor: 'rgba(24, 160, 88, 0.1)',
      tension: 0.1,
      pointRadius: 0
    }]
  }
})

const magnitudeChartData = computed(() => {
  const data = engine.fieldData
  const middleRow = params.gridSize / 2
  const rowData = data.slice(middleRow * params.gridSize, (middleRow + 1) * params.gridSize)
  return {
    labels: rowData.map(d => d.x.toFixed(2)),
    datasets: [{
      label: '|B| (T)',
      data: rowData.map(d => d.magnitude),
      borderColor: '#f0a020',
      backgroundColor: 'rgba(240, 160, 32, 0.1)',
      tension: 0.1,
      pointRadius: 0,
      fill: true
    }]
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  animation: false,
  scales: {
    x: {
      title: { display: true, text: 'x (m)' }
    },
    y: {
      title: { display: true, text: '磁场 (T)' }
    }
  },
  plugins: {
    legend: { display: true, position: 'top' }
  }
}

const magnitudeChartOptions = {
  ...chartOptions,
  scales: {
    ...chartOptions.scales,
    y: {
      title: { display: true, text: '|B| (T)' },
      min: 0
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

function addWire() {
  params.wires.push({
    x: params.domainSize * 0.5,
    y: params.domainSize * 0.5,
    current: 1.0,
    radius: 0.05
  })
  updateParams()
}

function removeWire(idx) {
  if (params.wires.length > 0) {
    params.wires.splice(idx, 1)
    updateParams()
  }
}

function addMagnet() {
  params.magnets.push({
    x: params.domainSize * 0.5,
    y: params.domainSize * 0.5,
    orientation: 0,
    strength: 1.0,
    size: 0.3
  })
  updateParams()
}

function removeMagnet(idx) {
  if (params.magnets.length > 0) {
    params.magnets.splice(idx, 1)
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

  const padding = 40
  const plotWidth = width - padding * 2
  const plotHeight = height - padding * 2
  const scale = Math.min(plotWidth, plotHeight) / params.domainSize

  const offsetX = (width - plotWidth) / 2
  const offsetY = (height - plotHeight) / 2

  ctx.strokeStyle = '#333'
  ctx.lineWidth = 1
  for (let i = 0; i <= params.gridSize; i += 5) {
    const x = offsetX + (i / params.gridSize) * plotWidth
    ctx.beginPath()
    ctx.moveTo(x, offsetY)
    ctx.lineTo(x, offsetY + plotHeight)
    ctx.stroke()

    const y = offsetY + (i / params.gridSize) * plotHeight
    ctx.beginPath()
    ctx.moveTo(offsetX, y)
    ctx.lineTo(offsetX + plotWidth, y)
    ctx.stroke()
  }

  const data = engine.fieldData
  if (data.length) {
    const cellWidth = plotWidth / params.gridSize
    const cellHeight = plotHeight / params.gridSize

    for (let i = 0; i < params.gridSize; i++) {
      for (let j = 0; j < params.gridSize; j++) {
        const idx = j * params.gridSize + i
        const cell = data[idx]
        const intensity = cell.magnitude / engine.maxField
        const hue = 240 - intensity * 240
        const x = offsetX + i * cellWidth
        const y = offsetY + j * cellHeight

        ctx.fillStyle = `hsla(${hue}, 80%, 50%, ${intensity * 0.3})`
        ctx.fillRect(x, y, cellWidth + 1, cellHeight + 1)
      }
    }

    if (showFieldLines.value) {
      const step = 3
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)'
      ctx.lineWidth = 1
      for (let i = step; i < params.gridSize - step; i += step) {
        for (let j = step; j < params.gridSize - step; j += step) {
          const idx = j * params.gridSize + i
          const cell = data[idx]
          const magnitude = Math.sqrt(cell.Bx * cell.Bx + cell.By * cell.By)

          if (magnitude > 0.0001) {
            const x = offsetX + i * cellWidth
            const y = offsetY + j * cellHeight
            const dx = (cell.Bx / magnitude) * cellWidth * step * 0.8
            const dy = (cell.By / magnitude) * cellHeight * step * 0.8

            ctx.beginPath()
            ctx.moveTo(x - dx / 2, y - dy / 2)
            ctx.lineTo(x + dx / 2, y + dy / 2)
            ctx.stroke()
          }
        }
      }
    }
  }

  for (const wire of params.wires) {
    const x = offsetX + wire.x * scale
    const y = offsetY + wire.y * scale

    ctx.beginPath()
    ctx.arc(x, y, 12, 0, Math.PI * 2)
    ctx.fillStyle = wire.current >= 0 ? '#18a058' : '#f0a020'
    ctx.fill()
    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 2
    ctx.stroke()

    ctx.fillStyle = '#fff'
    ctx.font = 'bold 12px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(wire.current >= 0 ? '⊙' : '⊗', x, y + 4)
    ctx.font = '10px sans-serif'
    ctx.fillText(`${wire.current.toFixed(1)}A`, x, y + 22)
  }

  for (const magnet of params.magnets) {
    const x = offsetX + magnet.x * scale
    const y = offsetY + magnet.y * scale
    const size = magnet.size * scale

    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(magnet.orientation * Math.PI / 180)

    ctx.fillStyle = '#d03050'
    ctx.fillRect(-size / 2, -size / 4, size / 2, size / 2)
    ctx.fillStyle = '#2080d0'
    ctx.fillRect(0, -size / 4, size / 2, size / 2)

    ctx.fillStyle = '#fff'
    ctx.font = 'bold 14px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('N', -size / 4, 5)
    ctx.fillText('S', size / 4, 5)

    ctx.restore()
  }

  ctx.fillStyle = '#666'
  ctx.font = '12px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('0', offsetX - 15, offsetY + plotHeight + 20)
  ctx.fillText(params.domainSize.toFixed(1) + 'm', offsetX + plotWidth - 25, offsetY + plotHeight + 20)
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
  store.saveSimulation('magnetic-field', saveName.value, {
    gridSize: params.gridSize,
    domainSize: params.domainSize,
    wires: JSON.parse(JSON.stringify(params.wires)),
    magnets: JSON.parse(JSON.stringify(params.magnets))
  })
  saveName.value = ''
  showSaveModal.value = false
}

function loadSimulation(sim) {
  Object.assign(params, sim.params)
  params.wires = JSON.parse(JSON.stringify(sim.params.wires || []))
  params.magnets = JSON.parse(JSON.stringify(sim.params.magnets || []))
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

.source-list {
  max-height: 200px;
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