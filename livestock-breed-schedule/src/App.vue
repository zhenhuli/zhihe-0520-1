<script setup>
import { ref, computed, h } from 'vue'
import { NMessageProvider, useMessage, NLayout, NLayoutHeader, NLayoutContent, NLayoutSider, NMenu, NSpace, NCard, NIcon } from 'naive-ui'
import { 
  HomeOutline, 
  PawOutline, 
  CalendarOutline, 
  MedicalOutline, 
  BarChartOutline, 
  ListOutline 
} from '@vicons/ionicons5'
import { format } from 'date-fns'
import LivestockForm from './components/LivestockForm.vue'
import CycleOverview from './components/CycleOverview.vue'
import StageTimeline from './components/StageTimeline.vue'
import VaccinationTable from './components/VaccinationTable.vue'
import FeedCalculator from './components/FeedCalculator.vue'
import FullCycleTable from './components/FullCycleTable.vue'
import { calculateCycle } from './utils/calculator'

const activeKey = ref('overview')
const cycleData = ref(null)
const batchName = ref('')

const menuOptions = [
  { label: '总览', key: 'overview', icon: () => h(NIcon, null, { default: () => h(HomeOutline) }) },
  { label: '生长阶段', key: 'stages', icon: () => h(NIcon, null, { default: () => h(PawOutline) }) },
  { label: '防疫计划', key: 'vaccination', icon: () => h(NIcon, null, { default: () => h(MedicalOutline) }) },
  { label: '饲料核算', key: 'feed', icon: () => h(NIcon, null, { default: () => h(BarChartOutline) }) },
  { label: '全周期计划', key: 'schedule', icon: () => h(NIcon, null, { default: () => h(ListOutline) }) }
]

function handleFormSubmit(formData) {
  try {
    const dateObj = formData.purchaseDate instanceof Date 
      ? formData.purchaseDate 
      : new Date(formData.purchaseDate)
    const purchaseDate = format(dateObj, 'yyyy-MM-dd')
    cycleData.value = calculateCycle(formData.type, purchaseDate, formData.quantity)
    if (formData.batchName) {
      batchName.value = formData.batchName
    }
  } catch (e) {
    console.error('日期处理错误:', e)
  }
}

const pageTitle = computed(() => {
  const menu = menuOptions.find(m => m.key === activeKey.value)
  return menu ? menu.label : ''
})
</script>

<template>
  <NMessageProvider>
    <NLayout style="min-height: 100vh">
      <NLayoutHeader style="padding: 0 24px; height: 64px; display: flex; align-items: center; background: #18a058; color: white;">
        <h1 style="margin: 0; font-size: 20px;">🐔 家禽家畜养殖周期管理系统</h1>
      </NLayoutHeader>
      <NLayout has-sider>
        <NLayoutSider width="240" bordered>
          <div style="padding: 16px;">
            <LivestockForm @submit="handleFormSubmit" />
          </div>
          <NMenu
            v-model:value="activeKey"
            :options="menuOptions"
            :disabled="!cycleData"
          />
        </NLayoutSider>
        <NLayoutContent style="padding: 24px;">
          <div v-if="!cycleData" style="display: flex; justify-content: center; align-items: center; height: 400px;">
            <NCard style="max-width: 500px;">
              <template #header>
                <span>👋 欢迎使用养殖周期管理系统</span>
              </template>
              <p>请在左侧录入种苗信息，系统将自动为您生成：</p>
              <ul>
                <li>📊 完整的生长阶段划分</li>
                <li>🍖 智能喂食频次推送</li>
                <li>💉 疫病防疫节点提醒</li>
                <li>📅 出栏最佳时间预测</li>
                <li>🌾 饲料消耗量精准核算</li>
                <li>📋 全周期养殖计划表</li>
              </ul>
            </NCard>
          </div>
          
          <template v-else>
            <NSpace vertical size="large" style="width: 100%;">
              <div>
                <h2 style="margin: 0 0 16px 0;">{{ pageTitle }}</h2>
                <span v-if="batchName" style="color: #999;">批次：{{ batchName }}</span>
              </div>
              
              <CycleOverview v-if="activeKey === 'overview'" :cycle-data="cycleData" />
              <StageTimeline v-if="activeKey === 'stages'" :cycle-data="cycleData" />
              <VaccinationTable v-if="activeKey === 'vaccination'" :cycle-data="cycleData" />
              <FeedCalculator v-if="activeKey === 'feed'" :cycle-data="cycleData" />
              <FullCycleTable v-if="activeKey === 'schedule'" :cycle-data="cycleData" />
            </NSpace>
          </template>
        </NLayoutContent>
      </NLayout>
    </NLayout>
  </NMessageProvider>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background: #f5f5f5;
}

ul {
  padding-left: 20px;
  margin: 8px 0;
}

li {
  margin: 4px 0;
}
</style>
