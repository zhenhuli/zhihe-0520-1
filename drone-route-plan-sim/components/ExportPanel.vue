<template>
  <div class="bg-white/10 backdrop-blur-lg rounded-xl p-4 text-white">
    <h3 class="text-lg font-bold mb-4 flex items-center gap-2">
      <span class="i-carbon-document-export current"></span>
      航线导出
    </h3>

    <div v-if="flightPath.waypoints.length > 0" class="space-y-4">
      <div class="grid grid-cols-2 gap-3 p-4 bg-white/5 rounded-lg">
        <div class="text-center">
          <div class="text-2xl font-bold text-blue-400">{{ flightPath.totalDistance.toFixed(0) }}</div>
          <div class="text-xs text-gray-400">总距离 (m)</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-green-400">{{ formatTime(flightPath.estimatedTime) }}</div>
          <div class="text-xs text-gray-400">预计时间</div>
        </div>
      </div>

      <div class="space-y-2">
        <div class="flex justify-between text-sm">
          <span class="text-gray-400">航点数量</span>
          <span>{{ waypoints.length }} 个</span>
        </div>
        <div class="flex justify-between text-sm">
          <span class="text-gray-400">飞行模式</span>
          <span>{{ modeText }}</span>
        </div>
        <div class="flex justify-between text-sm">
          <span class="text-gray-400">飞行速度</span>
          <span>{{ speed }} m/s</span>
        </div>
      </div>

      <div>
        <label class="block text-sm text-gray-300 mb-1">任务名称</label>
        <input
          type="text"
          v-model="routeName"
          placeholder="输入航线任务名称"
          class="input bg-white/10 border-white/20 text-white placeholder-gray-400"
        />
      </div>

      <div class="space-y-2">
        <button
          class="w-full btn btn-success flex items-center justify-center gap-2"
          @click="exportJSON"
        >
          <span class="i-carbon-download"></span>
          导出配置文件 (JSON)
        </button>
        <button
          class="w-full btn btn-primary flex items-center justify-center gap-2"
          @click="exportCSV"
        >
          <span class="i-carbon-spreadsheet"></span>
          导出航线清单 (CSV)
        </button>
      </div>
    </div>

    <div v-else class="text-center py-8 text-gray-400">
      <div class="text-4xl mb-2">📍</div>
      <div class="text-sm">请先添加航点并生成航线</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { FlightPath } from '~/types/drone'

const props = defineProps<{
  waypoints: any[]
  flightPath: FlightPath
  flightMode: string
  speed: number
  onExport: (name: string) => any
  onDownloadJSON: (config: any) => void
  onDownloadCSV: (config: any) => void
}>()

const routeName = ref('航拍航线任务')

const modeText = computed(() => {
  const modes: Record<string, string> = {
    straight: '直线飞行',
    orbit: '环绕飞行',
    gradient: '渐变飞行',
  }
  return modes[props.flightMode] || '直线飞行'
})

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const exportJSON = () => {
  const config = props.onExport(routeName.value)
  props.onDownloadJSON(config)
}

const exportCSV = () => {
  const config = props.onExport(routeName.value)
  props.onDownloadCSV(config)
}
</script>
