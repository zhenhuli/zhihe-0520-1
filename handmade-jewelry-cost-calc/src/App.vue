<template>
  <div class="app-container">
    <header class="app-header">
      <div class="header-content">
        <h1>💍 手工首饰精准成本核算器</h1>
        <p class="subtitle">专业的首饰成本计算与定价分析工具</p>
      </div>
    </header>

    <main class="main-content">
      <div class="input-section">
        <MetalMaterials v-model="materials" />
        <GemAccessories v-model="gems" />
        <WireMaterials 
          v-model:wires="wires" 
          v-model:accessories="accessories" 
        />
        <LaborSettings 
          v-model="laborSettings" 
          :baseMaterialCost="baseMaterialCost"
        />
      </div>

      <div class="result-section">
        <CostAnalysis 
          :costData="costData" 
          :settings="laborSettings"
        />
        <MarketPricing :totalCost="costData.totalCost" />
        
        <div class="quick-actions">
          <button class="action-btn reset" @click="resetAll">
            🔄 重置所有数据
          </button>
          <button class="action-btn example" @click="loadExample">
            📋 加载示例数据
          </button>
        </div>
      </div>
    </main>

    <footer class="app-footer">
      <p>© 2024 手工首饰成本核算器 | 让每一件作品都有合理的价值</p>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import MetalMaterials from './components/MetalMaterials.vue'
import GemAccessories from './components/GemAccessories.vue'
import WireMaterials from './components/WireMaterials.vue'
import LaborSettings from './components/LaborSettings.vue'
import CostAnalysis from './components/CostAnalysis.vue'
import MarketPricing from './components/MarketPricing.vue'
import { calculateTotalCost, calculateMaterialCost, calculateWireCost, calculateAccessoryCost } from './utils/costCalculator'

const materials = ref([])
const gems = ref([])
const wires = ref([])
const accessories = ref([])
const laborSettings = ref({
  laborHours: 2,
  hourlyRate: 80,
  materialLossRatio: 10,
  laborLossRatio: 15
})

const baseMaterialCost = computed(() => {
  return calculateMaterialCost(materials.value) + 
         calculateWireCost(wires.value) + 
         calculateAccessoryCost(accessories.value)
})

const costData = computed(() => {
  return calculateTotalCost({
    materials: materials.value,
    gems: gems.value,
    wires: wires.value,
    accessories: accessories.value,
    laborHours: laborSettings.value.laborHours,
    hourlyRate: laborSettings.value.hourlyRate,
    materialLossRatio: laborSettings.value.materialLossRatio,
    laborLossRatio: laborSettings.value.laborLossRatio
  })
})

function resetAll() {
  materials.value = []
  gems.value = []
  wires.value = []
  accessories.value = []
  laborSettings.value = {
    laborHours: 2,
    hourlyRate: 80,
    materialLossRatio: 10,
    laborLossRatio: 15
  }
}

function loadExample() {
  materials.value = [
    { type: '黄金 (足金999)', weight: 3.5, pricePerGram: 520 }
  ]
  gems.value = [
    { type: '紫水晶', carats: 0.5, pricePerCarat: 150 }
  ]
  wires.value = [
    { type: '银线 (0.8mm)', length: 0.5, pricePerMeter: 5 }
  ]
  accessories.value = [
    { type: '弹簧扣', quantity: 1, pricePerUnit: 5 }
  ]
  laborSettings.value = {
    laborHours: 3,
    hourlyRate: 100,
    materialLossRatio: 10,
    laborLossRatio: 15
  }
}
</script>

<style lang="less">
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background: linear-gradient(135deg, #fef7f0 0%, #fdf2f8 50%, #f5f3ff 100%);
  min-height: 100vh;
}

#app {
  min-height: 100vh;
}

.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%);
  color: white;
  padding: 30px 20px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(139, 92, 246, 0.3);

  .header-content {
    max-width: 1200px;
    margin: 0 auto;

    h1 {
      font-size: 32px;
      font-weight: 700;
      margin-bottom: 8px;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }

    .subtitle {
      font-size: 16px;
      opacity: 0.9;
      font-weight: 300;
    }
  }
}

.main-content {
  flex: 1;
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;

  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
    max-width: 700px;
  }

  .input-section {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .result-section {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }
}

.quick-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-top: 20px;

  .action-btn {
    padding: 12px 24px;
    border: none;
    border-radius: 8px;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
    }

    &:active {
      transform: translateY(0);
    }

    &.reset {
      background: linear-gradient(135deg, #6b7280, #4b5563);
      color: white;
    }

    &.example {
      background: linear-gradient(135deg, #10b981, #059669);
      color: white;
    }
  }
}

.app-footer {
  background: #1f2937;
  color: #9ca3af;
  text-align: center;
  padding: 20px;
  font-size: 14px;

  p {
    margin: 0;
  }
}
</style>
