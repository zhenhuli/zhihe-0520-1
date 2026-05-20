<template>
  <div class="metal-materials">
    <div class="section-header">
      <h3>💎 贵金属主材</h3>
      <button class="add-btn" @click="addMaterial">+ 添加主材</button>
    </div>
    <div class="material-list">
      <div v-for="(item, index) in materials" :key="index" class="material-item">
        <select v-model="item.type" @change="onTypeChange(index)">
          <option value="">选择金属类型</option>
          <option v-for="metal in METAL_TYPES" :key="metal.name" :value="metal.name">
            {{ metal.name }} (¥{{ metal.pricePerGram }}/g)
          </option>
        </select>
        <input 
          type="number" 
          v-model.number="item.weight" 
          placeholder="重量 (克)" 
          step="0.01"
          min="0"
        />
        <input 
          type="number" 
          v-model.number="item.pricePerGram" 
          placeholder="单价 (元/克)" 
          step="0.01"
          min="0"
        />
        <span class="item-cost">¥{{ calculateItemCost(item).toFixed(2) }}</span>
        <button class="remove-btn" @click="removeMaterial(index)">×</button>
      </div>
    </div>
    <div class="section-total">
      <span>主材小计:</span>
      <span class="total-amount">¥{{ totalCost.toFixed(2) }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { METAL_TYPES } from '../utils/costCalculator'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue'])

const materials = ref([...props.modelValue])

watch(materials, (newVal) => {
  emit('update:modelValue', newVal)
}, { deep: true })

watch(() => props.modelValue, (newVal) => {
  materials.value = [...newVal]
}, { deep: true })

const totalCost = computed(() => {
  return materials.value.reduce((sum, item) => sum + calculateItemCost(item), 0)
})

function calculateItemCost(item) {
  return (item.weight || 0) * (item.pricePerGram || 0)
}

function onTypeChange(index) {
  const selected = METAL_TYPES.find(m => m.name === materials.value[index].type)
  if (selected) {
    materials.value[index].pricePerGram = selected.pricePerGram
  }
}

function addMaterial() {
  materials.value.push({
    type: '',
    weight: 0,
    pricePerGram: 0
  })
}

function removeMaterial(index) {
  materials.value.splice(index, 1)
}
</script>

<style lang="less" scoped>
.metal-materials {
  background: linear-gradient(135deg, #fef3f0 0%, #fff7ed 100%);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  border: 1px solid #fed7aa;

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    h3 {
      margin: 0;
      color: #c2410c;
      font-size: 18px;
    }

    .add-btn {
      background: #f97316;
      color: white;
      border: none;
      padding: 6px 14px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.2s;

      &:hover {
        background: #ea580c;
        transform: translateY(-1px);
      }
    }
  }

  .material-list {
    display: flex;
    flex-direction: column;
    gap: 10px;

    .material-item {
      display: flex;
      gap: 10px;
      align-items: center;
      background: white;
      padding: 12px;
      border-radius: 8px;
      border: 1px solid #fed7aa;

      select, input {
        padding: 8px 12px;
        border: 1px solid #fdba74;
        border-radius: 6px;
        font-size: 14px;
        background: white;
        color: #1f2937;

        &:focus {
          outline: none;
          border-color: #f97316;
          box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
        }
      }

      select {
        flex: 2;
        min-width: 180px;
      }

      input {
        flex: 1;
        min-width: 100px;
      }

      .item-cost {
        flex: 1;
        text-align: right;
        font-weight: 600;
        color: #c2410c;
        min-width: 100px;
      }

      .remove-btn {
        width: 30px;
        height: 30px;
        border-radius: 50%;
        border: none;
        background: #fecaca;
        color: #dc2626;
        font-size: 18px;
        cursor: pointer;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;

        &:hover {
          background: #fca5a5;
          transform: scale(1.1);
        }
      }
    }
  }

  .section-total {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 10px;
    margin-top: 16px;
    padding-top: 16px;
    border-top: 2px dashed #fdba74;
    font-size: 16px;
    font-weight: 600;
    color: #c2410c;

    .total-amount {
      font-size: 20px;
      color: #ea580c;
    }
  }
}
</style>
