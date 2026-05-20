<template>
  <div class="wire-materials">
    <div class="section-header">
      <h3>🧵 线材辅料</h3>
    </div>
    
    <div class="subsection">
      <div class="subsection-header">
        <h4>线材</h4>
        <button class="add-btn small" @click="addWire">+ 添加</button>
      </div>
      <div class="item-list">
        <div v-for="(item, index) in wires" :key="'wire-' + index" class="item-row">
          <select v-model="item.type" @change="onWireTypeChange(index)">
            <option value="">选择线材类型</option>
            <option v-for="wire in WIRE_TYPES" :key="wire.name" :value="wire.name">
              {{ wire.name }} (¥{{ wire.pricePerMeter }}/米)
            </option>
          </select>
          <input 
            type="number" 
            v-model.number="item.length" 
            placeholder="长度 (米)" 
            step="0.01"
            min="0"
          />
          <input 
            type="number" 
            v-model.number="item.pricePerMeter" 
            placeholder="单价 (元/米)" 
            step="0.01"
            min="0"
          />
          <span class="item-cost">¥{{ calculateWireCost(item).toFixed(2) }}</span>
          <button class="remove-btn" @click="removeWire(index)">×</button>
        </div>
      </div>
      <div class="subsection-total">
        <span>线材小计:</span>
        <span class="total-amount">¥{{ wireTotalCost.toFixed(2) }}</span>
      </div>
    </div>

    <div class="subsection">
      <div class="subsection-header">
        <h4>配件</h4>
        <button class="add-btn small" @click="addAccessory">+ 添加</button>
      </div>
      <div class="item-list">
        <div v-for="(item, index) in accessories" :key="'acc-' + index" class="item-row">
          <select v-model="item.type" @change="onAccessoryTypeChange(index)">
            <option value="">选择配件类型</option>
            <option v-for="acc in ACCESSORY_TYPES" :key="acc.name" :value="acc.name">
              {{ acc.name }} (¥{{ acc.pricePerUnit }}/件)
            </option>
          </select>
          <input 
            type="number" 
            v-model.number="item.quantity" 
            placeholder="数量" 
            step="1"
            min="0"
          />
          <input 
            type="number" 
            v-model.number="item.pricePerUnit" 
            placeholder="单价 (元/件)" 
            step="0.01"
            min="0"
          />
          <span class="item-cost">¥{{ calculateAccessoryCost(item).toFixed(2) }}</span>
          <button class="remove-btn" @click="removeAccessory(index)">×</button>
        </div>
      </div>
      <div class="subsection-total">
        <span>配件小计:</span>
        <span class="total-amount">¥{{ accessoryTotalCost.toFixed(2) }}</span>
      </div>
    </div>

    <div class="section-total">
      <span>线材辅料总计:</span>
      <span class="total-amount">¥{{ totalCost.toFixed(2) }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { WIRE_TYPES, ACCESSORY_TYPES } from '../utils/costCalculator'

const props = defineProps({
  wires: {
    type: Array,
    default: () => []
  },
  accessories: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:wires', 'update:accessories'])

const wires = ref([...props.wires])
const accessories = ref([...props.accessories])

watch(wires, (newVal) => {
  emit('update:wires', newVal)
}, { deep: true })

watch(accessories, (newVal) => {
  emit('update:accessories', newVal)
}, { deep: true })

watch(() => props.wires, (newVal) => {
  wires.value = [...newVal]
}, { deep: true })

watch(() => props.accessories, (newVal) => {
  accessories.value = [...newVal]
}, { deep: true })

const wireTotalCost = computed(() => {
  return wires.value.reduce((sum, item) => sum + calculateWireCost(item), 0)
})

const accessoryTotalCost = computed(() => {
  return accessories.value.reduce((sum, item) => sum + calculateAccessoryCost(item), 0)
})

const totalCost = computed(() => {
  return wireTotalCost.value + accessoryTotalCost.value
})

function calculateWireCost(item) {
  return (item.length || 0) * (item.pricePerMeter || 0)
}

function calculateAccessoryCost(item) {
  return (item.quantity || 0) * (item.pricePerUnit || 0)
}

function onWireTypeChange(index) {
  const selected = WIRE_TYPES.find(w => w.name === wires.value[index].type)
  if (selected) {
    wires.value[index].pricePerMeter = selected.pricePerMeter
  }
}

function onAccessoryTypeChange(index) {
  const selected = ACCESSORY_TYPES.find(a => a.name === accessories.value[index].type)
  if (selected) {
    accessories.value[index].pricePerUnit = selected.pricePerUnit
  }
}

function addWire() {
  wires.value.push({
    type: '',
    length: 0,
    pricePerMeter: 0
  })
}

function removeWire(index) {
  wires.value.splice(index, 1)
}

function addAccessory() {
  accessories.value.push({
    type: '',
    quantity: 0,
    pricePerUnit: 0
  })
}

function removeAccessory(index) {
  accessories.value.splice(index, 1)
}
</script>

<style lang="less" scoped>
.wire-materials {
  background: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  border: 1px solid #e9d5ff;

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    h3 {
      margin: 0;
      color: #7c3aed;
      font-size: 18px;
    }
  }

  .subsection {
    background: rgba(255, 255, 255, 0.6);
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 16px;

    .subsection-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;

      h4 {
        margin: 0;
        color: #7c3aed;
        font-size: 15px;
        font-weight: 600;
      }

      .add-btn.small {
        padding: 4px 10px;
        font-size: 12px;
      }
    }

    .add-btn {
      background: #a855f7;
      color: white;
      border: none;
      padding: 6px 14px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.2s;

      &:hover {
        background: #9333ea;
        transform: translateY(-1px);
      }
    }

    .subsection-total {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      gap: 10px;
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px dashed #d8b4fe;
      font-size: 14px;
      font-weight: 600;
      color: #7c3aed;

      .total-amount {
        font-size: 16px;
        color: #9333ea;
      }
    }
  }

  .item-list {
    display: flex;
    flex-direction: column;
    gap: 8px;

    .item-row {
      display: flex;
      gap: 8px;
      align-items: center;
      background: white;
      padding: 10px;
      border-radius: 6px;
      border: 1px solid #e9d5ff;

      select, input {
        padding: 6px 10px;
        border: 1px solid #d8b4fe;
        border-radius: 4px;
        font-size: 13px;
        background: white;
        color: #1f2937;

        &:focus {
          outline: none;
          border-color: #a855f7;
          box-shadow: 0 0 0 2px rgba(168, 85, 247, 0.1);
        }
      }

      select {
        flex: 2;
        min-width: 150px;
      }

      input {
        flex: 1;
        min-width: 80px;
      }

      .item-cost {
        flex: 1;
        text-align: right;
        font-weight: 600;
        color: #7c3aed;
        min-width: 80px;
        font-size: 13px;
      }

      .remove-btn {
        width: 26px;
        height: 26px;
        border-radius: 50%;
        border: none;
        background: #fecaca;
        color: #dc2626;
        font-size: 16px;
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
    border-top: 2px dashed #d8b4fe;
    font-size: 16px;
    font-weight: 600;
    color: #7c3aed;

    .total-amount {
      font-size: 20px;
      color: #9333ea;
    }
  }
}
</style>
