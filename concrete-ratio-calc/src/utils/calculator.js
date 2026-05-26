import { mixRatios, defaultWastageRate } from '../data/concreteData'

export function calculateMaterials(grade, volume, wastageRates = defaultWastageRate) {
  const ratio = mixRatios[grade]
  if (!ratio) {
    throw new Error(`未找到强度等级 ${grade} 的配比数据`)
  }

  const result = {
    cement: {
      net: ratio.cement * volume,
      wastage: 0,
      total: 0,
      unit: 'kg'
    },
    sand: {
      net: ratio.sand * volume,
      wastage: 0,
      total: 0,
      unit: 'kg'
    },
    gravel: {
      net: ratio.gravel * volume,
      wastage: 0,
      total: 0,
      unit: 'kg'
    },
    water: {
      net: ratio.water * volume,
      wastage: 0,
      total: 0,
      unit: 'kg'
    }
  }

  for (const material of Object.keys(result)) {
    const rate = wastageRates[material] || 0
    result[material].wastage = result[material].net * (rate / 100)
    result[material].total = result[material].net + result[material].wastage
  }

  return result
}

export function formatWeight(kg) {
  if (kg >= 1000) {
    return (kg / 1000).toFixed(2) + ' t'
  }
  return kg.toFixed(2) + ' kg'
}

export function formatVolume(liters) {
  if (liters >= 1000) {
    return (liters / 1000).toFixed(2) + ' m³'
  }
  return liters.toFixed(2) + ' L'
}

export function getApplicableGrades(scene, strengthGrades) {
  return strengthGrades.filter(g => g.scenes.includes(scene))
}

export function generateBatchVolumes(baseVolume, count) {
  const volumes = []
  for (let i = 1; i <= count; i++) {
    volumes.push({
      id: i,
      name: `批次 ${i}`,
      volume: baseVolume * i
    })
  }
  return volumes
}

export function calculateTotalBatchMaterials(grade, batches, wastageRates) {
  const results = []
  let grandTotal = { cement: 0, sand: 0, gravel: 0, water: 0 }

  for (const batch of batches) {
    const materials = calculateMaterials(grade, batch.volume, wastageRates)
    results.push({
      ...batch,
      materials
    })
    grandTotal.cement += materials.cement.total
    grandTotal.sand += materials.sand.total
    grandTotal.gravel += materials.gravel.total
    grandTotal.water += materials.water.total
  }

  return {
    batches: results,
    grandTotal
  }
}
