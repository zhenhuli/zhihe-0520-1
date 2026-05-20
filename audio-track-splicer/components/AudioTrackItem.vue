<template>
  <div
    class="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden"
    :class="{ 'opacity-50': track.muted }"
  >
    <div class="p-4">
      <div class="flex items-center gap-4">
        <div class="drag-handle cursor-move text-gray-500 hover:text-gray-300 transition-colors select-none">
          <span class="text-xl">⋮⋮</span>
        </div>

        <div
          class="w-3 h-12 rounded-full flex-shrink-0"
          :style="{ backgroundColor: track.color }"
        />

        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-3">
            <h3 class="font-medium text-gray-200 truncate">{{ track.name }}</h3>
            <span class="text-xs text-gray-500 flex-shrink-0">
              {{ formatTime(track.endTime - track.startTime) }}
            </span>
          </div>

          <div
            ref="timelineRef"
            class="relative mt-2 h-12 bg-gray-900/50 rounded-lg overflow-hidden select-none"
            @mousedown="handleTimelineClick"
          >
            <div
              class="absolute top-0 h-full opacity-60"
              :style="{
                left: `${(track.startTime / totalDuration) * 100}%`,
                width: `${((track.endTime - track.startTime) / totalDuration) * 100}%`,
                backgroundColor: track.color
              }"
            >
              <div
                v-if="track.fadeIn > 0"
                class="absolute left-0 top-0 h-full bg-gradient-to-r from-black/50 to-transparent"
                :style="{ width: `${(track.fadeIn / (track.endTime - track.startTime)) * 100}%` }"
              />
              <div
                v-if="track.fadeOut > 0"
                class="absolute right-0 top-0 h-full bg-gradient-to-l from-black/50 to-transparent"
                :style="{ width: `${(track.fadeOut / (track.endTime - track.startTime)) * 100}%` }"
              />
            </div>

            <div
              class="absolute top-0 h-full w-3 cursor-ew-resize z-10 group"
              :style="{ left: `calc(${(track.startTime / totalDuration) * 100}% - 6px)` }"
              @mousedown.stop="startDrag('start', $event)"
            >
              <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-8 bg-white/80 rounded group-hover:bg-white group-hover:w-1.5 transition-all" />
            </div>

            <div
              class="absolute top-0 h-full w-3 cursor-ew-resize z-10 group"
              :style="{ left: `calc(${(track.endTime / totalDuration) * 100}% - 6px)` }"
              @mousedown.stop="startDrag('end', $event)"
            >
              <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-8 bg-white/80 rounded group-hover:bg-white group-hover:w-1.5 transition-all" />
            </div>

            <div
              class="absolute top-0 h-full cursor-move z-5"
              :style="{
                left: `calc(${(track.startTime / totalDuration) * 100}% + 6px)`,
                width: `calc(${((track.endTime - track.startTime) / totalDuration) * 100}% - 12px)`
              }"
              @mousedown.stop="startDrag('move', $event)"
            />
          </div>
        </div>

        <div class="flex items-center gap-2 flex-shrink-0">
          <button
            @click="toggleMute"
            class="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
            :class="track.muted ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'"
            :title="track.muted ? '取消静音' : '静音'"
          >
            <span>{{ track.muted ? '🔇' : '🔊' }}</span>
          </button>
          <button
            @click="$emit('remove')"
            class="w-8 h-8 rounded-lg bg-gray-700 text-gray-300 hover:bg-red-600 hover:text-white flex items-center justify-center transition-colors"
            title="删除轨道"
          >
            <span>🗑️</span>
          </button>
        </div>
      </div>

      <div class="mt-4 grid grid-cols-3 gap-4">
        <div class="space-y-1">
          <div class="flex items-center justify-between text-xs text-gray-400">
            <span>音量</span>
            <span>{{ Math.round(track.volume * 100) }}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            :value="track.volume"
            @input="(e) => update({ volume: parseFloat((e.target as HTMLInputElement).value) })"
            class="w-full accent-blue-500"
          />
        </div>

        <div class="space-y-1">
          <div class="flex items-center justify-between text-xs text-gray-400">
            <span>淡入</span>
            <span>{{ track.fadeIn.toFixed(1) }}s</span>
          </div>
          <input
            type="range"
            min="0"
            :max="(track.endTime - track.startTime) / 2"
            step="0.1"
            :value="track.fadeIn"
            @input="(e) => update({ fadeIn: parseFloat((e.target as HTMLInputElement).value) })"
            class="w-full accent-green-500"
          />
        </div>

        <div class="space-y-1">
          <div class="flex items-center justify-between text-xs text-gray-400">
            <span>淡出</span>
            <span>{{ track.fadeOut.toFixed(1) }}s</span>
          </div>
          <input
            type="range"
            min="0"
            :max="(track.endTime - track.startTime) / 2"
            step="0.1"
            :value="track.fadeOut"
            @input="(e) => update({ fadeOut: parseFloat((e.target as HTMLInputElement).value) })"
            class="w-full accent-orange-500"
          />
        </div>
      </div>

      <div class="mt-3 flex items-center gap-4 text-xs text-gray-500">
        <div class="flex items-center gap-2">
          <span>开始:</span>
          <input
            type="number"
            min="0"
            :max="track.endTime - 0.1"
            step="0.1"
            :value="track.startTime.toFixed(1)"
            @change="(e) => update({ startTime: Math.max(0, Math.min(parseFloat((e.target as HTMLInputElement).value), track.endTime - 0.1)) })"
            class="w-20 px-2 py-1 bg-gray-900 rounded border border-gray-700 text-gray-300 text-center"
          />
          <span>s</span>
        </div>
        <div class="flex items-center gap-2">
          <span>结束:</span>
          <input
            type="number"
            :min="track.startTime + 0.1"
            :max="track.duration"
            step="0.1"
            :value="track.endTime.toFixed(1)"
            @change="(e) => update({ endTime: Math.min(track.duration, Math.max(parseFloat((e.target as HTMLInputElement).value), track.startTime + 0.1)) })"
            class="w-20 px-2 py-1 bg-gray-900 rounded border border-gray-700 text-gray-300 text-center"
          />
          <span>s</span>
        </div>
        <div class="flex-1 text-right">
          原始时长: {{ formatTime(track.duration) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AudioTrack } from '~/types/audio'

const props = defineProps<{
  track: AudioTrack
  index: number
  totalDuration: number
}>()

const emit = defineEmits<{
  update: [updates: Partial<AudioTrack>]
  remove: []
}>()

const timelineRef = ref<HTMLElement | null>(null)

function update(updates: Partial<AudioTrack>) {
  emit('update', updates)
}

function toggleMute() {
  update({ muted: !props.track.muted })
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

let dragType: 'start' | 'end' | 'move' | null = null
let startX = 0
let initialStartTime = 0
let initialEndTime = 0
let timelineRect: DOMRect | null = null

function getTimeFromPosition(clientX: number): number {
  if (!timelineRect || props.totalDuration === 0) return 0
  const x = clientX - timelineRect.left
  const percentage = Math.max(0, Math.min(1, x / timelineRect.width))
  return percentage * props.totalDuration
}

function startDrag(type: 'start' | 'end' | 'move', e: MouseEvent) {
  e.preventDefault()
  dragType = type
  startX = e.clientX
  initialStartTime = props.track.startTime
  initialEndTime = props.track.endTime
  
  if (timelineRef.value) {
    timelineRect = timelineRef.value.getBoundingClientRect()
  }
  
  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', stopDrag)
  document.body.style.cursor = type === 'move' ? 'grabbing' : 'ew-resize'
}

function onDrag(e: MouseEvent) {
  if (!dragType || !timelineRect) return
  
  const currentTime = getTimeFromPosition(e.clientX)
  
  if (dragType === 'start') {
    const newStart = Math.max(0, Math.min(currentTime, initialEndTime - 0.1))
    update({ startTime: newStart })
  } else if (dragType === 'end') {
    const newEnd = Math.min(props.track.duration, Math.max(currentTime, initialStartTime + 0.1))
    update({ endTime: newEnd })
  } else if (dragType === 'move') {
    const deltaTime = getTimeFromPosition(e.clientX) - getTimeFromPosition(startX)
    const duration = initialEndTime - initialStartTime
    let newStart = initialStartTime + deltaTime
    let newEnd = initialEndTime + deltaTime
    
    if (newStart < 0) {
      newStart = 0
      newEnd = duration
    }
    if (newEnd > props.track.duration) {
      newEnd = props.track.duration
      newStart = newEnd - duration
    }
    
    update({ startTime: newStart, endTime: newEnd })
  }
}

function stopDrag() {
  dragType = null
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
  document.body.style.cursor = ''
}

function handleTimelineClick(e: MouseEvent) {
  if (!timelineRef.value) return
  timelineRect = timelineRef.value.getBoundingClientRect()
  const clickTime = getTimeFromPosition(e.clientX)
  
  if (clickTime < props.track.startTime) {
    update({ startTime: Math.max(0, clickTime) })
  } else if (clickTime > props.track.endTime) {
    update({ endTime: Math.min(props.track.duration, clickTime) })
  }
}
</script>
