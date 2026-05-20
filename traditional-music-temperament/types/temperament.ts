export interface LüLü {
  name: string
  alias: string
  index: number
  isYang: boolean
  description: string
}

export interface TemperamentSystem {
  id: string
  name: string
  description: string
  calculateFrequencies: (baseFreq: number) => number[]
}

export interface InstrumentTuning {
  id: string
  name: string
  type: string
  strings: number
  standardPitches: string[]
  description: string
  historicalNotes?: string
}

export const TWELVE_LÜLÜ: LüLü[] = [
  { name: '黄钟', alias: 'Huangzhong', index: 0, isYang: true, description: '律吕之首，对应子月，君王之象' },
  { name: '大吕', alias: 'Dalü', index: 1, isYang: false, description: '对应丑月，辅助黄钟' },
  { name: '太簇', alias: 'Taicu', index: 2, isYang: true, description: '对应寅月，万物簇生' },
  { name: '夹钟', alias: 'Jiazhong', index: 3, isYang: false, description: '对应卯月，万物夹生' },
  { name: '姑洗', alias: 'Guxian', index: 4, isYang: true, description: '对应辰月，万物洗濯' },
  { name: '仲吕', alias: 'Zhonglü', index: 5, isYang: false, description: '对应巳月，万物尽生' },
  { name: '蕤宾', alias: 'Ruibin', index: 6, isYang: true, description: '对应午月，阴气始生' },
  { name: '林钟', alias: 'Linzhong', index: 7, isYang: false, description: '对应未月，万物成熟' },
  { name: '夷则', alias: 'Yize', index: 8, isYang: true, description: '对应申月，万物受刑' },
  { name: '南吕', alias: 'Nanlü', index: 9, isYang: false, description: '对应酉月，万物入藏' },
  { name: '无射', alias: 'Wuyi', index: 10, isYang: true, description: '对应戌月，万物毕入' },
  { name: '应钟', alias: 'Yingzhong', index: 11, isYang: false, description: '对应亥月，万物应藏' },
]

export const MODES = [
  { id: 'gong', name: '宫调', description: '君王之音，庄重典雅', lülüIndex: 0 },
  { id: 'shang', name: '商调', description: '臣子之音，刚健有力', lülüIndex: 2 },
  { id: 'jue', name: '角调', description: '民众之音，温婉舒展', lülüIndex: 4 },
  { id: 'zhi', name: '徵调', description: '事物之音，欢快明丽', lülüIndex: 7 },
  { id: 'yu', name: '羽调', description: '万物之音，清幽深远', lülüIndex: 9 },
]

export const HISTORICAL_BASE_PITCHES = [
  { name: '标准黄钟 (A4=440Hz)', freq: 440, era: '现代标准', description: '国际标准音高，黄钟对应A4' },
  { name: '曾侯乙钟 (A4=432Hz)', freq: 432, era: '战国', description: '曾侯乙编钟实测音高' },
  { name: '唐代雅乐 (A4=427Hz)', freq: 427, era: '唐代', description: '唐代宫廷雅乐标准' },
  { name: '宋代大晟 (A4=430Hz)', freq: 430, era: '宋代', description: '宋徽宗时期大晟乐' },
  { name: '明代朱载堉 (A4=440Hz)', freq: 440, era: '明代', description: '十二平均律理论基准' },
  { name: '清代中和韶乐 (A4=408Hz)', freq: 408, era: '清代', description: '清代宫廷祭祀音乐' },
]

export const INSTRUMENT_TUNINGS: InstrumentTuning[] = [
  {
    id: 'guqin-7',
    name: '古琴（七弦）',
    type: '弹拨',
    strings: 7,
    standardPitches: ['C3', 'D3', 'E3', 'G3', 'A3', 'C4', 'D4'],
    description: '传统正调，宫音在第三弦',
    historicalNotes: '周文王、周武王各加一弦，合为七弦'
  },
  {
    id: 'guzheng-21',
    name: '古筝（二十一弦）',
    type: '弹拨',
    strings: 21,
    standardPitches: ['D3', 'E3', 'F#3', 'A3', 'B3', 'D4', 'E4', 'F#4', 'A4', 'B4', 'D5', 'E5', 'F#5', 'A5', 'B5', 'D6', 'E6', 'F#6', 'A6', 'B6', 'D7'],
    description: 'D调五声音阶定弦'
  },
  {
    id: 'pipa-4',
    name: '琵琶（四弦）',
    type: '弹拨',
    strings: 4,
    standardPitches: ['A2', 'D3', 'E3', 'A3'],
    description: '常用定弦，A-D-E-A'
  },
  {
    id: 'erhu-2',
    name: '二胡（二弦）',
    type: '拉弦',
    strings: 2,
    standardPitches: ['D4', 'A4'],
    description: '标准定弦，内弦D4，外弦A4'
  },
  {
    id: 'xiao-8',
    name: '箫（八孔）',
    type: '吹奏',
    strings: 8,
    standardPitches: ['G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'F#5', 'G5'],
    description: 'G调箫，传统六孔加两孔'
  },
  {
    id: 'dizi-6',
    name: '笛子（六孔）',
    type: '吹奏',
    strings: 6,
    standardPitches: ['C5', 'D5', 'E5', 'F5', 'G5', 'A5'],
    description: 'C调曲笛，膜鸣乐器'
  }
]
