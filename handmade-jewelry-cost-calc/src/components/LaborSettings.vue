<template>
  <div class="labor-settings">
    <div class="section-header">
      <h3>⏱️ 工时与损耗配置</h3>
    </div>
    
    <div class="settings-grid">
      <div class="setting-item">
        <label>手工工时</label>
        <div class="input-group">
          <input 
            type="number" 
            v-model.number="localSettings.laborHours" 
            placeholder="工时 (小时)" 
            step="0.1"
            min="0"
          />
          <span class="unit">小时</span>
        </div>
      </div>
      
      <div class="setting-item">
        <label>工时单价</label>
        <div class="input-group">
          <input 
            type="number" 
            v-model.number="localSettings.hourlyRate" 
            placeholder="元/小时" 
            step="1"
            min="0"
          />
          <span class="unit">元/小时</span>
        </div>
      </div>
      
      <div class="setting-item">
        <label>材料损耗率</label>
        <div class="input-group">
          <input 
            type="number" 
            v-model.number="localSettings.materialLossRatio" 
            placeholder="损耗比例 %" 
            step="0.1"
            min="0"
            max="100"
          />
          <span class="unit">%</span>
        </div>
        <div class="loss-preview">
          预计损耗: ¥{{ estimatedMaterialLoss.toFixed(2) }}
        </div>
      </div>
      
      <div class="setting-item">
        <label>工时损耗率</label>
        <div class="input-group">
          <input 
            type="number" 
            v-model.number="localSettings.laborLossRatio" 
            placeholder="损耗比例 %" 
            step="0.1"
            min="0"
            max="100"
          />
          <span class="unit">%</span>
        </div>
        <div class="loss-preview">
          预计损耗: ¥{{ estimatedLaborLoss.toFixed(2) }}
        </div>
      </div>
    </div>

    <div class="labor-summary">
      <div class="summary-item">
        <span>基础工时费用:</span>
        <span class="amount">¥{{ baseLaborCost.toFixed(2) }}</span>
      </div>
      <div class="summary-item">
        <span>含损耗工时费用:</span>
        <span class="amount highlight">¥{{ totalLaborCost.toFixed(2) }}</span>
      </div>
    </div>

    <div class="quick-presets">
      <span class="preset-label">快速设置:</span>
      <button 
        v-for="preset in presets" 
        :key="preset.name"
        class="preset-btn"
        @click="applyPreset(preset)"
      >
        {{ preset.name }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({
      laborHours: 2,
      hourlyRate: 80,
      materialLossRatio: 10,
      laborLossRatio: 15
    })
  },
  baseMaterialCost: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['update:modelValue'])

const localSettings = ref({ ...props.modelValue })

watch(localSettings, (newVal) => {
  emit('update:modelValue', { ...newVal })
}, { deep: true })

watch(() => props.modelValue, (newVal) => {
  localSettings.value = { ...newVal }
}, { deep: true })

const baseLaborCost = computed(() => {
  return localSettings.value.laborHours * localSettings.value.hourlyRate
})

const totalLaborCost = computed(() => {
  return baseLaborCost.value * (1 + localSettings.value.laborLossRatio / 100)
})

const estimatedMaterialLoss = computed(() => {
  return props.baseMaterialCost * (localSettings.value.materialLossRatio / 100)
})

const estimatedLaborLoss = computed(() => {
  return baseLaborCost.value * (localSettings.value.laborLossRatio / 100)
})

const presets = [
  { name: '简单款', laborHours: 1, hourlyRate: 60, materialLossRatio: 5, laborLossRatio: 10 },
  { name: '普通款', laborHours: 2, hourlyRate: 80, materialLossRatio: 10, laborLossRatio: 15 },
  { name: '复杂款', laborHours: 4, hourlyRate: 100, materialLossRatio: 15, laborLossRatio: 20 },
  { name: '精品款', laborHours: 8, hourlyRate: 150, materialLossRatio: 20, laborLossRatio: 25 },
]

function applyPreset(preset) {
  localSettings.value = { ...preset }
}
</script>

<style lang="less" scoped>
.labor-settings {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  border: 1px solid #bfdbfe;

  .section-header {
    margin-bottom: 16px;

    h3 {
      margin: 0;
      color: #1d4ed8;
      font-size: 18px;
    }
  }

  .settings-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
    margin-bottom: 20px;

    @media (max-width: 640px) {
      grid-template-columns: 1fr;
    }

    .setting-item {
      background: rgba(255, 255, 255, 0.7);
      padding: 14px;
      border-radius: 8px;
      border: 1px solid #bfdbfe;

      label {
        display: block;
        margin-bottom: 8px;
        color: #1e40af;
        font-weight: 500;
        font-size: 14px;
      }

      .input-group {
        display: flex;
        align-items: center;
        gap: 8px;

        input {
          flex: 1;
          padding: 8px 12px;
          border: 1px solid #93c5fd;
          border-radius: 6px;
          font-size: 14px;
          background: white;
          color: #1f2937;

          &:focus {
            outline: none;
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
          }
        }

        .unit {
          color: #1e40af;
          font-size: 13px;
          font-weight: 500;
          min-width: 50px;
        }
      }

      .loss-preview {
        margin-top: 8px;
        font-size: 12px;
        color: #64748b;
        font-style: italic;
      }
    }
  }

  .labor-summary {
    background: rgba(255, 255, 255, 0.8);
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 16px;
    border: 1px solid #bfdbfe;

    .summary-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 6px 0;

      span:first-child {
        color: #1e40af;
        font-weight: 500;
      }

      .amount {
        font-weight: 600;
        color: #2563eb;
      }

      .amount.highlight {
        font-size: 18px;
        color: #1d4ed8;
      }
    }
  }

  .quick-presets {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;

    .preset-label {
      color: #1e40af;
      font-weight: 500;
      font-size: 14px;
    }

    .preset-btn {
      background: #3b82f6;
      color: white;
      border: none;
      padding: 6px 12px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 12px;
      transition: all 0.2s;

      &:hover {
        background: #2563eb;
        transform: translateY(-1px);
      }
    }
  }
}
</style>
