import { ref, reactive, computed } from 'vue'
import { useSimulationStore } from '../stores/simulation'
import { useMessage } from 'naive-ui'
import { useRouter } from 'vue-router'

export function useExperimentTools(simulationType, params, engine, getResults = null) {
  const store = useSimulationStore()
  const message = useMessage()
  const router = useRouter()

  const showSaveRecordModal = ref(false)
  const showSaveTemplateModal = ref(false)
  const showLoadTemplateModal = ref(false)
  const showGenerateReportModal = ref(false)
  const showAddToCompare = ref(false)

  const recordForm = reactive({
    title: '',
    experimenter: '',
    purpose: '',
    notes: ''
  })

  const templateForm = reactive({
    name: '',
    description: ''
  })

  const reportForm = reactive({
    title: '',
    experimenter: '',
    purpose: '',
    principle: '',
    conclusion: ''
  })

  const availableTemplates = computed(() => store.getTemplatesByType(simulationType))
  const currentCompareInfo = computed(() => ({
    params: { ...params }
  }))

  function saveAsRecord(principleText = '') {
    if (!recordForm.title.trim()) {
      message.warning('请输入实验名称')
      return
    }
    let results = {}
    if (getResults && typeof getResults === 'function') {
      results = getResults()
    } else if (engine && engine.dataHistory) {
      const latestData = engine.dataHistory[engine.dataHistory.length - 1]
      if (latestData) {
        results = {
          运行时间: latestData.time,
          ...latestData
        }
      }
    }
    
    store.saveExperimentRecord({
      title: recordForm.title,
      simulationType,
      experimenter: recordForm.experimenter,
      purpose: recordForm.purpose,
      principle: principleText,
      notes: recordForm.notes,
      params: { ...params },
      results,
      conclusion: ''
    })
    message.success('实验台账保存成功')
    showSaveRecordModal.value = false
    resetRecordForm()
  }

  function resetRecordForm() {
    recordForm.title = ''
    recordForm.experimenter = ''
    recordForm.purpose = ''
    recordForm.notes = ''
  }

  function saveAsTemplate() {
    if (!templateForm.name.trim()) {
      message.warning('请输入模板名称')
      return
    }
    store.saveTemplate({
      name: templateForm.name,
      simulationType,
      description: templateForm.description,
      params: { ...params }
    })
    message.success('实验模板保存成功')
    showSaveTemplateModal.value = false
    resetTemplateForm()
  }

  function resetTemplateForm() {
    templateForm.name = ''
    templateForm.description = ''
  }

  function applyTemplate(template, resetFn) {
    Object.assign(params, template.params)
    if (resetFn && typeof resetFn === 'function') {
      resetFn()
    }
    showLoadTemplateModal.value = false
    message.success('模板已应用')
  }

  function generateAndDownloadReport(principleText = '') {
    if (!reportForm.title.trim()) {
      message.warning('请输入实验名称')
      return
    }
    let results = {}
    if (getResults && typeof getResults === 'function') {
      results = getResults()
    } else if (engine && engine.dataHistory) {
      const latestData = engine.dataHistory[engine.dataHistory.length - 1]
      if (latestData) {
        results = {
          运行时间: latestData.time,
          ...latestData
        }
      }
    }
    
    const record = {
      title: reportForm.title,
      simulationType,
      experimenter: reportForm.experimenter,
      purpose: reportForm.purpose,
      principle: reportForm.principle || principleText,
      notes: '',
      params: { ...params },
      results,
      conclusion: reportForm.conclusion,
      createdAt: Date.now()
    }
    store.downloadReport(record)
    message.success('实验报告已生成并下载')
    showGenerateReportModal.value = false
    resetReportForm()
  }

  function resetReportForm() {
    reportForm.title = ''
    reportForm.experimenter = ''
    reportForm.purpose = ''
    reportForm.principle = ''
    reportForm.conclusion = ''
  }

  function confirmAddToCompare() {
    const item = {
      id: `current_${Date.now()}`,
      type: 'current',
      simulationType,
      name: '当前实验参数',
      params: { ...params }
    }
    if (store.addToComparison(item)) {
      message.success('已加入对比列表')
      showAddToCompare.value = false
    }
  }

  function checkReproduceParams(resetFn) {
    try {
      const reproduceData = sessionStorage.getItem('reproduce_params')
      if (reproduceData) {
        const data = JSON.parse(reproduceData)
        if (data.type === simulationType && data.params) {
          Object.assign(params, data.params)
          if (resetFn && typeof resetFn === 'function') {
            resetFn()
          }
          message.success('已复现实验参数')
          sessionStorage.removeItem('reproduce_params')
        }
      }
    } catch (e) {
      console.error('Failed to load reproduce params:', e)
    }
  }

  return {
    showSaveRecordModal,
    showSaveTemplateModal,
    showLoadTemplateModal,
    showGenerateReportModal,
    showAddToCompare,
    recordForm,
    templateForm,
    reportForm,
    availableTemplates,
    currentCompareInfo,
    saveAsRecord,
    saveAsTemplate,
    applyTemplate,
    generateAndDownloadReport,
    confirmAddToCompare,
    checkReproduceParams
  }
}
