<template>
  <div class="cost-analysis">
    <div class="section-header">
      <h3>📊 成本利润分析表</h3>
    </div>
    
    <div class="analysis-content">
      <div class="cost-breakdown">
        <h4>成本构成明细</h4>
        <table class="cost-table">
          <thead>
            <tr>
              <th>项目</th>
              <th>基础成本</th>
              <th>损耗比例</th>
              <th>含损耗成本</th>
              <th>占比</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="item-name">贵金属主材</td>
              <td>¥{{ costData.baseMaterialCost.toFixed(2) }}</td>
              <td rowspan="3">{{ settings.materialLossRatio }}%</td>
              <td rowspan="3">¥{{ (costData.baseMaterialCost + costData.baseWireCost + costData.baseAccessoryCost).toFixed(2) }}<br/>
                <span class="loss-amount">+¥{{ materialLossAmount.toFixed(2) }}</span>
              </td>
              <td rowspan="3">{{ materialPercentage }}%</td>
            </tr>
            <tr>
              <td class="item-name">线材</td>
              <td>¥{{ costData.baseWireCost.toFixed(2) }}</td>
            </tr>
            <tr>
              <td class="item-name">配件</td>
              <td>¥{{ costData.baseAccessoryCost.toFixed(2) }}</td>
            </tr>
            <tr class="subtotal-row">
              <td class="item-name">材料小计</td>
              <td>¥{{ (costData.baseMaterialCost + costData.baseWireCost + costData.baseAccessoryCost).toFixed(2) }}</td>
              <td colspan="2"></td>
              <td>{{ materialPercentage }}%</td>
            </tr>
            <tr>
              <td class="item-name">宝石配饰</td>
              <td>¥{{ costData.baseGemCost.toFixed(2) }}</td>
              <td>-</td>
              <td>¥{{ costData.baseGemCost.toFixed(2) }}</td>
              <td>{{ gemPercentage }}%</td>
            </tr>
            <tr>
              <td class="item-name">手工工时</td>
              <td>¥{{ costData.baseLaborCost.toFixed(2) }}</td>
              <td>{{ settings.laborLossRatio }}%</td>
              <td>¥{{ costData.totalLaborCost.toFixed(2) }}<br/>
                <span class="loss-amount">+¥{{ laborLossAmount.toFixed(2) }}</span>
              </td>
              <td>{{ laborPercentage }}%</td>
            </tr>
            <tr class="total-row">
              <td class="item-name">总成本</td>
              <td>¥{{ baseTotal.toFixed(2) }}</td>
              <td colspan="2"></td>
              <td>100%</td>
            </tr>
            <tr class="final-total">
              <td colspan="4" class="final-label">单件成品成本:</td>
              <td class="final-amount">¥{{ costData.totalCost.toFixed(2) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="visual-chart">
        <h4>成本占比图</h4>
        <div class="pie-chart-container">
          <div class="pie-chart" :style="pieChartStyle">
            <div class="pie-center">
              <div class="center-label">总成本</div>
              <div class="center-value">¥{{ costData.totalCost.toFixed(0) }}</div>
            </div>
          </div>
          <div class="chart-legend">
            <div class="legend-item">
              <span class="legend-color" style="background: #f97316;"></span>
              <span>材料 ({{ materialPercentage }}%)</span>
            </div>
            <div class="legend-item">
              <span class="legend-color" style="background: #22c55e;"></span>
              <span>宝石 ({{ gemPercentage }}%)</span>
            </div>
            <div class="legend-item">
              <span class="legend-color" style="background: #3b82f6;"></span>
              <span>工时 ({{ laborPercentage }}%)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  costData: {
    type: Object,
    default: () => ({
      baseMaterialCost: 0,
      baseGemCost: 0,
      baseWireCost: 0,
      baseAccessoryCost: 0,
      totalMaterialCost: 0,
      baseLaborCost: 0,
      totalLaborCost: 0,
      totalCost: 0
    })
  },
  settings: {
    type: Object,
    default: () => ({
      materialLossRatio: 10,
      laborLossRatio: 15
    })
  }
})

const baseTotal = computed(() => {
  return props.costData.baseMaterialCost + 
         props.costData.baseGemCost + 
         props.costData.baseWireCost + 
         props.costData.baseAccessoryCost + 
         props.costData.baseLaborCost
})

const materialLossAmount = computed(() => {
  return (props.costData.baseMaterialCost + props.costData.baseWireCost + props.costData.baseAccessoryCost) * 
         (props.settings.materialLossRatio / 100)
})

const laborLossAmount = computed(() => {
  return props.costData.baseLaborCost * (props.settings.laborLossRatio / 100)
})

const materialPercentage = computed(() => {
  if (props.costData.totalCost === 0) return '0.0'
  return ((props.costData.totalMaterialCost / props.costData.totalCost) * 100).toFixed(1)
})

const gemPercentage = computed(() => {
  if (props.costData.totalCost === 0) return '0.0'
  return ((props.costData.baseGemCost / props.costData.totalCost) * 100).toFixed(1)
})

const laborPercentage = computed(() => {
  if (props.costData.totalCost === 0) return '0.0'
  return ((props.costData.totalLaborCost / props.costData.totalCost) * 100).toFixed(1)
})

const pieChartStyle = computed(() => {
  const material = parseFloat(materialPercentage.value)
  const gem = parseFloat(gemPercentage.value)
  const labor = parseFloat(laborPercentage.value)
  
  const angle1 = (material / 100) * 360
  const angle2 = angle1 + (gem / 100) * 360
  
  return {
    background: `conic-gradient(
      #f97316 0deg ${angle1}deg,
      #22c55e ${angle1}deg ${angle2}deg,
      #3b82f6 ${angle2}deg 360deg
    )`
  }
})
</script>

<style lang="less" scoped>
.cost-analysis {
  background: linear-gradient(135deg, #fefce8 0%, #fef9c3 100%);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  border: 1px solid #fde047;

  .section-header {
    margin-bottom: 16px;

    h3 {
      margin: 0;
      color: #a16207;
      font-size: 18px;
    }
  }

  .analysis-content {
    display: grid;
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .cost-breakdown {
    h4 {
      margin: 0 0 12px 0;
      color: #a16207;
      font-size: 15px;
    }

    .cost-table {
      width: 100%;
      border-collapse: collapse;
      background: white;
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid #fde047;
      table-layout: fixed;

      th, td {
        padding: 8px 8px;
        text-align: right;
        font-size: 12px;
        border-bottom: 1px solid #fef08a;
        word-wrap: break-word;

        &:first-child {
          text-align: left;
          width: 25%;
        }
      }

      th {
        background: #fef08a;
        color: #a16207;
        font-weight: 600;
        font-size: 11px;
      }

      .item-name {
        color: #78350f;
        font-weight: 500;
      }

      .loss-amount {
        color: #dc2626;
        font-size: 11px;
      }

      .subtotal-row {
        background: #fef9c3;
        
        td {
          font-weight: 600;
          color: #a16207;
        }
      }

      .total-row {
        background: #fef3c7;
        
        td {
          font-weight: 700;
          color: #92400e;
        }
      }

      .final-total {
        background: linear-gradient(90deg, #f59e0b, #d97706);

        td {
          padding: 14px 12px;
          font-size: 14px;
          color: white;
          border: none;
        }

        .final-label {
          text-align: right;
          font-weight: 600;
        }

        .final-amount {
          font-size: 18px;
          font-weight: 700;
        }
      }
    }
  }

  .visual-chart {
    h4 {
      margin: 0 0 12px 0;
      color: #a16207;
      font-size: 15px;
    }

    .pie-chart-container {
      background: white;
      padding: 16px;
      border-radius: 8px;
      border: 1px solid #fde047;
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 20px;
      justify-content: center;
    }

    .pie-chart {
      width: 140px;
      height: 140px;
      border-radius: 50%;
      position: relative;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

      .pie-center {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 75px;
        height: 75px;
        background: white;
        border-radius: 50%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.1);

        .center-label {
          font-size: 10px;
          color: #a16207;
        }

        .center-value {
          font-size: 14px;
          font-weight: 700;
          color: #d97706;
        }
      }
    }

    .chart-legend {
      display: flex;
      flex-direction: column;
      gap: 8px;
      width: 100%;

      .legend-item {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 13px;
        color: #78350f;

        .legend-color {
          width: 16px;
          height: 16px;
          border-radius: 4px;
        }
      }
    }
  }
}
</style>
