export class SpringDamperEngine {
  constructor(params = {}) {
    this.k = params.k || 50
    this.m = params.m || 1.0
    this.b = params.b || 0.5
    this.g = params.g || 9.8
    this.x0 = params.x0 || 0.5
    this.v0 = params.v0 || 0
    
    this.x = this.x0
    this.v = this.v0
    this.time = 0
    this.trajectory = []
    this.dataHistory = []
    this.equilibrium = (this.m * this.g) / this.k
  }

  reset() {
    this.x = this.x0
    this.v = this.v0
    this.time = 0
    this.trajectory = []
    this.dataHistory = []
    this.equilibrium = (this.m * this.g) / this.k
  }

  update(dt) {
    const springForce = -this.k * (this.x - this.equilibrium)
    const dampingForce = -this.b * this.v
    const gravityForce = this.m * this.g
    const totalForce = springForce + dampingForce + gravityForce
    
    const a = totalForce / this.m
    
    this.v += a * dt
    this.x += this.v * dt
    this.time += dt

    const E = 0.5 * this.m * this.v * this.v + 
              0.5 * this.k * Math.pow(this.x - this.equilibrium, 2) +
              this.m * this.g * (2 - this.x)

    this.trajectory.push({ x: this.x, y: 0, time: this.time })
    this.dataHistory.push({
      time: this.time,
      position: this.x,
      velocity: this.v,
      acceleration: a,
      energy: E,
      springForce,
      dampingForce,
      totalForce
    })

    if (this.trajectory.length > 1000) {
      this.trajectory.shift()
    }
    if (this.dataHistory.length > 500) {
      this.dataHistory.shift()
    }

    return {
      position: this.x,
      velocity: this.v,
      acceleration: a,
      energy: E,
      equilibrium: this.equilibrium,
      springForce,
      dampingForce,
      totalForce
    }
  }

  getParams() {
    return {
      k: this.k,
      m: this.m,
      b: this.b,
      g: this.g,
      x0: this.x0,
      v0: this.v0
    }
  }

  setParams(params) {
    this.k = params.k ?? this.k
    this.m = params.m ?? this.m
    this.b = params.b ?? this.b
    this.g = params.g ?? this.g
    this.x0 = params.x0 ?? this.x0
    this.v0 = params.v0 ?? this.v0
    this.equilibrium = (this.m * this.g) / this.k
  }

  getNaturalFrequency() {
    return Math.sqrt(this.k / this.m)
  }

  getDampingRatio() {
    return this.b / (2 * Math.sqrt(this.k * this.m))
  }

  getPeriod() {
    const omega = this.getNaturalFrequency()
    const zeta = this.getDampingRatio()
    if (zeta < 1) {
      return 2 * Math.PI / (omega * Math.sqrt(1 - zeta * zeta))
    }
    return Infinity
  }
}
