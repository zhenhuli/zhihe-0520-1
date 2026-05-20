<template>
  <div class="relative w-full h-full bg-gradient-to-br from-green-800 via-green-700 to-green-900 rounded-xl overflow-hidden" ref="canvasContainer">
    <svg class="absolute inset-0 w-full h-full" @click="handleCanvasClick">
      <defs>
        <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
          <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />

      <polyline
        v-if="flightPath.length > 1"
        :points="pathPoints"
        fill="none"
        stroke="#3b82f6"
        stroke-width="3"
        stroke-dasharray="10,5"
        opacity="0.8"
      />

      <circle
        v-if="flightMode === 'orbit'"
        :cx="orbitConfig.centerX"
        :cy="orbitConfig.centerY"
        :r="orbitConfig.radius"
        fill="none"
        stroke="#f59e0b"
        stroke-width="2"
        stroke-dasharray="5,5"
        opacity="0.6"
      />
      <circle
        v-if="flightMode === 'orbit'"
        :cx="orbitConfig.centerX"
        :cy="orbitConfig.centerY"
        r="8"
        fill="#f59e0b"
      />

      <g
        v-for="wp in waypoints"
        :key="wp.id"
        :transform="`translate(${wp.x}, ${wp.y})`"
        @click.stop="selectWaypoint(wp)"
        class="cursor-pointer"
      >
        <circle
          r="16"
          :fill="getWaypointColor(wp.type)"
          :stroke="selectedWaypoint?.id === wp.id ? '#fff' : 'rgba(0,0,0,0.3)'"
          stroke-width="3"
        />
        <text
          y="-22"
          text-anchor="middle"
          fill="white"
          font-size="11"
          font-weight="bold"
        >
          {{ wp.name }}
        </text>
        <text
          y="4"
          text-anchor="middle"
          fill="white"
          font-size="10"
        >
          {{ wp.altitude }}m
        </text>
      </g>

      <g
        v-for="(wp, index) in flightPath"
        :key="'path-' + index"
        :transform="`translate(${wp.x}, ${wp.y})`"
      >
        <circle r="3" fill="#60a5fa" opacity="0.6" />
      </g>
    </svg>

    <div class="absolute top-4 left-4 bg-black/50 backdrop-blur-sm rounded-lg p-3 text-white text-sm">
      <div class="flex items-center gap-2 mb-2">
        <span class="w-3 h-3 rounded-full bg-green-500"></span>
        <span>起飞点</span>
      </div>
      <div class="flex items-center gap-2 mb-2">
        <span class="w-3 h-3 rounded-full bg-red-500"></span>
        <span>降落点</span>
      </div>
      <div class="flex items-center gap-2 mb-2">
        <span class="w-3 h-3 rounded-full bg-blue-500"></span>
        <span>航点</span>
      </div>
      <div class="flex items-center gap-2">
        <span class="w-3 h-3 rounded-full bg-yellow-500"></span>
        <span>兴趣点</span>
      </div>
    </div>

    <div class="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm rounded-lg p-3 text-white text-xs">
      <div>点击地图添加航点</div>
      <div>当前模式: {{ currentModeText }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Waypoint } from '~/types/drone'

const props = defineProps<{
  waypoints: Waypoint[]
  flightPath: Waypoint[]
  selectedWaypoint: Waypoint | null
  flightMode: string
  orbitConfig: any
}>()

const emit = defineEmits<{
  addWaypoint: [x: number, y: number]
  selectWaypoint: [wp: Waypoint]
}>()

const canvasContainer = ref<HTMLDivElement | null>(null)

const currentModeText = computed(() => {
  const modes: Record<string, string> = {
    straight: '直线飞行',
    orbit: '环绕飞行',
    gradient: '渐变飞行',
  }
  return modes[props.flightMode] || '直线飞行'
})

const pathPoints = computed(() => {
  return props.flightPath.map(wp => `${wp.x},${wp.y}`).join(' ')
})

const getWaypointColor = (type: string) => {
  const colors: Record<string, string> = {
    takeoff: '#22c55e',
    landing: '#ef4444',
    waypoint: '#3b82f6',
    poi: '#eab308',
  }
  return colors[type] || '#3b82f6'
}

const handleCanvasClick = (e: MouseEvent) => {
  const rect = (e.currentTarget as SVGSVGElement).getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top
  emit('addWaypoint', x, y)
}

const selectWaypoint = (wp: Waypoint) => {
  emit('selectWaypoint', wp)
}
</script>
