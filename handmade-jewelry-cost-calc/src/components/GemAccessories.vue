<template>
  <div class="gem-accessories">
    <div class="section-header">
      <h3>💍 宝石配饰</h3>
      <button class="add-btn" @click="addGem">+ 添加宝石</button>
    </div>
    <div class="gem-list">
      <div v-for="(item, index) in gems" :key="index" class="gem-item">
        <select v-model="item.type" @change="onTypeChange(index)">
          <option value="">选择宝石类型</option>
          <option v-for="gem in GEM_TYPES" :key="gem.name" :value="gem.name">
            {{ gem.name }} (¥{{ gem.pricePerCarat || gem.pricePerGram }}/{{ gem.pricePerGram ? '克' : '克拉' }})
          </option>
        </select>
        <input 
          type="number" 
          v-model.number="item.carats" 
          placeholder="重量 (克拉/克)" 
          step="0.01"
          min="0"
        />
        <input 
          type="number" 
          v-model.number="item.pricePerCarat" 
          placeholder="单价 (元/克拉)" 
          step="0.01"
          min="0"
        />
        <span class="item-cost">¥{{ calculateItemCost(item).toFixed(2) }}</span>
        <button class="remove-btn" @click="removeGem(index)">×</button>
      </div>
    </div>
    <div class="section-total">
      <span>宝石小计:</span>
      <span class="total-amount">¥{{ totalCost.toFixed(2) }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { GEM_TYPES } from '../utils/costCalculator'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue'])

const gems = ref([...props.modelValue])

watch(gems, (newVal) => {
  emit('update:modelValue', newVal)
}, { deep: true })

watch(() => props.modelValue, (newVal) => {
  gems.value = [...newVal]
}, { deep: true })

const totalCost = computed(() => {
  return gems.value.reduce((sum, item) => sum + calculateItemCost(item), 0)
})

function calculateItemCost(item) {
  const unitPrice = item.pricePerCarat || item.pricePerGram || 0
  const quantity = item.carats || item.weight || 0
  return unitPrice * quantity
}

function onTypeChange(index) {
  const selected = GEM_TYPES.find(g => g.name === gems.value[index].type)
  if (selected) {
    if (selected.pricePerCarat) {
      gems.value[index].pricePerCarat = selected.pricePerCarat
      gems.value[index].pricePerGram = undefined
    } else if (selected.pricePerGram) {
      gems.value[index].pricePerGram = selected.pricePerGram
      gems.value[index].pricePerCarat = undefined
    }
  }
}

function addGem() {
  gems.value.push({
    type: '',
    carats: 0,
    pricePerCarat: 0
  })
}

function removeGem(index) {
  gems.value.splice(index, 1)
}
</script>

<style lang="less" scoped>
.gem-accessories {
  background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  border: 1px solid #bbf7d0;

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    h3 {
      margin: 0;
      color: #15803d;
      font-size: 18px;
    }

    .add-btn {
      background: #22c55e;
      color: white;
      border: none;
      padding: 6px 14px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.2s;

      &:hover {
        background: #16a34a;
        transform: translateY(-1px);
      }
    }
  }

  .gem-list {
    display: flex;
    flex-direction: column;
    gap: 10px;

    .gem-item {
      display: flex;
      gap: 10px;
      align-items: center;
      background: white;
      padding: 12px;
      border-radius: 8px;
      border: 1px solid #bbf7d0;

      select, input {
        padding: 8px 12px;
        border: 1px solid #86efac;
        border-radius: 6px;
        font-size: 14px;
        background: white;
        color: #1f2937;

        &:focus {
          outline: none;
          border-color: #22c55e;
          box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1);
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
        color: #15803d;
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
    border-top: 2px dashed #86efac;
    font-size: 16px;
    font-weight: 600;
    color: #15803d;

    .total-amount {
      font-size: 20px;
      color: #16a34a;
    }
  }
}
</style>
