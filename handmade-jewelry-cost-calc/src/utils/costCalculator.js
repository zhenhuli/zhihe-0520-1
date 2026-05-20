export const METAL_TYPES = [
  { name: '黄金 (足金999)', pricePerGram: 520, purity: 0.999 },
  { name: '黄金 (K金18K)', pricePerGram: 380, purity: 0.75 },
  { name: '黄金 (K金14K)', pricePerGram: 290, purity: 0.585 },
  { name: '铂金 (PT950)', pricePerGram: 280, purity: 0.95 },
  { name: '铂金 (PT990)', pricePerGram: 300, purity: 0.99 },
  { name: '白银 (足银999)', pricePerGram: 8, purity: 0.999 },
  { name: '白银 (925银)', pricePerGram: 6, purity: 0.925 },
  { name: '玫瑰金 (18K)', pricePerGram: 390, purity: 0.75 },
]

export const GEM_TYPES = [
  { name: '钻石 (天然)', pricePerCarat: 35000 },
  { name: '钻石 (培育)', pricePerCarat: 8000 },
  { name: '红宝石', pricePerCarat: 12000 },
  { name: '蓝宝石', pricePerCarat: 8000 },
  { name: '祖母绿', pricePerCarat: 15000 },
  { name: '翡翠 (A货)', pricePerCarat: 25000 },
  { name: '和田玉', pricePerCarat: 5000 },
  { name: '珍珠 (淡水)', pricePerGram: 80 },
  { name: '珍珠 (海水)', pricePerGram: 300 },
  { name: '紫水晶', pricePerCarat: 150 },
  { name: '托帕石', pricePerCarat: 200 },
  { name: '石榴石', pricePerCarat: 180 },
  { name: '其他宝石', pricePerCarat: 500 },
]

export const WIRE_TYPES = [
  { name: '黄金线 (0.5mm)', pricePerMeter: 15 },
  { name: '黄金线 (0.8mm)', pricePerMeter: 25 },
  { name: '黄金线 (1.0mm)', pricePerMeter: 35 },
  { name: '银线 (0.5mm)', pricePerMeter: 3 },
  { name: '银线 (0.8mm)', pricePerMeter: 5 },
  { name: '银线 (1.0mm)', pricePerMeter: 8 },
  { name: '铜线 (0.5mm)', pricePerMeter: 0.5 },
  { name: '铜线 (0.8mm)', pricePerMeter: 0.8 },
  { name: '蜡线', pricePerMeter: 0.3 },
  { name: '弹力线', pricePerMeter: 0.2 },
  { name: '丝线', pricePerMeter: 0.15 },
]

export const ACCESSORY_TYPES = [
  { name: '弹簧扣', pricePerUnit: 5 },
  { name: '龙虾扣', pricePerUnit: 8 },
  { name: '项链扣', pricePerUnit: 12 },
  { name: '耳钩', pricePerPair: 6 },
  { name: '耳堵', pricePerPair: 2 },
  { name: '戒指托', pricePerUnit: 25 },
  { name: '吊坠托', pricePerUnit: 30 },
  { name: '链扣', pricePerUnit: 4 },
  { name: '定位珠', pricePerUnit: 1 },
  { name: '隔片', pricePerUnit: 0.5 },
]

export function calculateMaterialCost(materials) {
  if (!materials || materials.length === 0) return 0
  return materials.reduce((sum, mat) => sum + (mat.weight || 0) * (mat.pricePerGram || 0), 0)
}

export function calculateGemCost(gems) {
  if (!gems || gems.length === 0) return 0
  return gems.reduce((sum, gem) => {
    const unitPrice = gem.pricePerCarat || gem.pricePerGram || 0
    const quantity = gem.carats || gem.weight || gem.quantity || 0
    return sum + unitPrice * quantity
  }, 0)
}

export function calculateWireCost(wires) {
  if (!wires || wires.length === 0) return 0
  return wires.reduce((sum, wire) => sum + (wire.length || 0) * (wire.pricePerMeter || 0), 0)
}

export function calculateAccessoryCost(accessories) {
  if (!accessories || accessories.length === 0) return 0
  return accessories.reduce((sum, acc) => sum + (acc.quantity || 0) * (acc.pricePerUnit || 0), 0)
}

export function calculateLaborCost(hours, hourlyRate) {
  return (hours || 0) * (hourlyRate || 0)
}

export function applyLossRatio(cost, lossRatio) {
  return cost * (1 + (lossRatio || 0) / 100)
}

export function calculateTotalCost(costData) {
  const {
    materials = [],
    gems = [],
    wires = [],
    accessories = [],
    laborHours = 0,
    hourlyRate = 80,
    materialLossRatio = 10,
    laborLossRatio = 15
  } = costData

  const baseMaterialCost = calculateMaterialCost(materials)
  const baseGemCost = calculateGemCost(gems)
  const baseWireCost = calculateWireCost(wires)
  const baseAccessoryCost = calculateAccessoryCost(accessories)
  
  const totalMaterialCost = applyLossRatio(
    baseMaterialCost + baseWireCost + baseAccessoryCost,
    materialLossRatio
  )
  
  const baseLaborCost = calculateLaborCost(laborHours, hourlyRate)
  const totalLaborCost = applyLossRatio(baseLaborCost, laborLossRatio)
  
  const totalCost = totalMaterialCost + baseGemCost + totalLaborCost

  return {
    baseMaterialCost,
    baseGemCost,
    baseWireCost,
    baseAccessoryCost,
    totalMaterialCost,
    baseLaborCost,
    totalLaborCost,
    totalCost
  }
}

export function calculatePricingRange(totalCost, marketMultiplier = { min: 2.5, max: 4.5 }) {
  const minPrice = totalCost * (marketMultiplier.min || 2.5)
  const maxPrice = totalCost * (marketMultiplier.max || 4.5)
  const suggestedPrice = totalCost * ((marketMultiplier.min + marketMultiplier.max) / 2 || 3.5)
  
  return {
    minPrice,
    maxPrice,
    suggestedPrice,
    minProfit: minPrice - totalCost,
    maxProfit: maxPrice - totalCost,
    suggestedProfit: suggestedPrice - totalCost,
    minProfitMargin: ((minPrice - totalCost) / minPrice * 100).toFixed(1),
    maxProfitMargin: ((maxPrice - totalCost) / maxPrice * 100).toFixed(1),
    suggestedProfitMargin: ((suggestedPrice - totalCost) / suggestedPrice * 100).toFixed(1)
  }
}
