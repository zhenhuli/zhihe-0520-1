<template>
  <div class="bg-white/10 backdrop-blur-lg rounded-xl p-4 text-white">
    <h3 class="text-lg font-bold mb-4 flex items-center gap-2">
      <span class="i-carbon-flight current"></span>
      飞行模式
    </h3>

    <div class="space-y-2 mb-6">
      <div
        v-for="mode in flightModes"
        :key="mode.type"
        class="p-3 rounded-lg cursor-pointer transition-all border-2"
        :class="flightMode === mode.type ? 'bg-blue-500/30 border-blue-400' : 'bg-white/5 border-transparent hover:bg-white/10'"
        @click="$emit('update:flightMode', mode.type)"
      >
        <div class="font-medium">{{ mode.name }}</div>
        <div class="text-xs text-gray-400">{{ mode.description }}</div>
      </div>
    </div>

    <div class="space-y-4">
      <div>
        <label class="block text-sm text-gray-300 mb-1">飞行速度 (m/s)</label>
        <input
          type="range"
          min="1"
          max="15"
          :value="speed"
          @input="$emit('update:speed', Number(($event.target as HTMLInputElement).value))"
          class="w-full"
        />
        <div class="text-right text-sm text-gray-400">{{ speed }} m/s</div>
      </div>

      <div v-if="flightMode === 'orbit'" class="space-y-4 p-4 bg-white/5 rounded-lg">
        <h4 class="font-medium text-yellow-400">环绕参数设置</h4>
        
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-sm text-gray-300 mb-1">中心点X</label>
            <input
              type="number"
              :value="orbitConfig.centerX"
              @input="updateOrbit('centerX', Number(($event.target as HTMLInputElement).value))"
              class="input bg-white/10 border-white/20 text-white text-sm"
            />
          </div>
          <div>
            <label class="block text-sm text-gray-300 mb-1">中心点Y</label>
            <input
              type="number"
              :value="orbitConfig.centerY"
              @input="updateOrbit('centerY', Number(($event.target as HTMLInputElement).value))"
              class="input bg-white/10 border-white/20 text-white text-sm"
            />
          </div>
        </div>

        <div>
          <label class="block text-sm text-gray-300 mb-1">环绕半径 (px)</label>
          <input
            type="range"
            min="50"
            max="300"
            :value="orbitConfig.radius"
            @input="updateOrbit('radius', Number(($event.target as HTMLInputElement).value))"
            class="w-full"
          />
          <div class="text-right text-sm text-gray-400">{{ orbitConfig.radius }}px</div>
        </div>

        <div>
          <label class="block text-sm text-gray-300 mb-1">飞行高度 (米)</label>
          <input
            type="range"
            min="10"
            max="200"
            :value="orbitConfig.altitude"
            @input="updateOrbit('altitude', Number(($event.target as HTMLInputElement).value))"
            class="w-full"
          />
          <div class="text-right text-sm text-gray-400">{{ orbitConfig.altitude }}m</div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-sm text-gray-300 mb-1">起始角度</label>
            <input
              type="number"
              min="0"
              max="360"
              :value="orbitConfig.angleStart"
              @input="updateOrbit('angleStart', Number(($event.target as HTMLInputElement).value))"
              class="input bg-white/10 border-white/20 text-white text-sm"
            />
          </div>
          <div>
            <label class="block text-sm text-gray-300 mb-1">结束角度</label>
            <input
              type="number"
              min="0"
              max="360"
              :value="orbitConfig.angleEnd"
              @input="updateOrbit('angleEnd', Number(($event.target as HTMLInputElement).value))"
              class="input bg-white/10 border-white/20 text-white text-sm"
            />
          </div>
        </div>

        <div class="flex items-center gap-2">
          <input
            type="checkbox"
            :checked="orbitConfig.clockwise"
            @change="updateOrbit('clockwise', ($event.target as HTMLInputElement).checked)"
            id="clockwise"
            class="w-4 h-4"
          />
          <label for="clockwise" class="text-sm">顺时针方向</label>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { FlightMode, OrbitConfig } from '~/types/drone'

defineProps<{
  flightMode: string
  flightModes: FlightMode[]
  speed: number
  orbitConfig: OrbitConfig
}>()

const emit = defineEmits<{
  'update:flightMode': [mode: string]
  'update:speed': [speed: number]
  'update:orbitConfig': [config: Partial<OrbitConfig>]
}>()

const updateOrbit = (key: keyof OrbitConfig, value: any) => {
  emit('update:orbitConfig', { [key]: value })
}
</script>
