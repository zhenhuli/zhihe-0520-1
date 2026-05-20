<template>
  <div class="bg-white/10 backdrop-blur-lg rounded-xl p-4 text-white">
    <h3 class="text-lg font-bold mb-4 flex items-center gap-2">
      <span class="i-carbon-camera current"></span>
      航拍预览
    </h3>

    <div class="space-y-4">
      <div
        class="relative aspect-video bg-gradient-to-b from-sky-400 to-green-600 rounded-lg overflow-hidden"
      >
        <div class="absolute inset-0 flex items-center justify-center">
          <div class="text-center">
            <div class="text-6xl mb-2">🎬</div>
            <div class="text-sm text-white/80">航拍视角模拟</div>
          </div>
        </div>

        <div
          v-if="previewWaypoint"
          class="absolute bottom-4 left-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg p-3"
        >
          <div class="grid grid-cols-3 gap-2 text-xs">
            <div>
              <div class="text-gray-400">高度</div>
              <div class="font-bold">{{ previewWaypoint.altitude }}m</div>
            </div>
            <div>
              <div class="text-gray-400">角度</div>
              <div class="font-bold">{{ previewWaypoint.angle }}°</div>
            </div>
            <div>
              <div class="text-gray-400">航点</div>
              <div class="font-bold">{{ previewWaypoint.name }}</div>
            </div>
          </div>
        </div>

        <div class="absolute top-4 right-4 bg-red-500 rounded-full w-3 h-3 animate-pulse"></div>
        <div class="absolute top-4 left-4 text-xs bg-black/50 px-2 py-1 rounded">REC</div>
      </div>

      <div v-if="flightPath.length > 0">
        <label class="block text-sm text-gray-300 mb-2">播放进度</label>
        <input
          type="range"
          min="0"
          :max="flightPath.length - 1"
          v-model="currentIndex"
          class="w-full"
        />
        <div class="flex justify-between text-xs text-gray-400 mt-1">
          <span>起点</span>
          <span>{{ Math.round((currentIndex / (flightPath.length - 1)) * 100) }}%</span>
          <span>终点</span>
        </div>
      </div>

      <div class="flex gap-2">
        <button
          class="flex-1 btn btn-primary flex items-center justify-center gap-2"
          @click="togglePlay"
          :disabled="flightPath.length < 2"
        >
          <span :class="isPlaying ? 'i-carbon-pause-filled' : 'i-carbon-play-filled-alt'"></span>
          {{ isPlaying ? '暂停' : '播放' }}
        </button>
        <button
          class="btn btn-secondary flex items-center justify-center gap-2 text-gray-700"
          @click="resetPreview"
        >
          <span class="i-carbon-restart"></span>
        </button>
      </div>

      <div class="border-t border-white/20 pt-4 space-y-3">
        <h4 class="font-medium">相机参数</h4>
        
        <div>
          <label class="block text-sm text-gray-300 mb-1">视场角 (FOV)</label>
          <input
            type="range"
            min="60"
            max="120"
            :value="cameraConfig.fov"
            @input="updateCamera('fov', Number(($event.target as HTMLInputElement).value))"
            class="w-full"
          />
          <div class="text-right text-sm text-gray-400">{{ cameraConfig.fov }}°</div>
        </div>

        <div>
          <label class="block text-sm text-gray-300 mb-1">云台俯仰角</label>
          <input
            type="range"
            min="-90"
            max="0"
            :value="cameraConfig.gimbalPitch"
            @input="updateCamera('gimbalPitch', Number(($event.target as HTMLInputElement).value))"
            class="w-full"
          />
          <div class="text-right text-sm text-gray-400">{{ cameraConfig.gimbalPitch }}°</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Waypoint, CameraConfig } from '~/types/drone'

const props = defineProps<{
  flightPath: Waypoint[]
  cameraConfig: CameraConfig
}>()

const emit = defineEmits<{
  'update:cameraConfig': [config: Partial<CameraConfig>]
}>()

const currentIndex = ref(0)
const isPlaying = ref(false)
let playInterval: ReturnType<typeof setInterval> | null = null

const previewWaypoint = computed(() => {
  return props.flightPath[currentIndex.value] || null
})

const updateCamera = (key: keyof CameraConfig, value: any) => {
  emit('update:cameraConfig', { [key]: value })
}

const togglePlay = () => {
  if (isPlaying.value) {
    stopPlay()
  } else {
    startPlay()
  }
}

const startPlay = () => {
  if (props.flightPath.length < 2) return
  isPlaying.value = true
  playInterval = setInterval(() => {
    if (currentIndex.value < props.flightPath.length - 1) {
      currentIndex.value++
    } else {
      currentIndex.value = 0
    }
  }, 200)
}

const stopPlay = () => {
  isPlaying.value = false
  if (playInterval) {
    clearInterval(playInterval)
    playInterval = null
  }
}

const resetPreview = () => {
  stopPlay()
  currentIndex.value = 0
}

watch(() => props.flightPath.length, () => {
  currentIndex.value = 0
  stopPlay()
})
</script>
