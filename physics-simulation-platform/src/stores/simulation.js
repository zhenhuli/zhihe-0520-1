import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useSimulationStore = defineStore('simulation', () => {
  const savedSimulations = ref([])
  const experimentRecords = ref([])
  const experimentTemplates = ref([])
  const comparisonItems = ref([])

  const SIMULATION_KEY = 'physics_simulation_saves'
  const RECORDS_KEY = 'physics_experiment_records'
  const TEMPLATES_KEY = 'physics_experiment_templates'
  const COMPARISON_KEY = 'physics_comparison_items'

  const SIMULATION_TYPES = {
    pendulum: { name: '单摆', category: '力学' },
    'spring-damper': { name: '弹簧阻尼', category: '力学' },
    'free-fall': { name: '自由落体', category: '力学' },
    diffraction: { name: '光波衍射', category: '光学' },
    'sound-spectrum': { name: '声音频谱', category: '声学' },
    'magnetic-field': { name: '磁场分布', category: '电磁学' },
    'heat-diffusion': { name: '热扩散', category: '热学' }
  }

  function loadFromStorage() {
    try {
      const simData = localStorage.getItem(SIMULATION_KEY)
      if (simData) savedSimulations.value = JSON.parse(simData)

      const recordData = localStorage.getItem(RECORDS_KEY)
      if (recordData) experimentRecords.value = JSON.parse(recordData)

      const templateData = localStorage.getItem(TEMPLATES_KEY)
      if (templateData) experimentTemplates.value = JSON.parse(templateData)

      const comparisonData = localStorage.getItem(COMPARISON_KEY)
      if (comparisonData) comparisonItems.value = JSON.parse(comparisonData)
    } catch (e) {
      console.error('Failed to load from storage:', e)
    }
  }

  function saveToStorage() {
    try {
      localStorage.setItem(SIMULATION_KEY, JSON.stringify(savedSimulations.value))
      localStorage.setItem(RECORDS_KEY, JSON.stringify(experimentRecords.value))
      localStorage.setItem(TEMPLATES_KEY, JSON.stringify(experimentTemplates.value))
      localStorage.setItem(COMPARISON_KEY, JSON.stringify(comparisonItems.value))
    } catch (e) {
      console.error('Failed to save to storage:', e)
    }
  }

  function saveSimulation(type, name, params, timestamp = Date.now()) {
    const simulation = {
      id: `${type}_${timestamp}`,
      type,
      name,
      params,
      timestamp
    }
    savedSimulations.value.push(simulation)
    saveToStorage()
    return simulation
  }

  function getSimulationsByType(type) {
    return savedSimulations.value.filter(s => s.type === type)
  }

  function deleteSimulation(id) {
    const index = savedSimulations.value.findIndex(s => s.id === id)
    if (index > -1) {
      savedSimulations.value.splice(index, 1)
      saveToStorage()
    }
  }

  function getSimulationById(id) {
    return savedSimulations.value.find(s => s.id === id)
  }

  function saveExperimentRecord(record) {
    const newRecord = {
      id: `record_${Date.now()}`,
      ...record,
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
    experimentRecords.value.push(newRecord)
    saveToStorage()
    return newRecord
  }

  function updateExperimentRecord(id, updates) {
    const index = experimentRecords.value.findIndex(r => r.id === id)
    if (index > -1) {
      experimentRecords.value[index] = {
        ...experimentRecords.value[index],
        ...updates,
        updatedAt: Date.now()
      }
      saveToStorage()
    }
  }

  function deleteExperimentRecord(id) {
    const index = experimentRecords.value.findIndex(r => r.id === id)
    if (index > -1) {
      experimentRecords.value.splice(index, 1)
      saveToStorage()
    }
  }

  function getExperimentRecordById(id) {
    return experimentRecords.value.find(r => r.id === id)
  }

  function getRecordsBySimulationType(type) {
    return experimentRecords.value.filter(r => r.simulationType === type)
  }

  function saveTemplate(template) {
    const newTemplate = {
      id: `template_${Date.now()}`,
      ...template,
      createdAt: Date.now()
    }
    experimentTemplates.value.push(newTemplate)
    saveToStorage()
    return newTemplate
  }

  function deleteTemplate(id) {
    const index = experimentTemplates.value.findIndex(t => t.id === id)
    if (index > -1) {
      experimentTemplates.value.splice(index, 1)
      saveToStorage()
    }
  }

  function getTemplatesByType(type) {
    return experimentTemplates.value.filter(t => t.simulationType === type)
  }

  function addToComparison(item) {
    if (comparisonItems.value.length >= 5) {
      alert('最多只能对比5个实验')
      return false
    }
    const exists = comparisonItems.value.find(c => c.id === item.id)
    if (exists) {
      alert('该实验已在对比列表中')
      return false
    }
    comparisonItems.value.push(item)
    saveToStorage()
    return true
  }

  function removeFromComparison(id) {
    const index = comparisonItems.value.findIndex(c => c.id === id)
    if (index > -1) {
      comparisonItems.value.splice(index, 1)
      saveToStorage()
    }
  }

  function clearComparison() {
    comparisonItems.value = []
    saveToStorage()
  }

  function isInComparison(id) {
    return comparisonItems.value.some(c => c.id === id)
  }

  function getTypeName(type) {
    return SIMULATION_TYPES[type]?.name || type
  }

  function getTypeCategory(type) {
    return SIMULATION_TYPES[type]?.category || '其他'
  }

  function generateReport(record) {
    const typeName = getTypeName(record.simulationType)
    const category = getTypeCategory(record.simulationType)
    const date = new Date(record.createdAt).toLocaleString()

    let paramsHtml = ''
    for (const [key, value] of Object.entries(record.params)) {
      paramsHtml += `<tr><td style="padding: 8px; border: 1px solid #ddd;">${key}</td><td style="padding: 8px; border: 1px solid #ddd;">${typeof value === 'number' ? value.toFixed(4) : value}</td></tr>`
    }

    let resultsHtml = ''
    if (record.results) {
      for (const [key, value] of Object.entries(record.results)) {
        resultsHtml += `<tr><td style="padding: 8px; border: 1px solid #ddd;">${key}</td><td style="padding: 8px; border: 1px solid #ddd;">${typeof value === 'number' ? value.toFixed(4) : value}</td></tr>`
      }
    }

    const reportHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${record.title} - 实验报告</title>
    <style>
        body { font-family: 'Microsoft YaHei', Arial, sans-serif; max-width: 900px; margin: 40px auto; padding: 20px; }
        .header { text-align: center; border-bottom: 2px solid #18a058; padding-bottom: 20px; margin-bottom: 30px; }
        .title { font-size: 28px; color: #18a058; margin-bottom: 10px; }
        .info { color: #666; margin-bottom: 5px; }
        h2 { color: #2080f0; border-left: 4px solid #2080f0; padding-left: 12px; margin-top: 30px; }
        table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        th { background: #f0f7ff; padding: 10px; border: 1px solid #ddd; text-align: left; }
        .section { background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .conclusion { background: #f0fff4; padding: 20px; border-radius: 8px; border-left: 4px solid #18a058; }
        .footer { text-align: center; margin-top: 50px; color: #999; font-size: 14px; }
    </style>
</head>
<body>
    <div class="header">
        <h1 class="title">${record.title}</h1>
        <p class="info">实验类型：${category} - ${typeName}</p>
        <p class="info">实验人员：${record.experimenter || '未填写'}</p>
        <p class="info">实验时间：${date}</p>
    </div>

    <h2>一、实验目的</h2>
    <div class="section">
        <p>${record.purpose || '通过物理仿真实验，研究' + typeName + '的运动规律，分析各参数对实验结果的影响。'}</p>
    </div>

    <h2>二、实验原理</h2>
    <div class="section">
        <p>${record.principle || '基于经典物理学理论，通过数值模拟方法求解物理方程，得到系统的运动状态随时间的演变。'}</p>
    </div>

    <h2>三、实验参数</h2>
    <table>
        <tr><th style="width: 200px;">参数名称</th><th>参数值</th></tr>
        ${paramsHtml}
    </table>

    ${resultsHtml ? `
    <h2>四、实验结果</h2>
    <table>
        <tr><th style="width: 200px;">指标名称</th><th>测量值</th></tr>
        ${resultsHtml}
    </table>
    ` : ''}

    <h2>五、实验过程记录</h2>
    <div class="section">
        <p>${record.notes || '实验过程中，通过调整各物理参数，观察系统的运动变化规律，记录相关数据。'}</p>
    </div>

    <h2>六、实验结论</h2>
    <div class="conclusion">
        <p>${record.conclusion || '实验成功完成，达到了预期的实验目的。通过本次实验，深入理解了' + typeName + '的物理原理和运动规律。'}</p>
    </div>

    <div class="footer">
        <p>物理仿真平台 - 自动生成实验报告</p>
        <p>生成时间：${new Date().toLocaleString()}</p>
    </div>
</body>
</html>`

    return reportHtml
  }

  function downloadReport(record) {
    const html = generateReport(record)
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${record.title}_实验报告.html`
    a.click()
    URL.revokeObjectURL(url)
  }

  const allRecords = computed(() => [...experimentRecords.value].sort((a, b) => b.createdAt - a.createdAt))
  const allTemplates = computed(() => [...experimentTemplates.value].sort((a, b) => b.createdAt - a.createdAt))

  loadFromStorage()

  return {
    savedSimulations,
    experimentRecords,
    experimentTemplates,
    comparisonItems,
    SIMULATION_TYPES,
    allRecords,
    allTemplates,
    saveSimulation,
    getSimulationsByType,
    deleteSimulation,
    getSimulationById,
    saveExperimentRecord,
    updateExperimentRecord,
    deleteExperimentRecord,
    getExperimentRecordById,
    getRecordsBySimulationType,
    saveTemplate,
    deleteTemplate,
    getTemplatesByType,
    addToComparison,
    removeFromComparison,
    clearComparison,
    isInComparison,
    getTypeName,
    getTypeCategory,
    generateReport,
    downloadReport,
    loadFromStorage
  }
})
