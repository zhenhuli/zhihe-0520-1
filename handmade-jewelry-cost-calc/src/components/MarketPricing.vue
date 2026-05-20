<template>
  <div class="market-pricing">
    <div class="section-header">
      <h3>💰 市场定价区间</h3>
    </div>
    
    <div class="pricing-settings">
      <div class="market-level-selector">
        <span class="label">目标市场:</span>
        <div class="level-buttons">
          <button 
            v-for="level in marketLevels" 
            :key="level.name"
            :class="['level-btn', { active: selectedMarket === level.name }]"
            @click="selectedMarket = level.name"
          >
            {{ level.label }}
          </button>
        </div>
      </div>
      
      <div class="custom-multiplier">
        <div class="multiplier-input">
          <label>最低倍率</label>
          <input 
            type="number" 
            v-model.number="customMultiplier.min" 
            step="0.1" 
            min="1"
          />
          <span class="x">x</span>
        </div>
        <div class="multiplier-input">
          <label>最高倍率</label>
          <input 
            type="number" 
            v-model.number="customMultiplier.max" 
            step="0.1" 
            min="1"
          />
          <span class="x">x</span>
        </div>
      </div>
    </div>

    <div class="pricing-display">
      <div class="pricing-card min">
        <div class="card-label">最低定价</div>
        <div class="card-price">¥{{ pricing.minPrice.toFixed(2) }}</div>
        <div class="card-profit">
          利润: ¥{{ pricing.minProfit.toFixed(2) }}
          <span class="margin">({{ pricing.minProfitMargin }}%)</span>
        </div>
      </div>
      
      <div class="pricing-card suggested">
        <div class="card-badge">推荐</div>
        <div class="card-label">建议定价</div>
        <div class="card-price">¥{{ pricing.suggestedPrice.toFixed(2) }}</div>
        <div class="card-profit">
          利润: ¥{{ pricing.suggestedProfit.toFixed(2) }}
          <span class="margin">({{ pricing.suggestedProfitMargin }}%)</span>
        </div>
      </div>
      
      <div class="pricing-card max">
        <div class="card-label">最高定价</div>
        <div class="card-price">¥{{ pricing.maxPrice.toFixed(2) }}</div>
        <div class="card-profit">
          利润: ¥{{ pricing.maxProfit.toFixed(2) }}
          <span class="margin">({{ pricing.maxProfitMargin }}%)</span>
        </div>
      </div>
    </div>

    <div class="pricing-bar">
      <div class="bar-track">
        <div 
          class="bar-fill" 
          :style="{ width: `${pricingPercentage}%`, left: `${(currentMultiplier.min / 6) * 100}%` }"
        ></div>
        <div 
          class="bar-indicator" 
          :style="{ left: `${(currentMultiplier.min / 6) * 100}%` }"
          :title="`最低: ${currentMultiplier.min}x`"
        >
          <span class="indicator-value">{{ currentMultiplier.min }}x</span>
        </div>
        <div 
          class="bar-indicator suggested" 
          :style="{ left: `${((currentMultiplier.min + currentMultiplier.max) / 2 / 6) * 100}%` }"
          :title="`建议: ${((currentMultiplier.min + currentMultiplier.max) / 2).toFixed(1)}x`"
        >
          <span class="indicator-value">{{ ((currentMultiplier.min + currentMultiplier.max) / 2).toFixed(1) }}x</span>
        </div>
        <div 
          class="bar-indicator" 
          :style="{ left: `${(currentMultiplier.max / 6) * 100}%` }"
          :title="`最高: ${currentMultiplier.max}x`"
        >
          <span class="indicator-value">{{ currentMultiplier.max }}x</span>
        </div>
      </div>
      <div class="bar-labels">
        <span>成本</span>
        <span>2x</span>
        <span>3x</span>
        <span>4x</span>
        <span>5x</span>
        <span>6x</span>
      </div>
    </div>

    <div class="market-info">
      <div class="info-item">
        <span class="info-label">市场参考:</span>
        <span class="info-value">{{ currentMarketInfo }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { calculatePricingRange } from '../utils/costCalculator'

const props = defineProps({
  totalCost: {
    type: Number,
    default: 0
  }
})

const marketLevels = [
  { name: 'taobao', label: '淘宝/电商', multiplier: { min: 2, max: 3.5 } },
  { name: 'studio', label: '工作室/定制', multiplier: { min: 3, max: 5 } },
  { name: 'boutique', label: '精品店/买手', multiplier: { min: 4, max: 6 } },
  { name: 'luxury', label: '高端/品牌', multiplier: { min: 5, max: 8 } },
]

const selectedMarket = ref('studio')

const customMultiplier = ref({
  min: 3,
  max: 5
})

const currentMultiplier = computed(() => {
  const level = marketLevels.find(l => l.name === selectedMarket.value)
  if (level) {
    return level.multiplier
  }
  return customMultiplier.value
})

watch(selectedMarket, (newVal) => {
  const level = marketLevels.find(l => l.name === newVal)
  if (level) {
    customMultiplier.value = { ...level.multiplier }
  }
})

const pricing = computed(() => {
  return calculatePricingRange(props.totalCost, currentMultiplier.value)
})

const pricingPercentage = computed(() => {
  const range = currentMultiplier.value.max - currentMultiplier.value.min
  return (range / 6) * 100
})

const currentMarketInfo = computed(() => {
  const level = marketLevels.find(l => l.name === selectedMarket.value)
  switch (selectedMarket.value) {
    case 'taobao':
      return '电商平台走量为主，价格亲民，适合大众消费'
    case 'studio':
      return '个人工作室定制，注重品质和设计感，客户群体精准'
    case 'boutique':
      return '线下精品店或买手店，强调独特性和购物体验'
    case 'luxury':
      return '高端品牌路线，强调品牌价值和稀缺性，针对高净值客户'
    default:
      return '自定义倍率，根据实际情况调整'
  }
})
</script>

<style lang="less" scoped>
.market-pricing {
  background: linear-gradient(135deg, #fdf4ff 0%, #fae8ff 100%);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  border: 1px solid #f5d0fe;

  .section-header {
    margin-bottom: 16px;

    h3 {
      margin: 0;
      color: #a21caf;
      font-size: 18px;
    }
  }

  .pricing-settings {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    margin-bottom: 24px;
    align-items: flex-start;

    .market-level-selector {
      flex: 1;
      min-width: 300px;

      .label {
        display: block;
        margin-bottom: 8px;
        color: #a21caf;
        font-weight: 500;
        font-size: 14px;
      }

      .level-buttons {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;

        .level-btn {
          padding: 8px 16px;
          border: 2px solid #e879f9;
          background: white;
          color: #a21caf;
          border-radius: 8px;
          cursor: pointer;
          font-size: 13px;
          transition: all 0.2s;
          font-weight: 500;

          &:hover {
            background: #f5d0fe;
            transform: translateY(-1px);
          }

          &.active {
            background: linear-gradient(135deg, #d946ef, #a21caf);
            color: white;
            border-color: #a21caf;
          }
        }
      }
    }

    .custom-multiplier {
      display: flex;
      gap: 16px;

      .multiplier-input {
        display: flex;
        flex-direction: column;
        gap: 6px;

        label {
          font-size: 12px;
          color: #a21caf;
          font-weight: 500;
        }

        input {
          width: 80px;
          padding: 8px 12px;
          border: 1px solid #e879f9;
          border-radius: 6px;
          font-size: 14px;
          text-align: center;
          color: #1f2937;

          &:focus {
            outline: none;
            border-color: #a21caf;
            box-shadow: 0 0 0 3px rgba(162, 28, 175, 0.1);
          }
        }

        .x {
          display: none;
        }
      }
    }
  }

  .pricing-display {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    margin-bottom: 20px;

    @media (max-width: 600px) {
      grid-template-columns: 1fr;
    }

    .pricing-card {
      background: white;
      border-radius: 10px;
      padding: 16px 12px;
      text-align: center;
      position: relative;
      border: 2px solid transparent;
      transition: all 0.3s;

      &.min {
        border-color: #86efac;
        background: linear-gradient(135deg, #f0fdf4, #dcfce7);
      }

      &.suggested {
        border-color: #fbbf24;
        background: linear-gradient(135deg, #fefce8, #fef3c7);
        box-shadow: 0 4px 15px rgba(251, 191, 36, 0.25);
      }

      &.max {
        border-color: #fca5a5;
        background: linear-gradient(135deg, #fef2f2, #fee2e2);
      }

      .card-badge {
        position: absolute;
        top: -10px;
        left: 50%;
        transform: translateX(-50%);
        background: linear-gradient(135deg, #f59e0b, #d97706);
        color: white;
        padding: 3px 10px;
        border-radius: 10px;
        font-size: 10px;
        font-weight: 600;
      }

      .card-label {
        font-size: 12px;
        color: #71717a;
        margin-bottom: 6px;
      }

      .card-price {
        font-size: 22px;
        font-weight: 700;
        color: #1f2937;
        margin-bottom: 6px;
      }

      .card-profit {
        font-size: 11px;
        color: #52525b;

        .margin {
          color: #16a34a;
          font-weight: 600;
        }
      }
    }
  }

  .pricing-bar {
    background: white;
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 16px;
    border: 1px solid #f5d0fe;

    .bar-track {
      position: relative;
      height: 12px;
      background: #e4e4e7;
      border-radius: 6px;
      margin-bottom: 20px;

      .bar-fill {
        position: absolute;
        height: 100%;
        background: linear-gradient(90deg, #22c55e, #fbbf24, #ef4444);
        border-radius: 6px;
        opacity: 0.3;
      }

      .bar-indicator {
        position: absolute;
        top: -4px;
        transform: translateX(-50%);
        width: 20px;
        height: 20px;
        background: #a21caf;
        border: 3px solid white;
        border-radius: 50%;
        cursor: pointer;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        transition: all 0.2s;

        &:hover {
          transform: translateX(-50%) scale(1.2);
        }

        &.suggested {
          background: #f59e0b;
          width: 24px;
          height: 24px;
          top: -6px;

          .indicator-value {
            top: -28px;
            background: #f59e0b;
          }
        }

        .indicator-value {
          position: absolute;
          top: -24px;
          left: 50%;
          transform: translateX(-50%);
          background: #a21caf;
          color: white;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 600;
          white-space: nowrap;
        }
      }
    }

    .bar-labels {
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      color: #71717a;
    }
  }

  .market-info {
    background: rgba(255, 255, 255, 0.7);
    padding: 12px 16px;
    border-radius: 8px;
    border-left: 4px solid #a21caf;

    .info-item {
      display: flex;
      gap: 8px;

      .info-label {
        font-weight: 600;
        color: #a21caf;
      }

      .info-value {
        color: #71717a;
        font-size: 14px;
      }
    }
  }
}
</style>
