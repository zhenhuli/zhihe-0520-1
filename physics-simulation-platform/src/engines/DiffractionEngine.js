export class DiffractionEngine {
  constructor(params = {}) {
    this.wavelength = params.wavelength || 550
    this.slitWidth = params.slitWidth || 50
    this.slitCount = params.slitCount || 2
    this.slitSpacing = params.slitSpacing || 100
    this.screenDistance = params.screenDistance || 1.0
    this.screenWidth = params.screenWidth || 2.0
    this.amplitude = params.amplitude || 1.0

    this.time = 0
    this.intensityPattern = []
    this.waveField = []
    this.maxIntensity = 1
    this.resolution = 500
  }

  reset() {
    this.time = 0
    this.intensityPattern = []
    this.waveField = []
  }

  update(dt) {
    this.time += dt

    const lambda = this.wavelength * 1e-9
    const d = this.slitWidth * 1e-6
    const a = this.slitSpacing * 1e-6
    const L = this.screenDistance
    const N = this.slitCount

    const halfWidth = this.screenWidth / 2
    const n = this.resolution
    const pattern = []
    const waveField = []

    for (let i = 0; i < n; i++) {
      const x = -halfWidth + (2 * halfWidth * i) / (n - 1)
      const sinTheta = x / Math.sqrt(x * x + L * L)

      const beta = (Math.PI * d * sinTheta) / lambda
      let singleSlit = beta === 0 ? 1 : Math.pow(Math.sin(beta) / beta, 2)

      let multiSlit = 1
      if (N > 1) {
        const alpha = (Math.PI * a * sinTheta) / lambda
        const numerator = Math.sin(N * alpha)
        const denominator = Math.sin(alpha)
        multiSlit = denominator === 0 ? N * N : Math.pow(numerator / denominator, 2)
      }

      const intensity = singleSlit * multiSlit
      pattern.push({ x, intensity })

      const phase = 2 * Math.PI * (x * sinTheta) / lambda
      waveField.push({
        x,
        real: Math.cos(phase - 2 * Math.PI * this.time * 5),
        imag: Math.sin(phase - 2 * Math.PI * this.time * 5)
      })
    }

    this.maxIntensity = Math.max(...pattern.map(p => p.intensity)) || 1
    this.intensityPattern = pattern
    this.waveField = waveField

    return {
      intensityPattern: this.intensityPattern,
      waveField: this.waveField,
      maxIntensity: this.maxIntensity,
      time: this.time
    }
  }

  getParams() {
    return {
      wavelength: this.wavelength,
      slitWidth: this.slitWidth,
      slitCount: this.slitCount,
      slitSpacing: this.slitSpacing,
      screenDistance: this.screenDistance,
      screenWidth: this.screenWidth,
      amplitude: this.amplitude
    }
  }

  setParams(params) {
    this.wavelength = params.wavelength ?? this.wavelength
    this.slitWidth = params.slitWidth ?? this.slitWidth
    this.slitCount = params.slitCount ?? this.slitCount
    this.slitSpacing = params.slitSpacing ?? this.slitSpacing
    this.screenDistance = params.screenDistance ?? this.screenDistance
    this.screenWidth = params.screenWidth ?? this.screenWidth
    this.amplitude = params.amplitude ?? this.amplitude
  }

  calculateCentralPeakWidth() {
    const lambda = this.wavelength * 1e-9
    const d = this.slitWidth * 1e-6
    return (2 * lambda * this.screenDistance) / d
  }

  calculateFirstMinimum() {
    const lambda = this.wavelength * 1e-9
    const d = this.slitWidth * 1e-6
    return (lambda * this.screenDistance) / d
  }

  calculateFringeSpacing() {
    const lambda = this.wavelength * 1e-9
    const a = this.slitSpacing * 1e-6
    return (lambda * this.screenDistance) / a
  }

  calculateResolution() {
    return this.wavelength / (this.slitCount * this.slitSpacing)
  }
}