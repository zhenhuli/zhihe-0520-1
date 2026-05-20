<template>
  <div class="min-h-screen p-6">
    <header class="mb-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-white flex items-center gap-3">
            <span class="text-4xl">🛸</span>
            无人机航线规划模拟器
          </h1>
          <p class="text-gray-400 mt-1">民用航拍无人机航线规划与预览系统</p>
        </div>
        <div class="flex items-center gap-4">
          <div class="text-right">
            <div class="text-sm text-gray-400">航点数量</div>
            <div class="text-2xl font-bold text-white">{{ waypoints.length }}</div>
          </div>
          <div class="w-px h-10 bg-white/20"></div>
          <div class="text-right">
            <div class="text-sm text-gray-400">预计距离</div>
            <div class="text-2xl font-bold text-blue-400">{{ flightPath.totalDistance.toFixed(0) }}m</div>
          </div>
        </div>
      </div>
    </header>

    <div class="grid grid-cols-12 gap-6">
      <div class="col-span-3 space-y-4">
        <WaypointPanel
          :waypoints="waypoints"
          :selected-waypoint="selectedWaypoint"
          @select="selectWaypoint"
          @remove="removeWaypoint"
          @clear="clearWaypoints"
          @update="updateWaypoint"
        />
        <FlightModePanel
          :flight-mode="flightMode"
          :flight-modes="flightModes"
          :speed="speed"
          :orbit-config="orbitConfig"
          @update:flight-mode="flightMode = $event"
          @update:speed="speed = $event"
          @update:orbit-config="updateOrbitConfig"
        />
      </div>

      <div class="col-span-6">
        <div class="h-[600px]">
          <MapCanvas
            :waypoints="waypoints"
            :flight-path="flightPath.waypoints"
            :selected-waypoint="selectedWaypoint"
            :flight-mode="flightMode"
            :orbit-config="orbitConfig"
            @add-waypoint="handleAddWaypoint"
            @select-waypoint="selectWaypoint"
          />
        </div>

        <div class="mt-4 flex gap-4">
          <div class="flex-1 flex gap-2">
            <button
              class="btn btn-success flex items-center gap-2"
              @click="addTakeoffPoint"
            >
              <span class="i-carbon-launch"></span>
              设为起飞点
            </button>
            <button
              class="btn btn-danger flex items-center gap-2"
              @click="addLandingPoint"
            >
              <span class="i-carbon-landing-gear"></span>
              设为降落点
            </button>
            <button
              class="btn btn-secondary text-gray-700 flex items-center gap-2"
              @click="addPOI"
            >
              <span class="i-carbon-star-filled"></span>
              兴趣点
            </button>
          </div>
          <div class="text-sm text-gray-400 flex items-center">
            提示: 点击地图任意位置添加航点
          </div>
        </div>
      </div>

      <div class="col-span-3 space-y-4">
        <AerialPreview
          :flight-path="flightPath.waypoints"
          :camera-config="cameraConfig"
          @update:camera-config="updateCameraConfig"
        />
        <ExportPanel
          :waypoints="waypoints"
          :flight-path="flightPath"
          :flight-mode="flightMode"
          :speed="speed"
          :on-export="exportRouteConfig"
          :on-download-j-s-o-n="downloadConfig"
          :on-download-c-s-v="downloadCSV"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Waypoint } from '~/types/drone'

const {
  waypoints,
  selectedWaypoint,
  flightMode,
  flightModes,
  speed,
  cameraConfig,
  orbitConfig,
  addWaypoint,
  removeWaypoint,
  updateWaypoint,
  clearWaypoints,
  generateFlightPath,
  exportRouteConfig,
  downloadConfig,
  downloadCSV,
} = useDronePlanning()

const flightPath = computed(() => generateFlightPath())

const pendingType = ref<Waypoint['type']>('waypoint')

const handleAddWaypoint = (x: number, y: number) => {
  const wp = addWaypoint(x, y, pendingType.value)
  selectWaypoint(wp)
  pendingType.value = 'waypoint'
}

const selectWaypoint = (wp: Waypoint) => {
  selectedWaypoint.value = wp
}

const addTakeoffPoint = () => {
  pendingType.value = 'takeoff'
}

const addLandingPoint = () => {
  pendingType.value = 'landing'
}

const addPOI = () => {
  pendingType.value = 'poi'
}

const updateOrbitConfig = (config: Partial<typeof orbitConfig.value>) => {
  Object.assign(orbitConfig.value, config)
}

const updateCameraConfig = (config: Partial<typeof cameraConfig.value>) => {
  Object.assign(cameraConfig.value, config)
}
</script>
