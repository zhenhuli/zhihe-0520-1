export class FreeFallEngine {
  constructor(params = {}) {
    this.g = params.g || 9.8
    this.m = params.m || 1.0
    this.Cd = params.Cd || 0.47
    this.A = params.A || 0.01
    this.rho = params.rho || 1.225
    this.h0 = params.h0 || 10.0
    this.v0 = params.v0 || 0
    this.useAirResistance = params.useAirResistance ?? true
    
    this.y = this.h0
    this.v = this.v0
    this.time = 0
    this.trajectory = []
    this.dataHistory = []
    this.hasLanded = false
    this.landTime = null
  }

  reset() {
    this.y = this.h0
    this.v = this.v0
    this.time = 0
    this.trajectory = []
    this.dataHistory = []
    this.hasLanded = false
    this.landTime = null
  }

  update(dt) {
    if (this.hasLanded) {
      return {
        position: 0,
        velocity: 0,
        acceleration: 0,
        energy: 0,
        airResistance: 0,
        gravityForce: 0,
        hasLanded: true,
        landTime: this.landTime
      }
    }

    const gravityForce = this.m * this.g
    let airResistance = 0
    
    if (this.useAirResistance && this.v > 0) {
      airResistance = 0.5 * this.rho * this.Cd * this.A * this.v * this.v
    }
    
    const totalForce = gravityForce - airResistance
    const a = totalForce / this.m
    
    this.v += a * dt
    this.y -= this.v * dt
    this.time += dt

    if (this.y <= 0) {
      this.y = 0
      this.hasLanded = true
      this.landTime = this.time
    }

    const E = 0.5 * this.m * this.v * this.v + this.m * this.g * this.y

    this.trajectory.push({ x: 0, y: this.y, time: this.time })
    this.dataHistory.push({
      time: this.time,
      position: this.y,
      velocity: this.v,
      acceleration: a,
      energy: E,
      airResistance,
      gravityForce,
      totalForce
    })

    if (this.trajectory.length > 1000) {
      this.trajectory.shift()
    }
    if (this.dataHistory.length > 500) {
      this.dataHistory.shift()
    }

    return {
      position: this.y,
      velocity: this.v,
      acceleration: a,
      energy: E,
      airResistance,
      gravityForce,
      totalForce,
      hasLanded: this.hasLanded,
      landTime: this.landTime
    }
  }

  getParams() {
    return {
      g: this.g,
      m: this.m,
      Cd: this.Cd,
      A: this.A,
      rho: this.rho,
      h0: this.h0,
      v0: this.v0,
      useAirResistance: this.useAirResistance
    }
  }

  setParams(params) {
    this.g = params.g ?? this.g
    this.m = params.m ?? this.m
    this.Cd = params.Cd ?? this.Cd
    this.A = params.A ?? this.A
    this.rho = params.rho ?? this.rho
    this.h0 = params.h0 ?? this.h0
    this.v0 = params.v0 ?? this.v0
    this.useAirResistance = params.useAirResistance ?? this.useAirResistance
  }

  getTerminalVelocity() {
    if (!this.useAirResistance) return Infinity
    return Math.sqrt((2 * this.m * this.g) / (this.rho * this.Cd * this.A))
  }

  getFreeFallTime() {
    if (this.useAirResistance) return null
    return Math.sqrt(2 * this.h0 / this.g)
  }
}
