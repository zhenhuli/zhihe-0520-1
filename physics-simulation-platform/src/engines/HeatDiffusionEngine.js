export class HeatDiffusionEngine {
  constructor(params = {}) {
    this.gridSize = params.gridSize || 50
    this.alpha = params.alpha || 0.01
    this.dx = params.dx || 0.02
    this.dt = params.dt || 0.01
    this.boundaryType = params.boundaryType || 'dirichlet'

    this.temperature = []
    this.prevTemperature = []
    this.time = 0
    this.maxTemp = 100
    this.minTemp = 0

    this.boundaryTemps = params.boundaryTemps || {
      top: 0,
      bottom: 100,
      left: 0,
      right: 0
    }

    this.heatSources = params.heatSources || [
      { x: 0.5, y: 0.5, temperature: 80, radius: 0.1 }
    ]

    this.initializeGrid()
  }

  initializeGrid() {
    const n = this.gridSize
    this.temperature = []
    this.prevTemperature = []

    for (let i = 0; i < n; i++) {
      this.temperature.push(new Float64Array(n))
      this.prevTemperature.push(new Float64Array(n))
    }

    this.applyBoundaryConditions()
    this.applyHeatSources()
  }

  applyBoundaryConditions() {
    const n = this.gridSize

    for (let i = 0; i < n; i++) {
      this.temperature[0][i] = this.boundaryTemps.top
      this.temperature[n - 1][i] = this.boundaryTemps.bottom
      this.temperature[i][0] = this.boundaryTemps.left
      this.temperature[i][n - 1] = this.boundaryTemps.right
    }
  }

  applyHeatSources() {
    const n = this.gridSize
    const domainSize = (n - 1) * this.dx

    for (const source of this.heatSources) {
      const cx = source.x * domainSize
      const cy = source.y * domainSize
      const r = source.radius * domainSize

      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          const x = i * this.dx
          const y = j * this.dx
          const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2)

          if (dist < r) {
            this.temperature[j][i] = source.temperature * (1 - dist / r)
          }
        }
      }
    }
  }

  reset() {
    this.time = 0
    this.initializeGrid()
  }

  update(dt) {
    const n = this.gridSize
    const r = this.alpha * dt / (this.dx * this.dx)

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        this.prevTemperature[i][j] = this.temperature[i][j]
      }
    }

    for (let i = 1; i < n - 1; i++) {
      for (let j = 1; j < n - 1; j++) {
        this.temperature[i][j] = this.prevTemperature[i][j] +
          r * (
            this.prevTemperature[i + 1][j] +
            this.prevTemperature[i - 1][j] +
            this.prevTemperature[i][j + 1] +
            this.prevTemperature[i][j - 1] -
            4 * this.prevTemperature[i][j]
          )
      }
    }

    this.applyBoundaryConditions()
    this.applyHeatSources()

    this.time += dt

    this.maxTemp = -Infinity
    this.minTemp = Infinity
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        this.maxTemp = Math.max(this.maxTemp, this.temperature[i][j])
        this.minTemp = Math.min(this.minTemp, this.temperature[i][j])
      }
    }

    return {
      temperature: this.temperature,
      maxTemp: this.maxTemp,
      minTemp: this.minTemp,
      time: this.time
    }
  }

  getTemperatureGrid() {
    return this.temperature
  }

  getTemperatureAt(x, y) {
    const i = Math.round(y / this.dx)
    const j = Math.round(x / this.dx)
    const n = this.gridSize

    if (i >= 0 && i < n && j >= 0 && j < n) {
      return this.temperature[i][j]
    }
    return 0
  }

  calculateGradient(x, y) {
    const i = Math.round(y / this.dx)
    const j = Math.round(x / this.dx)
    const n = this.gridSize

    if (i > 0 && i < n - 1 && j > 0 && j < n - 1) {
      const dTdx = (this.temperature[i][j + 1] - this.temperature[i][j - 1]) / (2 * this.dx)
      const dTdy = (this.temperature[i + 1][j] - this.temperature[i - 1][j]) / (2 * this.dx)
      return { dTdx, dTdy, magnitude: Math.sqrt(dTdx * dTdx + dTdy * dTdy) }
    }
    return { dTdx: 0, dTdy: 0, magnitude: 0 }
  }

  getParams() {
    return {
      gridSize: this.gridSize,
      alpha: this.alpha,
      dx: this.dx,
      dt: this.dt,
      boundaryType: this.boundaryType,
      boundaryTemps: { ...this.boundaryTemps },
      heatSources: JSON.parse(JSON.stringify(this.heatSources))
    }
  }

  setParams(params) {
    const needReinit = params.gridSize !== this.gridSize ||
      params.alpha !== this.alpha ||
      params.dx !== this.dx

    this.gridSize = params.gridSize ?? this.gridSize
    this.alpha = params.alpha ?? this.alpha
    this.dx = params.dx ?? this.dx
    this.dt = params.dt ?? this.dt
    this.boundaryType = params.boundaryType ?? this.boundaryType
    this.boundaryTemps = params.boundaryTemps ?? this.boundaryTemps
    this.heatSources = params.heatSources ?? this.heatSources

    if (needReinit) {
      this.initializeGrid()
    }
  }

  addHeatSource(x, y, temperature, radius = 0.1) {
    this.heatSources.push({ x, y, temperature, radius })
  }

  removeHeatSource(index) {
    if (index >= 0 && index < this.heatSources.length) {
      this.heatSources.splice(index, 1)
    }
  }

  calculateThermalDiffusivity(conductivity, density, specificHeat) {
    return conductivity / (density * specificHeat)
  }

  calculateSteadyState() {
    return (this.boundaryTemps.top + this.boundaryTemps.bottom +
      this.boundaryTemps.left + this.boundaryTemps.right) / 4
  }
}