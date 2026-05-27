<template>
  <div class="simulation-container">
    <div class="simulation-header">
      <h1 class="simulation-title">声音频谱仿真</h1>
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
              <n-statistic label="采样率" :value="params.sampleRate" suffix="Hz" />
            </n-grid-item>
            <n-grid-item>
              <n-statistic label="FFT点数" :value="params.bufferSize" suffix="点" />
            </n-grid-item>
            <n-grid-item>
              <n-statistic label="奈奎斯特频率" :value="engine.calculateNyquistFrequency().toFixed(0)" suffix="Hz" />
            </n-grid-item>
            <n-grid-item>
              <n-statistic label="频率分辨率" :value="engine.calculateFrequencyResolution().toFixed(2)" suffix="Hz" />
            </n-grid-item>
          </n-grid>
        </div>

        <div class="charts-container">
          <n-tabs type="line" size="large">
            <n-tab-pane name="waveform" tab="时域波形">
              <div class="chart-wrapper">
                <Line :data="waveformChartData" :options="waveformChartOptions" />
              </div>
            </n-tab-pane>
            <n-tab-pane name="spectrum" tab="频域频谱">
              <div class="chart-wrapper">
                <Bar :data="spectrumChartData" :options="spectrumChartOptions" />
              </div>
            </n-tab-pane>
            <n-tab-pane name="spectrumDb" tab="频谱(dB)">
              <div class="chart-wrapper">
                <Line :data="spectrumDbChartData" :options="spectrumDbChartOptions" />
              </div>
            </n-tab-pane>
          </n-tabs>
        </div>
      </div>

      <div class="simulation-sidebar">
        <n-card title="参数设置" :bordered="false">
          <n-space vertical size="large" fill>
            <div>
              <label>采样率: {{ params.sampleRate }} Hz</label>
              <n-slider v-model:value="params.sampleRate" :min="8000" :max="96000" :step="1000" @update:value="updateParams" />
            </div>
            <div>
              <label>FFT点数: {{ params.bufferSize }}</label>
              <n-slider v-model:value="params.bufferSize" :min="256" :max="4096" :step="256" @update:value="updateParams" />
            </div>
            <div>
              <label>噪声水平: {{ params.noiseLevel.toFixed(3) }}</label>
              <n-slider v-model:value="params.noiseLevel" :min="0" :max="0.5" :step="0.01" @update:value="updateParams" />
            </div>
          </n-space>
        </n-card>

        <n-card title="频率成分" :bordered="false" style="margin-top: 16px;">
          <div class="frequency-list">
            <div v-for="(freq, idx) in params.frequencies" :key="idx" class="freq-item">
              <div class="freq-row">
                <n-input-number v-model:value="params.frequencies[idx]" :min="20" :max="20000" :step="1" style="width: 120px;" @update:value="updateParams" />
                <n-input-number v-model:value="params.amplitudes[idx]" :min="0" :max="1" :step="0.1" style="width: 80px;" @update:value="updateParams" />
                <n-button size="small" type="error" @click="removeFreq(idx)">✕</n-button>
              </div>
              <div class="freq-labels">
                <span>频率: {{ freq }} Hz</span>
                <span>波长: {{ (engine.calculateWavelength(freq) * 100).toFixed(2) }} cm</span>
                <span>周期: {{ (engine.calculatePeriod(freq) * 1000).toFixed(3) }} ms</span>
              </div>
            </div>
          </div>
          <n-button style="width: 100%; margin-top: 8px;" @click="addFreq">+ 添加频率</n-button>
        </n-card>

        <n-card title="公式说明" :bordered="false" style="margin-top: 16px;">
          <div class="formula">
            <p><strong>采样定理：</strong></p>
            <p>fs ≥ 2f_max</p>
            <br>
            <p><strong>频率分辨率：</strong></p>
            <p>Δf = fs / N</p>
            <br>
            <p><strong>声速与波长：</strong></p>
            <p>λ = c / f</p>
            <p>c = 343 m/s (空气中)</p>
            <br>
            <p><strong>FFT变换：</strong></p>
            <p>X[k] = Σ x[n]·e^(-j2πkn/N)</p>
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
          <n-button type="primary" @click="saveAsRecord('基于傅里叶变换的声音频谱分析')">保存</n-button>
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
        <n-empty v-else description="暂无声音频谱实验模板" />
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
          <n-button type="primary" @click="generateAndDownloadReport('基于傅里叶变换的声音频谱分析')">生成并下载</n-button>
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
import { SoundSpectrumEngine } from '../engines/SoundSpectrumEngine'
import { useExperimentTools } from '../composables/useExperimentTools'
import { useRoute } from 'vue-router'
import { Line, Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
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
  sampleRate: 44100,
  bufferSize: 1024,
  frequencies: [440, 880],
  amplitudes: [0.8, 0.4],
  phases: [0, Math.PI / 4],
  noiseLevel: 0.05
})

const engine = new SoundSpectrumEngine(params)

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
  'sound-spectrum',
  params,
  engine,
  () => ({
    '奈奎斯特频率': engine.calculateNyquistFrequency(),
    '频率分辨率': engine.calculateFrequencyResolution(),
    '主频成分': params.frequencies.map((f, i) => `${f}Hz (A=${params.amplitudes[i]})`).join(', ')
  })
)
let animationId = null
let lastTime = 0

const savedSims = computed(() => store.getSimulationsByType('sound-spectrum'))

const waveformChartData = computed(() => {
  const wave = engine.waveform
  return {
    labels: wave.map(w => (w.time * 1000).toFixed(2)),
    datasets: [{
      label: '振幅',
      data: wave.map(w => w.value),
      borderColor: '#2080f0',
      backgroundColor: 'rgba(32, 128, 240, 0.1)',
      tension: 0.1,
      pointRadius: 0,
      fill: true
    }]
  }
})

const spectrumChartData = computed(() => {
  const spec = engine.spectrum.slice(0, 200)
  return {
    labels: spec.map(s => s.frequency.toFixed(1)),
    datasets: [{
      label: '幅度',
      data: spec.map(s => s.magnitude),
      backgroundColor: spec.map(s => {
        const hue = 240 - (s.magnitude * 240)
        return `hsla(${hue}, 80%, 50%, 0.8)`
      }),
      borderWidth: 0
    }]
  }
})

const spectrumDbChartData = computed(() => {
  const spec = engine.spectrum.slice(0, 200)
  return {
    labels: spec.map(s => s.frequency.toFixed(1)),
    datasets: [{
      label: '幅度 (dB)',
      data: spec.map(s => s.magnitudeDb),
      borderColor: '#f0a020',
      backgroundColor: 'rgba(240, 160, 32, 0.1)',
      tension: 0.1,
      pointRadius: 0,
      fill: true
    }]
  }
})

const waveformChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  animation: false,
  scales: {
    x: {
      title: { display: true, text: '时间 (ms)' }
    },
    y: {
      title: { display: true, text: '振幅' },
      min: -2,
      max: 2
    }
  },
  plugins: {
    legend: { display: false }
  }
}

const spectrumChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  animation: false,
  scales: {
    x: {
      title: { display: true, text: '频率 (Hz)' },
      ticks: { maxTicksLimit: 15 }
    },
    y: {
      title: { display: true, text: '归一化幅度' },
      min: 0,
      max: 1.1
    }
  },
  plugins: {
    legend: { display: false }
  }
}

const spectrumDbChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  animation: false,
  scales: {
    x: {
      title: { display: true, text: '频率 (Hz)' },
      ticks: { maxTicksLimit: 15 }
    },
    y: {
      title: { display: true, text: '幅度 (dB)' },
      min: -80,
      max: 0
    }
  },
  plugins: {
    legend: { display: false }
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

function addFreq() {
  params.frequencies.push(1000)
  params.amplitudes.push(0.3)
  params.phases.push(0)
  updateParams()
}

function removeFreq(idx) {
  if (params.frequencies.length > 1) {
    params.frequencies.splice(idx, 1)
    params.amplitudes.splice(idx, 1)
    params.phases.splice(idx, 1)
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

  ctx.fillStyle = '#1a1a2e'
  ctx.fillRect(0, 0, width, height)

  const wave = engine.waveform
  if (!wave.length) return

  const displayCount = Math.min(wave.length, 256)
  const startIdx = Math.max(0, wave.length - displayCount)

  ctx.strokeStyle = '#333'
  ctx.lineWidth = 1
  for (let i = 0; i <= 8; i++) {
    const y = (height / 8) * i
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(width, y)
    ctx.stroke()
  }

  const spectrum = engine.spectrum.slice(0, 200)
  if (spectrum.length) {
    const barWidth = width / spectrum.length * 0.8
    for (let i = 0; i < spectrum.length; i++) {
      const x = (i / spectrum.length) * width
      const barHeight = spectrum[i].magnitude * height * 0.3
      const hue = 240 - (spectrum[i].magnitude * 240)

      ctx.fillStyle = `hsla(${hue}, 80%, 50%, 0.6)`
      ctx.fillRect(x, height * 0.1, barWidth, barHeight)
    }
  }

  ctx.beginPath()
  ctx.strokeStyle = '#2080f0'
  ctx.lineWidth = 2
  for (let i = 0; i < displayCount; i++) {
    const idx = startIdx + i
    const x = (i / (displayCount - 1)) * width
    const y = height * 0.6 - wave[idx].value * height * 0.15

    if (i === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  }
  ctx.stroke()

  ctx.beginPath()
  ctx.strokeStyle = '#f0a020'
  ctx.lineWidth = 1
  ctx.setLineDash([5, 5])
  ctx.moveTo(0, height * 0.6)
  ctx.lineTo(width, height * 0.6)
  ctx.stroke()
  ctx.setLineDash([])

  const freqLabels = params.frequencies.slice(0, 4)
  ctx.font = '12px sans-serif'
  freqLabels.forEach((freq, idx) => {
    const x = 20 + idx * 80
    ctx.fillStyle = '#666'
    ctx.fillText(`${freq} Hz`, x, height - 20)
  })
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
  store.saveSimulation('sound-spectrum', saveName.value, {
    sampleRate: params.sampleRate,
    bufferSize: params.bufferSize,
    frequencies: [...params.frequencies],
    amplitudes: [...params.amplitudes],
    phases: [...params.phases],
    noiseLevel: params.noiseLevel
  })
  saveName.value = ''
  showSaveModal.value = false
}

function loadSimulation(sim) {
  Object.assign(params, sim.params)
  params.frequencies = [...sim.params.frequencies]
  params.amplitudes = [...sim.params.amplitudes]
  params.phases = [...sim.params.phases]
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

.frequency-list {
  max-height: 300px;
  overflow-y: auto;
}

.freq-item {
  padding: 8px 0;
  border-bottom: 1px solid #eee;
}

.freq-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.freq-labels {
  font-size: 12px;
  color: #666;
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
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