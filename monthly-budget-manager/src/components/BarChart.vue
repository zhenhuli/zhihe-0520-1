<template>
  <div ref="chartRef" class="chart-container"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
  categories: {
    type: Array,
    required: true
  },
  values: {
    type: Array,
    required: true
  },
  colors: {
    type: Array,
    default: () => []
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
      axisPointer: {
        type: 'shadow'
      },
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
      data: props.categories,
      axisLine: {
        lineStyle: {
          color: 'var(--border-color)'
        }
      },
      axisLabel: {
        color: 'var(--text-secondary)',
        fontSize: 12
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
        data: props.values.map((value, index) => ({
          value,
          itemStyle: {
            color: props.colors[index] || '#3498db',
            borderRadius: [6, 6, 0, 0]
          }
        })),
        type: 'bar',
        barWidth: '50%'
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

watch(() => [props.categories, props.values], () => {
  initChart()
}, { deep: true })
</script>
