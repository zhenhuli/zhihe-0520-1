export class PendulumEngine {
  constructor(params = {}) {
    this.g = params.g || 9.8
    this.L = params.L || 2.0
    this.m = params.m || 1.0
    this.b = params.b || 0.1
    this.theta0 = params.theta0 || Math.PI / 4
    this.omega0 = params.omega0 || 0
    
    this.theta = this.theta0
    this.omega = this.omega0
    this.time = 0
    this.trajectory = []
    this.dataHistory = []
  }

  reset() {
    this.theta = this.theta0
    this.omega = this.omega0
    this.time = 0
    this.trajectory = []
    this.dataHistory = []
  }

  update(dt) {
    const alpha = -(this.g / this.L) * Math.sin(this.theta) - (this.b / this.m) * this.omega
    
    this.omega += alpha * dt
    this.theta += this.omega * dt
    this.time += dt

    const x = this.L * Math.sin(this.theta)
    const y = -this.L * Math.cos(this.theta)

    const E = 0.5 * this.m * Math.pow(this.L * this.omega, 2) + 
              this.m * this.g * (this.L + y)

    this.trajectory.push({ x, y, time: this.time })
    this.dataHistory.push({
      time: this.time,
      theta: this.theta,
      omega: this.omega,
      alpha,
      energy: E,
      x,
      y
    })

    if (this.trajectory.length > 1000) {
      this.trajectory.shift()
    }
    if (this.dataHistory.length > 500) {
      this.dataHistory.shift()
    }

    return { theta: this.theta, omega: this.omega, x, y, energy: E, alpha }
  }

  getParams() {
    return {
      g: this.g,
      L: this.L,
      m: this.m,
      b: this.b,
      theta0: this.theta0,
      omega0: this.omega0
    }
  }

  setParams(params) {
    this.g = params.g ?? this.g
    this.L = params.L ?? this.L
    this.m = params.m ?? this.m
    this.b = params.b ?? this.b
    this.theta0 = params.theta0 ?? this.theta0
    this.omega0 = params.omega0 ?? this.omega0
  }

  getPeriod() {
    return 2 * Math.PI * Math.sqrt(this.L / this.g)
  }

  getFrequency() {
    return 1 / this.getPeriod()
  }
}
