export class SoundSpectrumEngine {
  constructor(params = {}) {
    this.sampleRate = params.sampleRate || 44100
    this.bufferSize = params.bufferSize || 1024
    this.frequencies = params.frequencies || [440, 880]
    this.amplitudes = params.amplitudes || [0.8, 0.4]
    this.phases = params.phases || [0, Math.PI / 4]
    this.noiseLevel = params.noiseLevel || 0.05

    this.time = 0
    this.waveform = []
    this.spectrum = []
    this.fftResult = []
    this.maxFrequency = this.sampleRate / 2
  }

  reset() {
    this.time = 0
    this.waveform = []
    this.spectrum = []
  }

  update(dt) {
    const n = this.bufferSize
    const wave = []

    for (let i = 0; i < n; i++) {
      const t = (this.time + i / this.sampleRate)
      let value = 0

      for (let j = 0; j < this.frequencies.length; j++) {
        value += this.amplitudes[j] * Math.sin(
          2 * Math.PI * this.frequencies[j] * t + (this.phases[j] || 0)
        )
      }

      value += (Math.random() - 0.5) * this.noiseLevel
      wave.push({ sample: i, value, time: t })
    }

    const spectrum = this.performFFT(wave.map(w => w.value))

    this.waveform = wave
    this.spectrum = spectrum
    this.time += dt

    return {
      waveform: this.waveform,
      spectrum: this.spectrum,
      time: this.time
    }
  }

  performFFT(signal) {
    const n = signal.length
    const result = []
    const magnitudes = []

    for (let k = 0; k < n / 2; k++) {
      let real = 0
      let imag = 0

      for (let t = 0; t < n; t++) {
        const angle = (2 * Math.PI * k * t) / n
        real += signal[t] * Math.cos(angle)
        imag -= signal[t] * Math.sin(angle)
      }

      const magnitude = Math.sqrt(real * real + imag * imag) / n
      const frequency = (k * this.sampleRate) / n

      magnitudes.push({ frequency, magnitude, real, imag })
    }

    this.fftResult = magnitudes

    const maxMag = Math.max(...magnitudes.map(m => m.magnitude)) || 1
    return magnitudes.map(m => ({
      frequency: m.frequency,
      magnitude: m.magnitude / maxMag,
      magnitudeDb: 20 * Math.log10(m.magnitude / maxMag + 1e-10),
      real: m.real,
      imag: m.imag
    }))
  }

  getParams() {
    return {
      sampleRate: this.sampleRate,
      bufferSize: this.bufferSize,
      frequencies: [...this.frequencies],
      amplitudes: [...this.amplitudes],
      phases: [...this.phases],
      noiseLevel: this.noiseLevel
    }
  }

  setParams(params) {
    this.sampleRate = params.sampleRate ?? this.sampleRate
    this.bufferSize = params.bufferSize ?? this.bufferSize
    this.frequencies = params.frequencies ?? this.frequencies
    this.amplitudes = params.amplitudes ?? this.amplitudes
    this.phases = params.phases ?? this.phases
    this.noiseLevel = params.noiseLevel ?? this.noiseLevel
  }

  addFrequency(freq, amp = 0.5, phase = 0) {
    this.frequencies.push(freq)
    this.amplitudes.push(amp)
    this.phases.push(phase)
  }

  removeFrequency(index) {
    if (index >= 0 && index < this.frequencies.length) {
      this.frequencies.splice(index, 1)
      this.amplitudes.splice(index, 1)
      this.phases.splice(index, 1)
    }
  }

  calculateNyquistFrequency() {
    return this.sampleRate / 2
  }

  calculateFrequencyResolution() {
    return this.sampleRate / this.bufferSize
  }

  calculateWavelength(frequency) {
    const speedOfSound = 343
    return speedOfSound / frequency
  }

  calculatePeriod(frequency) {
    return 1 / frequency
  }
}