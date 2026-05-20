<template>
  <div class="min-h-screen py-8 px-4">
    <header class="text-center mb-12">
      <h1 class="text-4xl md:text-5xl font-kai text-ancient-ink mb-3">
        传统古乐律吕校准工具
      </h1>
      <p class="text-lg text-ancient-ink/70 font-song">
        探幽索微 · 律吕调阳 · 正声雅音
      </p>
      <div class="w-32 h-1 bg-gradient-to-r from-transparent via-ancient-bronze to-transparent mx-auto mt-4"></div>
    </header>

    <div class="max-w-7xl mx-auto space-y-8">
      <section class="bg-white/80 backdrop-blur rounded-2xl shadow-xl p-6 md:p-8 border border-ancient-gold/30">
        <h2 class="text-2xl font-kai text-ancient-ink mb-6 flex items-center gap-3">
          <span class="w-2 h-8 bg-gradient-to-b from-ancient-gold to-ancient-bronze rounded"></span>
          基准音高设定
        </h2>
        <div class="grid md:grid-cols-2 gap-8">
          <div class="space-y-4">
            <div>
              <label class="block text-ancient-ink/80 font-song mb-2">黄钟基准频率 (Hz)</label>
              <div class="flex items-center gap-4">
                <input
                  v-model.number="baseFrequency"
                  type="range"
                  min="380"
                  max="480"
                  step="0.1"
                  class="flex-1 h-2 bg-ancient-silk rounded-lg appearance-none cursor-pointer accent-ancient-bronze"
                />
                <input
                  v-model.number="baseFrequency"
                  type="number"
                  min="380"
                  max="480"
                  step="0.1"
                  class="w-24 px-3 py-2 border border-ancient-gold/50 rounded-lg text-center font-mono text-lg"
                />
              </div>
            </div>
            <div>
              <label class="block text-ancient-ink/80 font-song mb-2">历史基准参考</label>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="pitch in HISTORICAL_BASE_PITCHES"
                  :key="pitch.name"
                  @click="baseFrequency = pitch.freq"
                  class="px-3 py-1.5 text-sm rounded-full transition-all duration-300"
                  :class="Math.abs(baseFrequency - pitch.freq) < 0.1 
                    ? 'bg-ancient-bronze text-white' 
                    : 'bg-ancient-silk text-ancient-ink/80 hover:bg-ancient-gold/30'"
                >
                  {{ pitch.name }}
                </button>
              </div>
              <p v-if="currentHistoricalPitch" class="mt-2 text-sm text-ancient-ink/60">
                {{ currentHistoricalPitch.era }} · {{ currentHistoricalPitch.description }}
              </p>
            </div>
          </div>
          <div class="space-y-4">
            <div>
              <label class="block text-ancient-ink/80 font-song mb-2">律制选择</label>
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <button
                  v-for="system in TEMPERAMENT_SYSTEMS"
                  :key="system.id"
                  @click="selectedTemperament = system.id"
                  class="px-4 py-2 rounded-lg transition-all duration-300 text-sm"
                  :class="selectedTemperament === system.id
                    ? 'bg-ancient-jade text-white shadow-lg'
                    : 'bg-ancient-silk text-ancient-ink/80 hover:bg-ancient-gold/30'"
                >
                  {{ system.name }}
                </button>
              </div>
              <p v-if="currentTemperament" class="mt-2 text-sm text-ancient-ink/60">
                {{ currentTemperament.description }}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section class="bg-white/80 backdrop-blur rounded-2xl shadow-xl p-6 md:p-8 border border-ancient-gold/30">
        <h2 class="text-2xl font-kai text-ancient-ink mb-6 flex items-center gap-3">
          <span class="w-2 h-8 bg-gradient-to-b from-ancient-jade to-primary-500 rounded"></span>
          十二律吕音高换算
        </h2>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b-2 border-ancient-gold/30">
                <th class="text-left py-3 px-4 font-kai text-ancient-ink">律吕</th>
                <th class="text-center py-3 px-4 font-kai text-ancient-ink">阴阳</th>
                <th class="text-center py-3 px-4 font-kai text-ancient-ink">频率 (Hz)</th>
                <th class="text-center py-3 px-4 font-kai text-ancient-ink">与平均律差 (音分)</th>
                <th class="text-center py-3 px-4 font-kai text-ancient-ink">音名</th>
                <th class="text-center py-3 px-4 font-kai text-ancient-ink">波长 (cm)</th>
                <th class="text-center py-3 px-4 font-kai text-ancient-ink">试听</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(lülü, index) in TWELVE_LÜLÜ"
                :key="lülü.name"
                class="border-b border-ancient-silk hover:bg-ancient-gold/10 transition-colors"
                :class="lülü.isYang ? 'bg-primary-50/30' : 'bg-purple-50/30'"
              >
                <td class="py-3 px-4">
                  <div class="flex items-center gap-2">
                    <span class="text-lg font-kai text-ancient-ink">{{ lülü.name }}</span>
                    <span class="text-xs text-ancient-ink/50">{{ lülü.alias }}</span>
                  </div>
                  <div class="text-xs text-ancient-ink/50 mt-0.5">{{ lülü.description }}</div>
                </td>
                <td class="text-center py-3 px-4">
                  <span
                    class="inline-block px-2 py-0.5 rounded text-xs font-medium"
                    :class="lülü.isYang ? 'bg-primary-100 text-primary-700' : 'bg-purple-100 text-purple-700'"
                  >
                    {{ lülü.isYang ? '阳律' : '阴吕' }}
                  </span>
                </td>
                <td class="text-center py-3 px-4 font-mono text-lg font-medium text-ancient-ink">
                  {{ lülüFrequencies[index]?.toFixed(2) || '-' }}
                </td>
                <td class="text-center py-3 px-4">
                  <span
                    class="font-mono"
                    :class="getCentsDiff(index) > 5 ? 'text-red-600' : getCentsDiff(index) < -5 ? 'text-blue-600' : 'text-green-600'"
                  >
                    {{ getCentsDiff(index).toFixed(1) }}
                  </span>
                </td>
                <td class="text-center py-3 px-4 font-mono text-ancient-ink/80">
                  {{ getNoteName(lülüFrequencies[index] || 0) }}
                </td>
                <td class="text-center py-3 px-4 font-mono text-sm text-ancient-ink/70">
                  {{ frequencyToWavelength(lülüFrequencies[index] || 0, temperature).toFixed(2) }}
                </td>
                <td class="text-center py-3 px-4">
                  <div class="flex justify-center gap-1">
                    <button
                      @click="playLülü(index, 'sine')"
                      class="p-2 rounded-lg bg-ancient-silk hover:bg-ancient-gold/40 transition-colors"
                      title="纯音"
                    >
                      <svg class="w-4 h-4 text-ancient-ink" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 3a1 1 0 011 1v10.586l3.293-3.293a1 1 0 011.414 1.414l-5 5a1 1 0 01-1.414 0l-5-5a1 1 0 011.414-1.414L9 14.586V4a1 1 0 011-1z"/>
                      </svg>
                    </button>
                    <button
                      @click="playLülü(index, 'guzheng')"
                      class="p-2 rounded-lg bg-ancient-silk hover:bg-primary-400/40 transition-colors"
                      title="古筝"
                    >
                      <svg class="w-4 h-4 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M5 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm4 0a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm4 0a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1z"/>
                      </svg>
                    </button>
                    <button
                      @click="playLülü(index, 'bell')"
                      class="p-2 rounded-lg bg-ancient-silk hover:bg-ancient-jade/40 transition-colors"
                      title="编钟"
                    >
                      <svg class="w-4 h-4 text-ancient-jade" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6z"/>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="bg-white/80 backdrop-blur rounded-2xl shadow-xl p-6 md:p-8 border border-ancient-gold/30">
        <h2 class="text-2xl font-kai text-ancient-ink mb-6 flex items-center gap-3">
          <span class="w-2 h-8 bg-gradient-to-b from-primary-500 to-primary-700 rounded"></span>
          乐器定弦标准
        </h2>
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="instrument in INSTRUMENT_TUNINGS"
            :key="instrument.id"
            class="bg-ancient-paper/50 rounded-xl p-5 border border-ancient-gold/20 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
          >
            <div class="flex items-start justify-between mb-3">
              <div>
                <h3 class="text-lg font-kai text-ancient-ink">{{ instrument.name }}</h3>
                <span class="text-xs text-ancient-ink/60">{{ instrument.type }}乐器</span>
              </div>
              <span class="px-2 py-1 bg-ancient-gold/20 rounded text-xs text-ancient-ink/80">
                {{ instrument.strings }}弦/孔
              </span>
            </div>
            <p class="text-sm text-ancient-ink/70 mb-3">{{ instrument.description }}</p>
            <div class="flex flex-wrap gap-1 mb-2">
              <span
                v-for="(pitch, idx) in instrument.standardPitches"
                :key="idx"
                class="px-2 py-0.5 bg-white rounded text-xs font-mono text-ancient-ink border border-ancient-gold/30"
              >
                {{ pitch }}
              </span>
            </div>
            <p v-if="instrument.historicalNotes" class="text-xs text-ancient-ink/50 italic">
              {{ instrument.historicalNotes }}
            </p>
            <button
              @click="playInstrumentTuning(instrument)"
              class="mt-3 w-full py-2 bg-gradient-to-r from-ancient-gold to-ancient-bronze text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all duration-300"
            >
              试听定弦
            </button>
          </div>
        </div>
      </section>

      <section class="bg-white/80 backdrop-blur rounded-2xl shadow-xl p-6 md:p-8 border border-ancient-gold/30">
        <h2 class="text-2xl font-kai text-ancient-ink mb-6 flex items-center gap-3">
          <span class="w-2 h-8 bg-gradient-to-b from-purple-500 to-purple-700 rounded"></span>
          律制对比试听
        </h2>
        <div class="space-y-6">
          <div class="flex flex-wrap gap-4 items-center">
            <div>
              <label class="block text-sm text-ancient-ink/70 mb-1">选择律吕</label>
              <select
                v-model="comparisonLülüIndex"
                class="px-4 py-2 border border-ancient-gold/50 rounded-lg bg-white font-kai"
              >
                <option v-for="lülü in TWELVE_LÜLÜ" :key="lülü.name" :value="lülü.index">
                  {{ lülü.name }}
                </option>
              </select>
            </div>
            <div>
              <label class="block text-sm text-ancient-ink/70 mb-1">音色</label>
              <select
                v-model="comparisonTone"
                class="px-4 py-2 border border-ancient-gold/50 rounded-lg bg-white"
              >
                <option value="sine">纯音</option>
                <option value="guzheng">古筝</option>
                <option value="erhu">二胡</option>
                <option value="bell">编钟</option>
              </select>
            </div>
          </div>
          <div class="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div
              v-for="system in TEMPERAMENT_SYSTEMS"
              :key="system.id"
              class="bg-gradient-to-br from-ancient-silk to-ancient-paper rounded-xl p-4 text-center border border-ancient-gold/20"
            >
              <h4 class="font-kai text-ancient-ink mb-2">{{ system.name }}</h4>
              <p class="text-sm font-mono text-ancient-ink/70 mb-3">
                {{ getFrequencyForTemperament(system.id, comparisonLülüIndex).toFixed(2) }} Hz
              </p>
              <button
                @click="playTemperamentComparison(system.id)"
                class="w-full py-2 bg-ancient-jade text-white rounded-lg text-sm hover:bg-opacity-90 transition-colors"
              >
                播放
              </button>
            </div>
          </div>
          <div class="mt-4 p-4 bg-ancient-silk/50 rounded-lg">
            <h4 class="font-kai text-ancient-ink mb-2">音分差异对比（以十二平均律为基准）</h4>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="system in TEMPERAMENT_SYSTEMS.filter(s => s.id !== 'equal')"
                :key="system.id"
                class="px-3 py-1 rounded-full text-sm"
                :class="getTemperamentCentsDiff(system.id) > 10 ? 'bg-red-100 text-red-700' : getTemperamentCentsDiff(system.id) < -10 ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'"
              >
                {{ system.name }}: {{ getTemperamentCentsDiff(system.id).toFixed(1) }} 音分
              </span>
            </div>
          </div>
        </div>
      </section>

      <section class="bg-white/80 backdrop-blur rounded-2xl shadow-xl p-6 md:p-8 border border-ancient-gold/30">
        <h2 class="text-2xl font-kai text-ancient-ink mb-6 flex items-center gap-3">
          <span class="w-2 h-8 bg-gradient-to-b from-amber-500 to-amber-700 rounded"></span>
          古乐音律对照手册
        </h2>
        <div class="grid md:grid-cols-2 gap-6">
          <div>
            <h3 class="text-lg font-kai text-ancient-ink mb-4">五音十二律对应关系</h3>
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-ancient-gold/30">
                  <th class="text-left py-2 font-kai">五音</th>
                  <th class="text-left py-2 font-kai">五行</th>
                  <th class="text-left py-2 font-kai">五常</th>
                  <th class="text-left py-2 font-kai">对应律吕</th>
                </tr>
              </thead>
              <tbody>
                <tr class="border-b border-ancient-silk">
                  <td class="py-2 font-kai">宫</td>
                  <td class="py-2">土</td>
                  <td class="py-2">信</td>
                  <td class="py-2">黄钟、林钟</td>
                </tr>
                <tr class="border-b border-ancient-silk">
                  <td class="py-2 font-kai">商</td>
                  <td class="py-2">金</td>
                  <td class="py-2">义</td>
                  <td class="py-2">太簇、南吕</td>
                </tr>
                <tr class="border-b border-ancient-silk">
                  <td class="py-2 font-kai">角</td>
                  <td class="py-2">木</td>
                  <td class="py-2">仁</td>
                  <td class="py-2">姑洗、应钟</td>
                </tr>
                <tr class="border-b border-ancient-silk">
                  <td class="py-2 font-kai">徵</td>
                  <td class="py-2">火</td>
                  <td class="py-2">礼</td>
                  <td class="py-2">蕤宾、大吕</td>
                </tr>
                <tr>
                  <td class="py-2 font-kai">羽</td>
                  <td class="py-2">水</td>
                  <td class="py-2">智</td>
                  <td class="py-2">夷则、夹钟</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div>
            <h3 class="text-lg font-kai text-ancient-ink mb-4">律吕与月令对应</h3>
            <div class="grid grid-cols-2 gap-2 text-sm">
              <div
                v-for="lülü in TWELVE_LÜLÜ"
                :key="lülü.name"
                class="flex items-center gap-2 p-2 bg-ancient-silk/30 rounded"
              >
                <span
                  class="w-2 h-2 rounded-full"
                  :class="lülü.isYang ? 'bg-primary-500' : 'bg-purple-500'"
                ></span>
                <span class="font-kai">{{ lülü.name }}</span>
                <span class="text-ancient-ink/50">→</span>
                <span class="text-ancient-ink/70">{{ getMonthName(lülü.index) }}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="mt-6 p-4 bg-gradient-to-r from-ancient-gold/10 to-transparent rounded-lg border-l-4 border-ancient-gold">
          <h4 class="font-kai text-ancient-ink mb-2">律学小知识</h4>
          <ul class="text-sm text-ancient-ink/80 space-y-1">
            <li>• <strong>三分损益法</strong>：将一根弦三等分，去其一（损）或加其一（益），产生新的音高。</li>
            <li>• <strong>十二平均律</strong>：明代朱载堉于1584年前后发明，将八度分为12个等比半音。</li>
            <li>• <strong>黄钟</strong>：十二律之首，中国古代度量衡的基准，"黄钟定而万事立"。</li>
            <li>• <strong>旋宫转调</strong>：以十二律轮流作为宫音，构成不同调高的五声或七声音阶。</li>
          </ul>
        </div>
      </section>

      <footer class="text-center py-8 text-ancient-ink/50 text-sm">
        <p>传统古乐律吕校准工具 · 弘扬中华律学文化</p>
        <p class="mt-1 text-xs">基于 Nuxt 3 + Windi CSS 构建</p>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { TWELVE_LÜLÜ, HISTORICAL_BASE_PITCHES, INSTRUMENT_TUNINGS } from '~/types/temperament'
import { TEMPERAMENT_SYSTEMS, getNoteName, getCents, frequencyToWavelength } from '~/utils/temperament'
import { useAudioPlayer } from '~/composables/useAudioPlayer'

const { playTone, playGuzhengTone, playErhuTone, playBellTone } = useAudioPlayer()

const baseFrequency = ref(440)
const selectedTemperament = ref('equal')
const temperature = ref(20)
const comparisonLülüIndex = ref(0)
const comparisonTone = ref('sine')

const currentHistoricalPitch = computed(() => {
  return HISTORICAL_BASE_PITCHES.find(p => Math.abs(p.freq - baseFrequency.value) < 0.1)
})

const currentTemperament = computed(() => {
  return TEMPERAMENT_SYSTEMS.find(s => s.id === selectedTemperament.value)
})

const lülüFrequencies = computed(() => {
  const system = TEMPERAMENT_SYSTEMS.find(s => s.id === selectedTemperament.value)
  if (!system) return []
  return system.calculateFrequencies(baseFrequency.value)
})

const equalTemperamentFrequencies = computed(() => {
  return TEMPERAMENT_SYSTEMS.find(s => s.id === 'equal')?.calculateFrequencies(baseFrequency.value) || []
})

function getCentsDiff(index: number): number {
  if (selectedTemperament.value === 'equal') return 0
  const currentFreq = lülüFrequencies.value[index]
  const equalFreq = equalTemperamentFrequencies.value[index]
  if (!currentFreq || !equalFreq) return 0
  return getCents(equalFreq, currentFreq)
}

function getMonthName(index: number): string {
  const months = ['子月(十一)', '丑月(十二)', '寅月(正)', '卯月(二)', '辰月(三)', '巳月(四)', '午月(五)', '未月(六)', '申月(七)', '酉月(八)', '戌月(九)', '亥月(十)']
  return months[index]
}

function playLülü(index: number, toneType: string) {
  const freq = lülüFrequencies.value[index]
  if (!freq) return
  switch (toneType) {
    case 'guzheng':
      playGuzhengTone(freq)
      break
    case 'erhu':
      playErhuTone(freq)
      break
    case 'bell':
      playBellTone(freq)
      break
    default:
      playTone(freq, 1.5, 'sine')
  }
}

function getFrequencyForTemperament(temperamentId: string, lülüIndex: number): number {
  const system = TEMPERAMENT_SYSTEMS.find(s => s.id === temperamentId)
  if (!system) return 0
  const freqs = system.calculateFrequencies(baseFrequency.value)
  return freqs[lülüIndex] || 0
}

function getTemperamentCentsDiff(temperamentId: string): number {
  const equalFreq = getFrequencyForTemperament('equal', comparisonLülüIndex.value)
  const systemFreq = getFrequencyForTemperament(temperamentId, comparisonLülüIndex.value)
  return getCents(equalFreq, systemFreq)
}

function playTemperamentComparison(temperamentId: string) {
  const freq = getFrequencyForTemperament(temperamentId, comparisonLülüIndex.value)
  switch (comparisonTone.value) {
    case 'guzheng':
      playGuzhengTone(freq)
      break
    case 'erhu':
      playErhuTone(freq)
      break
    case 'bell':
      playBellTone(freq)
      break
    default:
      playTone(freq, 1.5, 'sine')
  }
}

async function playInstrumentTuning(instrument: typeof INSTRUMENT_TUNINGS[0]) {
  const noteFreqMap: Record<string, number> = {
    'C3': 130.81, 'D3': 146.83, 'E3': 164.81, 'F#3': 185.00, 'G3': 196.00, 'A3': 220.00, 'B3': 246.94,
    'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F#4': 369.99, 'G4': 392.00, 'A4': 440.00, 'B4': 493.88,
    'D5': 587.33, 'E5': 659.25, 'F#5': 739.99, 'A5': 880.00, 'B5': 987.77,
    'D6': 1174.66, 'E6': 1318.51, 'F#6': 1479.98, 'A6': 1760.00, 'B6': 1975.53,
    'D7': 2349.32,
    'G5': 783.99, 'C5': 523.25, 'F5': 698.46,
    'A2': 110.00,
  }

  for (let i = 0; i < Math.min(instrument.standardPitches.length, 8); i++) {
    const pitch = instrument.standardPitches[i]
    const freq = noteFreqMap[pitch] || 440
    if (instrument.id.includes('guzheng')) {
      playGuzhengTone(freq, 1)
    } else if (instrument.id.includes('erhu')) {
      playErhuTone(freq, 1)
    } else if (instrument.id.includes('pipa')) {
      playGuzhengTone(freq, 1)
    } else {
      playTone(freq, 0.8, 'triangle')
    }
    await new Promise(resolve => setTimeout(resolve, 600))
  }
}
</script>
