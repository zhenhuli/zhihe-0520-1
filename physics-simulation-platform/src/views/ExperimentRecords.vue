<template>
  <div class="records-container">
    <div class="page-header">
      <h1 class="page-title">实验台账</h1>
      <n-space>
        <n-input v-model:value="searchText" placeholder="搜索实验名称..." style="width: 240px" clearable>
          <template #prefix>
            <n-icon>🔍</n-icon>
          </template>
        </n-input>
        <n-select v-model:value="filterType" placeholder="按类型筛选" style="width: 180px" clearable>
          <n-option v-for="(info, type) in store.SIMULATION_TYPES" :key="type" :label="info.name" :value="type" />
        </n-select>
        <n-button type="primary" @click="showCreateModal = true">
          <template #icon>
            <n-icon>➕</n-icon>
          </template>
          新建台账
        </n-button>
      </n-space>
    </div>

    <n-card :bordered="false" class="content-card">
      <n-table v-if="filteredRecords.length > 0" :single-line="false" striped>
        <thead>
          <tr>
            <th style="width: 200px;">实验名称</th>
            <th style="width: 120px;">实验类型</th>
            <th style="width: 120px;">实验人员</th>
            <th style="width: 180px;">创建时间</th>
            <th style="width: 180px;">更新时间</th>
            <th style="width: 320px;">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="record in filteredRecords" :key="record.id">
            <td>
              <div class="record-title">{{ record.title }}</div>
              <div class="record-desc" v-if="record.purpose">{{ record.purpose.substring(0, 50) }}...</div>
            </td>
            <td>
              <n-tag :type="getTagType(record.simulationType)" size="small">
                {{ store.getTypeName(record.simulationType) }}
              </n-tag>
            </td>
            <td>{{ record.experimenter || '-' }}</td>
            <td>{{ formatDate(record.createdAt) }}</td>
            <td>{{ formatDate(record.updatedAt) }}</td>
            <td>
              <n-space>
                <n-button size="small" @click="viewRecord(record)">查看</n-button>
                <n-button size="small" type="primary" @click="reproduceExperiment(record)">复现</n-button>
                <n-button size="small" type="success" @click="generateReport(record)">生成报告</n-button>
                <n-button size="small" type="warning" @click="addToCompare(record)">对比</n-button>
                <n-button size="small" type="error" @click="deleteRecord(record)">删除</n-button>
              </n-space>
            </td>
          </tr>
        </tbody>
      </n-table>
      <n-empty v-else description="暂无实验记录" />
    </n-card>

    <n-modal v-model:show="showCreateModal" preset="card" title="新建实验台账" style="width: 700px">
      <n-form ref="formRef" :model="formData" label-placement="left" label-width="100px">
        <n-form-item label="实验名称" required>
          <n-input v-model:value="formData.title" placeholder="请输入实验名称" />
        </n-form-item>
        <n-form-item label="实验类型" required>
          <n-select v-model:value="formData.simulationType" placeholder="请选择实验类型">
            <n-option v-for="(info, type) in store.SIMULATION_TYPES" :key="type" :label="info.name" :value="type" />
          </n-select>
        </n-form-item>
        <n-form-item label="实验人员">
          <n-input v-model:value="formData.experimenter" placeholder="请输入实验人员姓名" />
        </n-form-item>
        <n-form-item label="实验目的">
          <n-input v-model:value="formData.purpose" type="textarea" :rows="3" placeholder="请输入实验目的" />
        </n-form-item>
        <n-form-item label="实验原理">
          <n-input v-model:value="formData.principle" type="textarea" :rows="3" placeholder="请输入实验原理" />
        </n-form-item>
        <n-form-item label="备注">
          <n-input v-model:value="formData.notes" type="textarea" :rows="2" placeholder="其他备注信息" />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showCreateModal = false">取消</n-button>
          <n-button type="primary" @click="createRecord">创建</n-button>
        </n-space>
      </template>
    </n-modal>

    <n-modal v-model:show="showDetailModal" preset="card" title="实验台账详情" style="width: 800px">
      <div v-if="currentRecord" class="detail-content">
        <n-descriptions bordered :column="2">
          <n-descriptions-item label="实验名称">{{ currentRecord.title }}</n-descriptions-item>
          <n-descriptions-item label="实验类型">
            <n-tag :type="getTagType(currentRecord.simulationType)">
              {{ store.getTypeName(currentRecord.simulationType) }}
            </n-tag>
          </n-descriptions-item>
          <n-descriptions-item label="实验人员">{{ currentRecord.experimenter || '-' }}</n-descriptions-item>
          <n-descriptions-item label="创建时间">{{ formatDate(currentRecord.createdAt) }}</n-descriptions-item>
          <n-descriptions-item label="更新时间">{{ formatDate(currentRecord.updatedAt) }}</n-descriptions-item>
          <n-descriptions-item label="所属分类">{{ store.getTypeCategory(currentRecord.simulationType) }}</n-descriptions-item>
        </n-descriptions>

        <n-divider title="实验目的" />
        <p>{{ currentRecord.purpose || '暂无描述' }}</p>

        <n-divider title="实验原理" />
        <p>{{ currentRecord.principle || '暂无描述' }}</p>

        <n-divider title="实验参数" />
        <n-descriptions v-if="currentRecord.params" bordered :column="2">
          <n-descriptions-item v-for="(value, key) in currentRecord.params" :key="key" :label="key">
            {{ typeof value === 'number' ? value.toFixed(4) : value }}
          </n-descriptions-item>
        </n-descriptions>
        <p v-else>暂无参数记录</p>

        <n-divider title="实验结果" v-if="currentRecord.results" />
        <n-descriptions v-if="currentRecord.results" bordered :column="2">
          <n-descriptions-item v-for="(value, key) in currentRecord.results" :key="key" :label="key">
            {{ typeof value === 'number' ? value.toFixed(4) : value }}
          </n-descriptions-item>
        </n-descriptions>

        <n-divider title="备注" />
        <p>{{ currentRecord.notes || '暂无备注' }}</p>
      </div>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showDetailModal = false">关闭</n-button>
          <n-button type="primary" @click="reproduceExperiment(currentRecord)">一键复现</n-button>
          <n-button type="success" @click="generateReport(currentRecord)">下载报告</n-button>
        </n-space>
      </template>
    </n-modal>
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
const showCreateModal = ref(false)
const showDetailModal = ref(false)
const currentRecord = ref(null)
const formRef = ref(null)

const formData = ref({
  title: '',
  simulationType: null,
  experimenter: '',
  purpose: '',
  principle: '',
  notes: '',
  params: {},
  results: {},
  conclusion: ''
})

const filteredRecords = computed(() => {
  let records = store.allRecords
  if (searchText.value) {
    const keyword = searchText.value.toLowerCase()
    records = records.filter(r => r.title.toLowerCase().includes(keyword))
  }
  if (filterType.value) {
    records = records.filter(r => r.simulationType === filterType.value)
  }
  return records
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

function formatDate(timestamp) {
  return new Date(timestamp).toLocaleString()
}

function createRecord() {
  if (!formData.value.title || !formData.value.simulationType) {
    message.warning('请填写必填项')
    return
  }
  store.saveExperimentRecord({ ...formData.value })
  message.success('实验台账创建成功')
  showCreateModal.value = false
  resetForm()
}

function resetForm() {
  formData.value = {
    title: '',
    simulationType: null,
    experimenter: '',
    purpose: '',
    principle: '',
    notes: '',
    params: {},
    results: {},
    conclusion: ''
  }
}

function viewRecord(record) {
  currentRecord.value = record
  showDetailModal.value = true
}

function deleteRecord(record) {
  if (confirm(`确定要删除实验"${record.title}"吗？`)) {
    store.deleteExperimentRecord(record.id)
    message.success('删除成功')
  }
}

function reproduceExperiment(record) {
  const routeMap = {
    'pendulum': '/pendulum',
    'spring-damper': '/spring-damper',
    'free-fall': '/free-fall',
    'diffraction': '/diffraction',
    'sound-spectrum': '/sound-spectrum',
    'magnetic-field': '/magnetic-field',
    'heat-diffusion': '/heat-diffusion'
  }
  const route = routeMap[record.simulationType]
  if (route) {
    sessionStorage.setItem('reproduce_params', JSON.stringify({
      type: record.simulationType,
      params: record.params || {}
    }))
    router.push(route)
    message.success('正在复现实验...')
  }
}

function generateReport(record) {
  store.downloadReport(record)
  message.success('实验报告已生成并开始下载')
}

function addToCompare(record) {
  const item = {
    id: record.id,
    type: 'record',
    simulationType: record.simulationType,
    name: record.title,
    params: record.params || {}
  }
  if (store.addToComparison(item)) {
    message.success('已添加到对比列表')
  }
}
</script>

<style scoped>
.records-container {
  padding: 20px;
  height: calc(100vh - 64px);
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  margin: 0;
}

.content-card {
  flex: 1;
  overflow: auto;
}

.record-title {
  font-weight: 500;
  margin-bottom: 4px;
}

.record-desc {
  font-size: 12px;
  color: #999;
}

.detail-content {
  max-height: 60vh;
  overflow-y: auto;
}

.detail-content p {
  line-height: 1.8;
  color: #333;
}
</style>
