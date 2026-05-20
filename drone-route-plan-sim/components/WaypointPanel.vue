<template>
  <div class="bg-white/10 backdrop-blur-lg rounded-xl p-4 text-white">
    <h3 class="text-lg font-bold mb-4 flex items-center gap-2">
      <span class="i-carbon-location current"></span>
      航点管理
    </h3>

    <div class="space-y-2 max-h-64 overflow-y-auto mb-4">
      <div
        v-for="wp in waypoints"
        :key="wp.id"
        class="flex items-center gap-3 p-3 rounded-lg transition-all cursor-pointer"
        :class="selectedWaypoint?.id === wp.id ? 'bg-blue-500/30 border border-blue-400' : 'bg-white/5 hover:bg-white/10'"
        @click="$emit('select', wp)"
      >
        <div
          class="w-3 h-3 rounded-full flex-shrink-0"
          :class="{
            'bg-green-500': wp.type === 'takeoff',
            'bg-red-500': wp.type === 'landing',
            'bg-blue-500': wp.type === 'waypoint',
            'bg-yellow-500': wp.type === 'poi',
          }"
        ></div>
        <div class="flex-1 min-w-0">
          <div class="font-medium truncate">{{ wp.name }}</div>
          <div class="text-xs text-gray-400">
            ({{ wp.x.toFixed(0) }}, {{ wp.y.toFixed(0) }}) · {{ wp.altitude }}m
          </div>
        </div>
        <button
          class="p-1 hover:bg-red-500/30 rounded transition-colors"
          @click.stop="$emit('remove', wp.id)"
        >
          <span class="i-carbon-trash-can text-red-400"></span>
        </button>
      </div>
      <div v-if="waypoints.length === 0" class="text-center py-8 text-gray-400 text-sm">
        点击地图添加航点
      </div>
    </div>

    <div v-if="selectedWaypoint" class="border-t border-white/20 pt-4 space-y-3">
      <h4 class="font-medium">编辑航点</h4>
      
      <div>
        <label class="block text-sm text-gray-300 mb-1">名称</label>
        <input
          type="text"
          :value="selectedWaypoint.name"
          @input="updateField('name', ($event.target as HTMLInputElement).value)"
          class="input bg-white/10 border-white/20 text-white placeholder-gray-400"
        />
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-sm text-gray-300 mb-1">X坐标</label>
          <input
            type="number"
            :value="selectedWaypoint.x"
            @input="updateField('x', Number(($event.target as HTMLInputElement).value))"
            class="input bg-white/10 border-white/20 text-white"
          />
        </div>
        <div>
          <label class="block text-sm text-gray-300 mb-1">Y坐标</label>
          <input
            type="number"
            :value="selectedWaypoint.y"
            @input="updateField('y', Number(($event.target as HTMLInputElement).value))"
            class="input bg-white/10 border-white/20 text-white"
          />
        </div>
      </div>

      <div>
        <label class="block text-sm text-gray-300 mb-1">飞行高度 (米)</label>
        <input
          type="range"
          min="10"
          max="200"
          :value="selectedWaypoint.altitude"
          @input="updateField('altitude', Number(($event.target as HTMLInputElement).value))"
          class="w-full"
        />
        <div class="text-right text-sm text-gray-400">{{ selectedWaypoint.altitude }}m</div>
      </div>

      <div>
        <label class="block text-sm text-gray-300 mb-1">拍摄角度 (°)</label>
        <input
          type="range"
          min="0"
          max="360"
          :value="selectedWaypoint.angle"
          @input="updateField('angle', Number(($event.target as HTMLInputElement).value))"
          class="w-full"
        />
        <div class="text-right text-sm text-gray-400">{{ selectedWaypoint.angle }}°</div>
      </div>

      <div>
        <label class="block text-sm text-gray-300 mb-1">航点类型</label>
        <select
          :value="selectedWaypoint.type"
          @change="updateField('type', ($event.target as HTMLSelectElement).value as any)"
          class="input bg-white/10 border-white/20 text-white"
        >
          <option value="takeoff" class="bg-gray-800">起飞点</option>
          <option value="waypoint" class="bg-gray-800">航点</option>
          <option value="poi" class="bg-gray-800">兴趣点</option>
          <option value="landing" class="bg-gray-800">降落点</option>
        </select>
      </div>
    </div>

    <button
      v-if="waypoints.length > 0"
      class="w-full mt-4 btn btn-danger"
      @click="$emit('clear')"
    >
      清空所有航点
    </button>
  </div>
</template>

<script setup lang="ts">
import type { Waypoint } from '~/types/drone'

const props = defineProps<{
  waypoints: Waypoint[]
  selectedWaypoint: Waypoint | null
}>()

const emit = defineEmits<{
  select: [wp: Waypoint]
  remove: [id: string]
  clear: []
  update: [id: string, updates: Partial<Waypoint>]
}>()

const updateField = (field: keyof Waypoint, value: any) => {
  if (props.selectedWaypoint) {
    emit('update', props.selectedWaypoint.id, { [field]: value })
  }
}
</script>
