<template>
  <n-space vertical :size="12" style="width: 100%;">
    <div class="wastage-item">
      <div class="item-header">
        <span class="material-name">水泥</span>
        <span class="wastage-value">{{ wastage.cement }}%</span>
      </div>
      <n-slider
        v-model:value="cementRate"
        :min="0"
        :max="10"
        :step="0.5"
        size="small"
        @update:value="updateWastage('cement', $event)"
      />
    </div>
    <div class="wastage-item">
      <div class="item-header">
        <span class="material-name">砂子</span>
        <span class="wastage-value">{{ wastage.sand }}%</span>
      </div>
      <n-slider
        v-model:value="sandRate"
        :min="0"
        :max="15"
        :step="0.5"
        size="small"
        @update:value="updateWastage('sand', $event)"
      />
    </div>
    <div class="wastage-item">
      <div class="item-header">
        <span class="material-name">石子</span>
        <span class="wastage-value">{{ wastage.gravel }}%</span>
      </div>
      <n-slider
        v-model:value="gravelRate"
        :min="0"
        :max="15"
        :step="0.5"
        size="small"
        @update:value="updateWastage('gravel', $event)"
      />
    </div>
    <div class="wastage-item">
      <div class="item-header">
        <span class="material-name">水</span>
        <span class="wastage-value">{{ wastage.water }}%</span>
      </div>
      <n-slider
        v-model:value="waterRate"
        :min="0"
        :max="10"
        :step="0.5"
        size="small"
        @update:value="updateWastage('water', $event)"
      />
    </div>
  </n-space>
</template>

<script setup>
import { ref, watch } from 'vue'
import { NSpace, NSlider } from 'naive-ui'

const props = defineProps({
  wastage: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update:wastage'])

const cementRate = ref(props.wastage.cement)
const sandRate = ref(props.wastage.sand)
const gravelRate = ref(props.wastage.gravel)
const waterRate = ref(props.wastage.water)

watch(() => props.wastage, (newVal) => {
  cementRate.value = newVal.cement
  sandRate.value = newVal.sand
  gravelRate.value = newVal.gravel
  waterRate.value = newVal.water
}, { deep: true })

function updateWastage(material, value) {
  const newWastage = { ...props.wastage, [material]: value }
  emit('update:wastage', newWastage)
}
</script>

<style scoped>
.wastage-item {
  width: 100%;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.material-name {
  font-size: 12px;
  font-weight: 500;
}

.wastage-value {
  font-size: 12px;
  font-weight: 600;
  color: #2080f0;
}
</style>
