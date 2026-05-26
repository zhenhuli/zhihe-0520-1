export const constructionScenes = [
  { value: 'foundation', label: '基础/地基', description: '地基、承台、基础梁等' },
  { value: 'column', label: '柱/墙', description: '框架柱、剪力墙等竖向构件' },
  { value: 'beam', label: '梁/板', description: '框架梁、楼板等水平构件' },
  { value: 'road', label: '道路/地坪', description: '厂区道路、地坪、垫层' },
  { value: 'waterproof', label: '防水/抗渗', description: '地下室、水池等抗渗要求高' }
]

export const strengthGrades = [
  { value: 'C15', label: 'C15', minStrength: 15, maxStrength: 20, scenes: ['foundation', 'road'] },
  { value: 'C20', label: 'C20', minStrength: 20, maxStrength: 25, scenes: ['foundation', 'road'] },
  { value: 'C25', label: 'C25', minStrength: 25, maxStrength: 30, scenes: ['foundation', 'beam', 'column', 'road'] },
  { value: 'C30', label: 'C30', minStrength: 30, maxStrength: 35, scenes: ['beam', 'column', 'waterproof'] },
  { value: 'C35', label: 'C35', minStrength: 35, maxStrength: 40, scenes: ['beam', 'column', 'waterproof'] },
  { value: 'C40', label: 'C40', minStrength: 40, maxStrength: 45, scenes: ['beam', 'column', 'waterproof'] },
  { value: 'C45', label: 'C45', minStrength: 45, maxStrength: 50, scenes: ['column', 'waterproof'] },
  { value: 'C50', label: 'C50', minStrength: 50, maxStrength: 55, scenes: ['column', 'waterproof'] }
]

export const mixRatios = {
  C15: {
    cement: 246,
    sand: 797,
    gravel: 1158,
    water: 175,
    ratio: '1 : 3.24 : 4.71 : 0.71',
    description: '低强度，适用于垫层、基础找平'
  },
  C20: {
    cement: 273,
    sand: 755,
    gravel: 1210,
    water: 175,
    ratio: '1 : 2.76 : 4.43 : 0.64',
    description: '普通基础、地坪、临时道路'
  },
  C25: {
    cement: 300,
    sand: 714,
    gravel: 1256,
    water: 175,
    ratio: '1 : 2.38 : 4.19 : 0.58',
    description: '一般民建梁、板、柱基础'
  },
  C30: {
    cement: 335,
    sand: 660,
    gravel: 1295,
    water: 175,
    ratio: '1 : 1.97 : 3.87 : 0.52',
    description: '标准强度，多层建筑主体结构'
  },
  C35: {
    cement: 370,
    sand: 615,
    gravel: 1305,
    water: 175,
    ratio: '1 : 1.66 : 3.53 : 0.47',
    description: '中高强度，高层建筑下部结构'
  },
  C40: {
    cement: 405,
    sand: 570,
    gravel: 1315,
    water: 175,
    ratio: '1 : 1.41 : 3.25 : 0.43',
    description: '高强度，大跨度、重载结构'
  },
  C45: {
    cement: 440,
    sand: 525,
    gravel: 1325,
    water: 175,
    ratio: '1 : 1.19 : 3.01 : 0.40',
    description: '超高强度，特殊工程结构'
  },
  C50: {
    cement: 475,
    sand: 480,
    gravel: 1335,
    water: 175,
    ratio: '1 : 1.01 : 2.81 : 0.37',
    description: '超高强度，预应力、大跨度结构'
  }
}

export const materialDensity = {
  cement: 3.15,
  sand: 2.65,
  gravel: 2.7,
  water: 1.0
}

export const defaultWastageRate = {
  cement: 2,
  sand: 5,
  gravel: 5,
  water: 3
}
