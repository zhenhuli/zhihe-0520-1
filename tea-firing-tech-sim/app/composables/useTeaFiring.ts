export type ProcessStage = 'idle' | 'fixing' | 'rolling' | 'drying'

export interface TeaLeaf {
  id: number
  x: number
  y: number
  rotation: number
  scale: number
  color: string
  moisture: number
  shape: number
}

export interface ProcessConfig {
  temperature: number
  duration: number
  stirFrequency: number
}

export interface ProcessInfo {
  name: string
  description: string
  minTemp: number
  maxTemp: number
  optimalTemp: number
  minDuration: number
  maxDuration: number
  optimalDuration: number
  colorStages: string[]
}

export const processInfoMap: Record<Exclude<ProcessStage, 'idle'>, ProcessInfo> = {
  fixing: {
    name: '杀青',
    description: '高温破坏酶活性，固定茶叶品质，蒸发水分，使茶叶变软便于揉捻',
    minTemp: 180,
    maxTemp: 280,
    optimalTemp: 220,
    minDuration: 3,
    maxDuration: 10,
    optimalDuration: 5,
    colorStages: ['#90EE90', '#9ACD32', '#6B8E23', '#228B22']
  },
  rolling: {
    name: '揉捻',
    description: '通过外力作用使茶叶卷紧成条，塑造外形，同时破坏叶细胞组织便于冲泡',
    minTemp: 25,
    maxTemp: 60,
    optimalTemp: 35,
    minDuration: 15,
    maxDuration: 45,
    optimalDuration: 25,
    colorStages: ['#228B22', '#006400', '#556B2F']
  },
  drying: {
    name: '烘干',
    description: '蒸发水分，固定外形，发展香气，使茶叶达到足干便于保存',
    minTemp: 80,
    maxTemp: 150,
    optimalTemp: 110,
    minDuration: 20,
    maxDuration: 60,
    optimalDuration: 30,
    colorStages: ['#556B2F', '#A0522D', '#8B4513', '#654321']
  }
}

export function useTeaFiring() {
  const currentStage = ref<ProcessStage>('idle')
  const isRunning = ref(false)
  const progress = ref(0)
  const elapsedTime = ref(0)
  const teaLeaves = ref<TeaLeaf[]>([])
  const currentTemp = ref(0)
  const isStirring = ref(false)
  const qualityScore = ref(100)

  const config = ref<Record<Exclude<ProcessStage, 'idle'>, ProcessConfig>>({
    fixing: {
      temperature: processInfoMap.fixing.optimalTemp,
      duration: processInfoMap.fixing.optimalDuration,
      stirFrequency: 3
    },
    rolling: {
      temperature: processInfoMap.rolling.optimalTemp,
      duration: processInfoMap.rolling.optimalDuration,
      stirFrequency: 5
    },
    drying: {
      temperature: processInfoMap.drying.optimalTemp,
      duration: processInfoMap.drying.optimalDuration,
      stirFrequency: 2
    }
  })

  const currentConfig = computed(() => {
    if (currentStage.value === 'idle') return null
    return config.value[currentStage.value as Exclude<ProcessStage, 'idle'>]
  })

  const currentProcessInfo = computed(() => {
    if (currentStage.value === 'idle') return null
    return processInfoMap[currentStage.value as Exclude<ProcessStage, 'idle'>]
  })

  const averageMoisture = computed(() => {
    if (teaLeaves.value.length === 0) return 80
    const sum = teaLeaves.value.reduce((acc, leaf) => acc + leaf.moisture, 0)
    return Math.round(sum / teaLeaves.value.length)
  })

  const averageShape = computed(() => {
    if (teaLeaves.value.length === 0) return 0
    const sum = teaLeaves.value.reduce((acc, leaf) => acc + leaf.shape, 0)
    return Math.round(sum / teaLeaves.value.length)
  })

  const averageColor = computed(() => {
    if (teaLeaves.value.length === 0) return '#90EE90'
    return teaLeaves.value[Math.floor(teaLeaves.value.length / 2)].color
  })

  function initTeaLeaves(count: number = 50) {
    const leaves: TeaLeaf[] = []
    for (let i = 0; i < count; i++) {
      leaves.push({
        id: i,
        x: 20 + Math.random() * 60,
        y: 20 + Math.random() * 60,
        rotation: Math.random() * 360,
        scale: 0.8 + Math.random() * 0.4,
        color: '#90EE90',
        moisture: 75 + Math.random() * 10,
        shape: 0
      })
    }
    teaLeaves.value = leaves
    qualityScore.value = 100
  }

  function setStage(stage: ProcessStage) {
    if (isRunning.value) return
    currentStage.value = stage
    progress.value = 0
    elapsedTime.value = 0
    if (stage !== 'idle') {
      currentTemp.value = config.value[stage as Exclude<ProcessStage, 'idle'>].temperature
    }
  }

  let animationFrame: number | null = null
  let lastTime = 0
  let stirTimer = 0

  function startSimulation() {
    if (currentStage.value === 'idle' || !currentConfig.value) return
    if (teaLeaves.value.length === 0) {
      initTeaLeaves()
    }
    isRunning.value = true
    lastTime = performance.now()
    stirTimer = 0
    animate()
  }

  function pauseSimulation() {
    isRunning.value = false
    if (animationFrame) {
      cancelAnimationFrame(animationFrame)
      animationFrame = null
    }
  }

  function resetSimulation() {
    pauseSimulation()
    currentStage.value = 'idle'
    progress.value = 0
    elapsedTime.value = 0
    currentTemp.value = 0
    isStirring.value = false
    qualityScore.value = 100
    teaLeaves.value = []
  }

  function animate() {
    if (!isRunning.value || !currentConfig.value || !currentProcessInfo.value) return

    const now = performance.now()
    const delta = (now - lastTime) / 1000
    lastTime = now

    const totalDuration = currentConfig.value.duration * 60
    elapsedTime.value += delta * 10
    progress.value = Math.min(100, (elapsedTime.value / totalDuration) * 100)

    stirTimer += delta * 10
    const stirInterval = 10 / currentConfig.value.stirFrequency
    if (stirTimer >= stirInterval) {
      stirTimer = 0
      triggerStir()
    }

    updateTeaLeaves(delta * 10)
    calculateQuality()

    if (progress.value >= 100) {
      pauseSimulation()
      return
    }

    animationFrame = requestAnimationFrame(animate)
  }

  function triggerStir() {
    isStirring.value = true
    teaLeaves.value = teaLeaves.value.map(leaf => ({
      ...leaf,
      rotation: leaf.rotation + (Math.random() - 0.5) * 60,
      x: Math.max(10, Math.min(80, leaf.x + (Math.random() - 0.5) * 15)),
      y: Math.max(10, Math.min(80, leaf.y + (Math.random() - 0.5) * 15))
    }))
    setTimeout(() => {
      isStirring.value = false
    }, 500)
  }

  function updateTeaLeaves(delta: number) {
    if (!currentProcessInfo.value || !currentConfig.value) return

    const colorStages = currentProcessInfo.value.colorStages
    const progressRatio = progress.value / 100
    const colorIndex = Math.min(colorStages.length - 1, Math.floor(progressRatio * colorStages.length))
    const nextColorIndex = Math.min(colorStages.length - 1, colorIndex + 1)
    const colorProgress = (progressRatio * colorStages.length) % 1

    const currentColor = colorStages[colorIndex]
    const nextColor = colorStages[nextColorIndex]
    const interpolatedColor = interpolateColor(currentColor, nextColor, colorProgress)

    const tempFactor = calculateTempFactor()

    teaLeaves.value = teaLeaves.value.map(leaf => {
      let newMoisture = leaf.moisture
      let newShape = leaf.shape
      let newScale = leaf.scale
      let newRotation = leaf.rotation

      switch (currentStage.value) {
        case 'fixing':
          newMoisture = Math.max(40, leaf.moisture - delta * 0.08 * tempFactor)
          newShape = Math.min(20, leaf.shape + delta * 0.02)
          break
        case 'rolling':
          newShape = Math.min(80, leaf.shape + delta * 0.2 * tempFactor)
          newScale = 0.6 + (1 - leaf.shape / 100) * 0.4
          newRotation = leaf.rotation + delta * 5
          break
        case 'drying':
          newMoisture = Math.max(5, leaf.moisture - delta * 0.06 * tempFactor)
          newScale = 0.5 + (leaf.moisture / 100) * 0.3
          break
      }

      return {
        ...leaf,
        moisture: newMoisture,
        shape: newShape,
        scale: newScale,
        rotation: newRotation,
        color: interpolatedColor,
        x: leaf.x + (Math.random() - 0.5) * 0.2,
        y: leaf.y + (Math.random() - 0.5) * 0.2
      }
    })
  }

  function calculateTempFactor(): number {
    if (!currentProcessInfo.value || !currentConfig.value) return 1
    const optimal = currentProcessInfo.value.optimalTemp
    const current = currentConfig.value.temperature
    const diff = Math.abs(current - optimal)
    const range = currentProcessInfo.value.maxTemp - currentProcessInfo.value.minTemp
    return 1 - (diff / range) * 0.5
  }

  function calculateQuality() {
    if (!currentProcessInfo.value || !currentConfig.value) return

    let score = 100
    const optimalTemp = currentProcessInfo.value.optimalTemp
    const currentTemp = currentConfig.value.temperature
    const tempDiff = Math.abs(currentTemp - optimalTemp)
    score -= tempDiff * 0.2

    const optimalDuration = currentProcessInfo.value.optimalDuration
    const currentDuration = currentConfig.value.duration
    const durationDiff = Math.abs(currentDuration - optimalDuration)
    score -= durationDiff * 0.5

    const stirFreq = currentConfig.value.stirFrequency
    const optimalStir = currentStage.value === 'fixing' ? 3 : currentStage.value === 'rolling' ? 5 : 2
    score -= Math.abs(stirFreq - optimalStir) * 3

    qualityScore.value = Math.max(0, Math.min(100, score))
  }

  function interpolateColor(color1: string, color2: string, factor: number): string {
    const r1 = parseInt(color1.slice(1, 3), 16)
    const g1 = parseInt(color1.slice(3, 5), 16)
    const b1 = parseInt(color1.slice(5, 7), 16)
    const r2 = parseInt(color2.slice(1, 3), 16)
    const g2 = parseInt(color2.slice(3, 5), 16)
    const b2 = parseInt(color2.slice(5, 7), 16)

    const r = Math.round(r1 + (r2 - r1) * factor)
    const g = Math.round(g1 + (g2 - g1) * factor)
    const b = Math.round(b1 + (b2 - b1) * factor)

    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
  }

  function getQualityLabel(): string {
    const score = qualityScore.value
    if (score >= 90) return '优秀'
    if (score >= 75) return '良好'
    if (score >= 60) return '一般'
    return '较差'
  }

  function getQualityColor(): string {
    const score = qualityScore.value
    if (score >= 90) return '#22c55e'
    if (score >= 75) return '#eab308'
    if (score >= 60) return '#f97316'
    return '#ef4444'
  }

  return {
    currentStage,
    isRunning,
    progress,
    elapsedTime,
    teaLeaves,
    currentTemp,
    isStirring,
    qualityScore,
    config,
    currentConfig,
    currentProcessInfo,
    averageMoisture,
    averageShape,
    averageColor,
    processInfoMap,
    initTeaLeaves,
    setStage,
    startSimulation,
    pauseSimulation,
    resetSimulation,
    triggerStir,
    getQualityLabel,
    getQualityColor
  }
}
