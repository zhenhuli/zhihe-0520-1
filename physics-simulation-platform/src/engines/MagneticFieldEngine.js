export class MagneticFieldEngine {
  constructor(params = {}) {
    this.gridSize = params.gridSize || 40
    this.domainSize = params.domainSize || 2.0

    this.wires = params.wires || [
      { x: 0.5, y: 0.5, current: 2.0, radius: 0.05 },
      { x: 1.5, y: 0.5, current: -2.0, radius: 0.05 }
    ]

    this.magnets = params.magnets || [
      { x: 0.25, y: 1.5, orientation: 0, strength: 1.0, size: 0.3 }
    ]

    this.fieldData = []
    this.time = 0
    this.maxField = 1
  }

  reset() {
    this.time = 0
    this.fieldData = []
  }

  update(dt) {
    this.time += dt

    const size = this.gridSize
    const data = []
    const halfDomain = this.domainSize / 2

    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        const x = (i / (size - 1)) * this.domainSize
        const y = (j / (size - 1)) * this.domainSize

        let Bx = 0
        let By = 0
        let Bz = 0

        for (const wire of this.wires) {
          const dx = x - wire.x
          const dy = y - wire.y
          const r2 = dx * dx + dy * dy

          if (r2 > 0.0001) {
            const r = Math.sqrt(r2)
            const factor = (4e-7 * wire.current) / (2 * Math.PI * r2)

            Bx += -factor * dy
            By += factor * dx
            Bz += 0
          }
        }

        for (const magnet of this.magnets) {
          const dx = x - magnet.x
          const dy = y - magnet.y
          const r2 = dx * dx + dy * dy
          const r = Math.sqrt(r2)

          if (r > 0.01) {
            const m = magnet.strength
            const theta = magnet.orientation * Math.PI / 180
            const mx = m * Math.cos(theta)
            const my = m * Math.sin(theta)

            const dotProduct = dx * mx + dy * my

            Bx += (3 * dotProduct * dx - mx * r2) / Math.pow(r, 5)
            By += (3 * dotProduct * dy - my * r2) / Math.pow(r, 5)
          }
        }

        const magnitude = Math.sqrt(Bx * Bx + By * By + Bz * Bz)
        data.push({
          x,
          y,
          Bx,
          By,
          Bz,
          magnitude
        })
      }
    }

    this.maxField = Math.max(...data.map(d => d.magnitude)) || 1
    this.fieldData = data

    return {
      fieldData: this.fieldData,
      maxField: this.maxField,
      time: this.time
    }
  }

  calculateFieldAtPoint(x, y) {
    let Bx = 0
    let By = 0

    for (const wire of this.wires) {
      const dx = x - wire.x
      const dy = y - wire.y
      const r2 = dx * dx + dy * dy

      if (r2 > 0.0001) {
        const factor = (4e-7 * wire.current) / (2 * Math.PI * r2)
        Bx += -factor * dy
        By += factor * dx
      }
    }

    for (const magnet of this.magnets) {
      const dx = x - magnet.x
      const dy = y - magnet.y
      const r2 = dx * dx + dy * dy
      const r = Math.sqrt(r2)

      if (r > 0.01) {
        const m = magnet.strength
        const theta = magnet.orientation * Math.PI / 180
        const mx = m * Math.cos(theta)
        const my = m * Math.sin(theta)

        const dotProduct = dx * mx + dy * my

        Bx += (3 * dotProduct * dx - mx * r2) / Math.pow(r, 5)
        By += (3 * dotProduct * dy - my * r2) / Math.pow(r, 5)
      }
    }

    return { Bx, By, magnitude: Math.sqrt(Bx * Bx + By * By) }
  }

  getParams() {
    return {
      gridSize: this.gridSize,
      domainSize: this.domainSize,
      wires: JSON.parse(JSON.stringify(this.wires)),
      magnets: JSON.parse(JSON.stringify(this.magnets))
    }
  }

  setParams(params) {
    this.gridSize = params.gridSize ?? this.gridSize
    this.domainSize = params.domainSize ?? this.domainSize
    this.wires = params.wires ?? this.wires
    this.magnets = params.magnets ?? this.magnets
  }

  addWire(x, y, current = 1.0, radius = 0.05) {
    this.wires.push({ x, y, current, radius })
  }

  removeWire(index) {
    if (index >= 0 && index < this.wires.length) {
      this.wires.splice(index, 1)
    }
  }

  addMagnet(x, y, orientation = 0, strength = 1.0, size = 0.3) {
    this.magnets.push({ x, y, orientation, strength, size })
  }

  removeMagnet(index) {
    if (index >= 0 && index < this.magnets.length) {
      this.magnets.splice(index, 1)
    }
  }

  calculateFluxDensity(r, current) {
    return (4e-7 * current) / (2 * Math.PI * r)
  }

  calculateForceOnWire(current1, current2, length, distance) {
    return (4e-7 * current1 * current2 * length) / (2 * Math.PI * distance)
  }
}