<template>
  <div>
    <n-radio-group v-model:value="grade" name="grade" size="small">
      <n-grid :cols="2" :x-gap="8" :y-gap="8">
        <n-gi v-for="item in grades" :key="item.value">
          <n-radio-button :value="item.value" style="width: 100%;">
            <div class="grade-option">
              <span class="grade-value">{{ item.label }}</span>
              <span class="grade-range">{{ item.minStrength }}-{{ item.maxStrength }}</span>
            </div>
          </n-radio-button>
        </n-gi>
      </n-grid>
    </n-radio-group>
    <n-alert v-if="grades.length === 0" type="warning" style="margin-top: 12px;" size="small">
      该场景暂无推荐强度等级
    </n-alert>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { NRadioGroup, NRadioButton, NGrid, NGi, NAlert } from 'naive-ui'

const props = defineProps({
  grade: {
    type: String,
    required: true
  },
  scene: {
    type: String,
    required: true
  },
  grades: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['update:grade'])

const grade = computed({
  get() {
    return props.grade
  },
  set(value) {
    emit('update:grade', value)
  }
})
</script>

<style scoped>
.grade-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2px 0;
}

.grade-value {
  font-size: 14px;
  font-weight: 600;
}

.grade-range {
  font-size: 10px;
  color: #999;
  margin-top: 1px;
}
</style>
