<template>
  <div ref="chartRef" class="chart-container"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
  xData: {
    type: Array,
    required: true
  },
  yData: {
    type: Array,
    required: true
  },
  color: {
    type: String,
    default: '#3498db'
  }
})

const chartRef = ref(null)
let chartInstance = null

const initChart = () => {
  if (!chartRef.value) return
  
  chartInstance = echarts.init(chartRef.value)
  
  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: '{b}<br/>支出: ¥{c}'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: props.xData,
      axisLine: {
        lineStyle: {
          color: 'var(--border-color)'
        }
      },
      axisLabel: {
        color: 'var(--text-secondary)',
        fontSize: 11,
        rotate: 45
      }
    },
    yAxis: {
      type: 'value',
      axisLine: {
        show: false
      },
      splitLine: {
        lineStyle: {
          color: 'var(--border-color)',
          type: 'dashed'
        }
      },
      axisLabel: {
        color: 'var(--text-secondary)',
        formatter: '¥{value}'
      }
    },
    series: [
      {
        data: props.yData,
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: {
          color: props.color,
          width: 3
        },
        itemStyle: {
          color: props.color
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: props.color + '40' },
              { offset: 1, color: props.color + '05' }
            ]
          }
        }
      }
    ]
  }
  
  chartInstance.setOption(option)
}

const handleResize = () => {
  chartInstance?.resize()
}

onMounted(() => {
  initChart()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  chartInstance?.dispose()
})

watch(() => [props.xData, props.yData], () => {
  initChart()
}, { deep: true })
</script>
