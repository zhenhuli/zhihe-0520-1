import { format, addDays, differenceInDays } from 'date-fns'
import { livestockTypes } from '../data/livestockData'

export function calculateCycle(type, purchaseDate, quantity) {
  const livestock = livestockTypes[type]
  if (!livestock) return null

  const purchase = new Date(purchaseDate)
  const stages = []
  let currentDate = new Date(purchase)

  livestock.stages.forEach((stage, index) => {
    const startDate = new Date(currentDate)
    const endDate = addDays(currentDate, stage.days - 1)
    
    stages.push({
      ...stage,
      stageIndex: index,
      startDate: format(startDate, 'yyyy-MM-dd'),
      endDate: format(endDate, 'yyyy-MM-dd'),
      totalFeed: (stage.feedPerDay * stage.days * quantity).toFixed(2),
      totalFeedings: stage.feedingFrequency * stage.days
    })
    
    currentDate = addDays(endDate, 1)
  })

  const vaccinations = livestock.vaccinations.map(vac => ({
    ...vac,
    date: format(addDays(purchase, vac.day - 1), 'yyyy-MM-dd')
  }))

  const marketDate = addDays(purchase, livestock.totalCycleDays - 1)
  const totalFeed = stages.reduce((sum, s) => sum + parseFloat(s.totalFeed), 0)

  return {
    type,
    typeName: livestock.name,
    unit: livestock.unit,
    quantity,
    purchaseDate: format(purchase, 'yyyy-MM-dd'),
    marketDate: format(marketDate, 'yyyy-MM-dd'),
    totalCycleDays: livestock.totalCycleDays,
    marketWeight: livestock.marketWeight,
    stages,
    vaccinations,
    totalFeed: totalFeed.toFixed(2)
  }
}

export function getCurrentStage(cycleData) {
  const today = new Date()
  const purchaseDate = new Date(cycleData.purchaseDate)
  const daysPassed = differenceInDays(today, purchaseDate) + 1

  if (daysPassed < 1) {
    return { stage: null, daysPassed: 0, progress: 0, status: 'not_started' }
  }

  if (daysPassed > cycleData.totalCycleDays) {
    return { stage: null, daysPassed, progress: 100, status: 'completed' }
  }

  let accumulatedDays = 0
  for (const stage of cycleData.stages) {
    if (daysPassed <= accumulatedDays + stage.days) {
      const stageProgress = ((daysPassed - accumulatedDays) / stage.days) * 100
      const totalProgress = (daysPassed / cycleData.totalCycleDays) * 100
      return {
        stage,
        daysPassed,
        stageDay: daysPassed - accumulatedDays,
        stageProgress: stageProgress.toFixed(1),
        progress: totalProgress.toFixed(1),
        status: 'in_progress'
      }
    }
    accumulatedDays += stage.days
  }

  return { stage: null, daysPassed, progress: 100, status: 'completed' }
}

export function getUpcomingVaccinations(cycleData, daysAhead = 14) {
  const today = new Date()
  const endDate = addDays(today, daysAhead)
  
  return cycleData.vaccinations.filter(vac => {
    const vacDate = new Date(vac.date)
    return vacDate >= today && vacDate <= endDate
  }).sort((a, b) => new Date(a.date) - new Date(b.date))
}

export function getTodayFeeding(cycleData) {
  const current = getCurrentStage(cycleData)
  if (current.status !== 'in_progress' || !current.stage) {
    return { frequency: 0, feedPerAnimal: 0, totalFeed: 0 }
  }
  
  return {
    frequency: current.stage.feedingFrequency,
    feedPerAnimal: current.stage.feedPerDay,
    totalFeed: (current.stage.feedPerDay * cycleData.quantity).toFixed(2)
  }
}

export function generateDailyPlan(cycleData) {
  const purchaseDate = new Date(cycleData.purchaseDate)
  const plans = []

  for (let day = 1; day <= cycleData.totalCycleDays; day++) {
    const date = format(addDays(purchaseDate, day - 1), 'yyyy-MM-dd')
    let accumulatedDays = 0
    let currentStage = null

    for (const stage of cycleData.stages) {
      if (day <= accumulatedDays + stage.days) {
        currentStage = stage
        break
      }
      accumulatedDays += stage.days
    }

    const vac = cycleData.vaccinations.find(v => v.day === day)

    plans.push({
      day,
      date,
      stageName: currentStage ? currentStage.name : '-',
      feedingFrequency: currentStage ? currentStage.feedingFrequency : 0,
      feedPerAnimal: currentStage ? currentStage.feedPerDay : 0,
      totalFeed: currentStage ? (currentStage.feedPerDay * cycleData.quantity).toFixed(2) : '0',
      vaccination: vac ? vac.name : '-'
    })
  }

  return plans
}

export function calculateFeedCost(cycleData, feedPrice) {
  return {
    totalFeed: cycleData.totalFeed,
    totalCost: (cycleData.totalFeed * feedPrice).toFixed(2)
  }
}
