<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
    <header class="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 px-6 py-4">
      <div class="max-w-7xl mx-auto flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span class="text-2xl">🎵</span>
          </div>
          <div>
            <h1 class="text-xl font-bold">Audio Track Splicer</h1>
            <p class="text-sm text-gray-400">多音轨剪辑合成工具</p>
          </div>
        </div>
        <button
          @click="exportAudio"
          :disabled="tracks.length === 0 || isExporting"
          class="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg font-medium hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <span v-if="isExporting">导出中...</span>
          <span v-else>导出音频</span>
          <span class="text-lg">⬇️</span>
        </button>
      </div>
    </header>

    <main class="max-w-7xl mx-auto p-6">
      <AudioUploader @add="handleAddTrack" />

      <div v-if="tracks.length > 0" class="mt-6 space-y-4">
        <div class="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold">传输控制</h2>
            <div class="flex items-center gap-4">
              <div class="flex items-center gap-2">
                <span class="text-gray-400 text-sm">主音量</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  :value="masterVolume"
                  @input="(e) => setMasterVolume(parseFloat((e.target as HTMLInputElement).value))"
                  class="w-24 accent-blue-500"
                />
                <span class="text-sm text-gray-300 w-12">{{ Math.round(masterVolume * 100) }}%</span>
              </div>
            </div>
          </div>

          <div class="flex items-center gap-4">
            <div class="flex items-center gap-2">
              <button
                @click="stopAll"
                class="w-10 h-10 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center transition-colors"
              >
                <span class="text-lg">⏹</span>
              </button>
              <button
                @click="isPlaying ? pauseAll() : playAll()"
                class="w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 flex items-center justify-center transition-all shadow-lg shadow-blue-500/25"
              >
                <span class="text-2xl">{{ isPlaying ? '⏸' : '▶' }}</span>
              </button>
            </div>

            <div class="flex-1">
              <div class="flex items-center justify-between text-sm text-gray-400 mb-1">
                <span>{{ formatTime(currentTime) }}</span>
                <span>{{ formatTime(totalDuration) }}</span>
              </div>
              <div class="relative h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                  class="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all"
                  :style="{ width: `${totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0}%` }"
                />
                <input
                  type="range"
                  min="0"
                  :max="totalDuration || 0"
                  step="0.01"
                  :value="currentTime"
                  @input="(e) => seek(parseFloat((e.target as HTMLInputElement).value))"
                  class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        <div class="space-y-3" ref="tracksContainer">
          <div
            v-for="(track, index) in tracks"
            :key="track.id"
            :data-id="track.id"
          >
            <AudioTrackItem
              :track="track"
              :index="index"
              :total-duration="totalDuration"
              @update="(updates) => updateTrack(track.id, updates)"
              @remove="removeTrack(track.id)"
            />
          </div>
        </div>
      </div>

      <div v-else class="mt-12 text-center">
        <div class="w-24 h-24 mx-auto mb-6 bg-gray-800 rounded-full flex items-center justify-center">
          <span class="text-5xl">🎧</span>
        </div>
        <h2 class="text-xl font-semibold text-gray-300 mb-2">暂无音轨</h2>
        <p class="text-gray-500">点击上方按钮上传音频文件开始编辑</p>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useAudioProcessor } from '~/composables/useAudioProcessor'
import AudioUploader from '~/components/AudioUploader.vue'
import AudioTrackItem from '~/components/AudioTrackItem.vue'
import Sortable from 'sortablejs'

const {
  tracks,
  isPlaying,
  currentTime,
  totalDuration,
  masterVolume,
  addTrack,
  removeTrack,
  updateTrack,
  reorderTracks,
  playAll,
  pauseAll,
  stopAll,
  seek,
  setMasterVolume,
  exportMix,
  formatTime
} = useAudioProcessor()

const isExporting = ref(false)
const tracksContainer = ref<HTMLElement | null>(null)
let sortableInstance: Sortable | null = null

async function handleAddTrack(files: File[]) {
  for (const file of files) {
    try {
      await addTrack(file)
    } catch (e) {
      console.error('Failed to add track:', e)
    }
  }
}

async function exportAudio() {
  if (tracks.value.length === 0) return
  
  isExporting.value = true
  try {
    const blob = await exportMix()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `mix_${Date.now()}.wav`
    a.click()
    URL.revokeObjectURL(url)
  } catch (e) {
    console.error('Export failed:', e)
    alert('导出失败，请重试')
  } finally {
    isExporting.value = false
  }
}

function initSortable() {
  if (sortableInstance) {
    sortableInstance.destroy()
  }
  if (tracksContainer.value) {
    sortableInstance = Sortable.create(tracksContainer.value, {
      animation: 200,
      handle: '.drag-handle',
      ghostClass: 'opacity-50',
      dataIdAttr: 'data-id',
      onEnd: (evt) => {
        const newTracks = [...tracks.value]
        const [removed] = newTracks.splice(evt.oldIndex!, 1)
        newTracks.splice(evt.newIndex!, 0, removed)
        reorderTracks(newTracks)
      }
    })
  }
}

watch(
  () => tracks.value.length,
  () => {
    nextTick(() => {
      initSortable()
    })
  }
)

onMounted(() => {
  nextTick(() => {
    initSortable()
  })
})
</script>
