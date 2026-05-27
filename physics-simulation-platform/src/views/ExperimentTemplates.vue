<template>
  <div class="templates-container">
    <div class="page-header">
      <h1 class="page-title">实验模板</h1>
      <n-space>
        <n-input v-model:value="searchText" placeholder="搜索模板名称..." style="width: 240px" clearable>
          <template #prefix>
            <n-icon>🔍</n-icon>
          </template>
        </n-input>
        <n-select v-model:value="filterType" placeholder="按类型筛选" style="width: 180px" clearable>
          <n-option v-for="(info, type) in store.SIMULATION_TYPES" :key="type" :label="info.name" :value="type" />
        </n-select>
      </n-space>
    </div>

    <n-grid :cols="4" :x-gap="20" :y-gap="20" v-if="filteredTemplates.length > 0">
      <n-grid-item v-for="template in filteredTemplates" :key="template.id">
        <n-card hoverable :bordered="false" class="template-card">
          <template #header>
            <div class="card-header">
              <div class="template-icon" :class="getCategoryClass(template.simulationType)">
                {{ getTypeIcon(template.simulationType) }}
              </div>
              <div class="template-info">
                <div class="template-name">{{ template.name }}</div>
                <n-tag :type="getTagType(template.simulationType)" size="small">
                  {{ store.getTypeName(template.simulationType) }}
                </n-tag>
              </div>
            </div>
          </template>
          <div class="template-desc">{{ template.description || '暂无描述' }}</div>
          <div class="template-meta">
            <span>创建时间：{{ formatDate(template.createdAt) }}</span>
          </div>
          <div class="template-params">
            <n-space wrap>
              <n-tag v-for="(value, key) in template.params" :key="key" size="small" :bordered="false">
                {{ key }}: {{ typeof value === 'number' ? value.toFixed(2) : value }}
              </n-tag>
            </n-space>
          </div>
          <template #footer>
            <n-space justify="end">
              <n-button size="small" type="primary" @click="applyTemplate(template)">应用模板</n-button>
              <n-button size="small" type="warning" @click="saveAsRecord(template)">存为台账</n-button>
              <n-button size="small" type="error" @click="deleteTemplate(template)">删除</n-button>
            </n-space>
          </template>
        </n-card>
      </n-grid-item>
    </n-grid>
    <n-empty v-else description="暂无实验模板" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useSimulationStore } from '../stores/simulation'
import { useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'

const store = useSimulationStore()
const router = useRouter()
const message = useMessage()

const searchText = ref('')
const filterType = ref(null)

const filteredTemplates = computed(() => {
  let templates = store.allTemplates
  if (searchText.value) {
    const keyword = searchText.value.toLowerCase()
    templates = templates.filter(t => t.name.toLowerCase().includes(keyword))
  }
  if (filterType.value) {
    templates = templates.filter(t => t.simulationType === filterType.value)
  }
  return templates
})

function getTagType(type) {
  const category = store.getTypeCategory(type)
  const typeMap = {
    '力学': 'primary',
    '光学': 'info',
    '声学': 'info',
    '电磁学': 'error',
    '热学': 'warning'
  }
  return typeMap[category] || 'default'
}

function getCategoryClass(type) {
  const category = store.getTypeCategory(type)
  const classMap = {
    '力学': 'category-mechanics',
    '光学': 'category-optics',
    '声学': 'category-acoustics',
    '电磁学': 'category-electromagnetism',
    '热学': 'category-thermodynamics'
  }
  return classMap[category] || 'category-default'
}

function getTypeIcon(type) {
  const iconMap = {
    'pendulum': '●',
    'spring-damper': '◆',
    'free-fall': '▼',
    'diffraction': '◈',
    'sound-spectrum': '♪',
    'magnetic-field': '◆',
    'heat-diffusion': '▲'
  }
  return iconMap[type] || '■'
}

function formatDate(timestamp) {
  return new Date(timestamp).toLocaleDateString()
}

function applyTemplate(template) {
  const routeMap = {
    'pendulum': '/pendulum',
    'spring-damper': '/spring-damper',
    'free-fall': '/free-fall',
    'diffraction': '/diffraction',
    'sound-spectrum': '/sound-spectrum',
    'magnetic-field': '/magnetic-field',
    'heat-diffusion': '/heat-diffusion'
  }
  const route = routeMap[template.simulationType]
  if (route) {
    sessionStorage.setItem('reproduce_params', JSON.stringify({
      type: template.simulationType,
      params: template.params || {}
    }))
    router.push(route)
    message.success('模板已应用')
  }
}

function saveAsRecord(template) {
  const record = {
    title: template.name,
    simulationType: template.simulationType,
    experimenter: '',
    purpose: template.description || '',
    principle: '',
    notes: '',
    params: template.params || {},
    results: {},
    conclusion: ''
  }
  store.saveExperimentRecord(record)
  message.success('已保存为实验台账')
  router.push('/experiment-records')
}

function deleteTemplate(template) {
  if (confirm(`确定要删除模板"${template.name}"吗？`)) {
    store.deleteTemplate(template.id)
    message.success('删除成功')
  }
}
</script>

<style scoped>
.templates-container {
  padding: 20px;
  height: calc(100vh - 64px);
  overflow-y: auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  margin: 0;
}

.template-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.template-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
  font-weight: bold;
}

.category-mechanics { background: #18a058; }
.category-optics { background: #722ed1; }
.category-acoustics { background: #13c2c2; }
.category-electromagnetism { background: #d03050; }
.category-thermodynamics { background: #fa541c; }
.category-default { background: #999; }

.template-info {
  flex: 1;
  min-width: 0;
}

.template-name {
  font-weight: 600;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.template-desc {
  font-size: 13px;
  color: #666;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 36px;
}

.template-meta {
  font-size: 12px;
  color: #999;
  margin-bottom: 12px;
}

.template-params {
  flex: 1;
  margin-bottom: 12px;
  max-height: 100px;
  overflow-y: auto;
}
</style>
