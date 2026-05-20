import type { TemperamentSystem } from '~/types/temperament'

export const TEMPERAMENT_SYSTEMS: TemperamentSystem[] = [
  {
    id: 'equal',
    name: '十二平均律',
    description: '明代朱载堉发明，各半音频率比为2^(1/12)，转调自由',
    calculateFrequencies: (baseFreq: number): number[] => {
      const ratios = []
      for (let i = 0; i < 12; i++) {
        ratios.push(Math.pow(2, i / 12))
      }
      return ratios.map(r => baseFreq * r)
    }
  },
  {
    id: 'pythagorean',
    name: '三分损益法',
    description: '中国传统律学，三分损一、三分益一相生，纯五度关系',
    calculateFrequencies: (baseFreq: number): number[] => {
      const ratios: number[] = [1]
      let current = 1
      for (let i = 1; i < 12; i++) {
        current = (current * 3) / 2
        if (current > 2) current = current / 2
        ratios.push(current)
      }
      ratios.sort((a, b) => a - b)
      return ratios.map(r => baseFreq * r)
    }
  },
  {
    id: 'pure',
    name: '纯律',
    description: '基于自然泛音列，大小三度纯正协和，多用于合唱',
    calculateFrequencies: (baseFreq: number): number[] => {
      const ratios = [1, 16/15, 9/8, 6/5, 5/4, 4/3, 45/32, 3/2, 8/5, 5/3, 9/5, 15/8]
      return ratios.map(r => baseFreq * r)
    }
  },
  {
    id: 'meantone',
    name: '中庸全音律',
    description: '文艺复兴时期常用，纯律大三度为主，适合早期键盘乐器',
    calculateFrequencies: (baseFreq: number): number[] => {
      const fifth = Math.pow(5, 1/4)
      const ratios: number[] = [1]
      let current = 1
      for (let i = 1; i < 12; i++) {
        current = (current * fifth) / 2
        if (current < 1) current = current * 2
        ratios.push(current)
      }
      ratios.sort((a, b) => a - b)
      return ratios.map(r => baseFreq * r)
    }
  },
  {
    id: 'well',
    name: '良律',
    description: '巴赫平均律前身，各调特性不同但均可使用',
    calculateFrequencies: (baseFreq: number): number[] => {
      const ratios = [1, 1.06787, 1.125, 1.2, 1.25, 1.33333, 1.40625, 1.5, 1.6, 1.66667, 1.8, 1.875]
      return ratios.map(r => baseFreq * r)
    }
  }
]

export function getNoteName(freq: number): string {
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
  const A4 = 440
  const C0 = A4 * Math.pow(2, -4.75)
  const h = Math.round(12 * Math.log2(freq / C0))
  const octave = Math.floor(h / 12)
  const noteIndex = h % 12
  return `${noteNames[noteIndex]}${octave}`
}

export function getCents(freq1: number, freq2: number): number {
  return 1200 * Math.log2(freq2 / freq1)
}

export function getLülüName(index: number): string {
  const names = ['黄钟', '大吕', '太簇', '夹钟', '姑洗', '仲吕', '蕤宾', '林钟', '夷则', '南吕', '无射', '应钟']
  return names[index % 12]
}

export function frequencyToWavelength(freq: number, temp: number = 20): number {
  const speedOfSound = 331.3 * Math.sqrt(1 + temp / 273.15)
  return speedOfSound / freq
}

export function getModeScale(lülüIndex: number, modeId: string): number[] {
  const modeIntervals: Record<string, number[]> = {
    gong: [0, 2, 4, 7, 9, 12, 14],
    shang: [2, 4, 7, 9, 12, 14, 16],
    jue: [4, 7, 9, 12, 14, 16, 19],
    zhi: [7, 9, 12, 14, 16, 19, 21],
    yu: [9, 12, 14, 16, 19, 21, 23],
  }
  return modeIntervals[modeId]?.map(i => (lülüIndex + i) % 12) || []
}
