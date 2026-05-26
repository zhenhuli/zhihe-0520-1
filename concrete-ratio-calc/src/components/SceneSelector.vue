<template>
  <n-radio-group v-model:value="scene" name="scene" size="small">
    <n-space vertical :size="8">
      <n-radio-button
        v-for="item in scenes"
        :key="item.value"
        :value="item.value"
        style="width: 100%;"
      >
        <div class="radio-content">
          <span class="radio-label">{{ item.label }}</span>
          <span class="radio-desc">{{ item.description }}</span>
        </div>
      </n-radio-button>
    </n-space>
  </n-radio-group>
</template>

<script setup>
import { computed } from 'vue'
import { NRadioGroup, NRadioButton, NSpace } from 'naive-ui'
import { constructionScenes } from '../data/concreteData'

const props = defineProps({
  scene: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['update:scene'])

const scenes = constructionScenes

const scene = computed({
  get() {
    return props.scene
  },
  set(value) {
    emit('update:scene', value)
  }
})
</script>

<style scoped>
.radio-content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 2px 0;
}

.radio-label {
  font-size: 13px;
  font-weight: 500;
}

.radio-desc {
  font-size: 11px;
  color: #999;
  margin-top: 1px;
}
</style>
