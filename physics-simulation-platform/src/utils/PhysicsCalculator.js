export const PhysicsCalculator = {
  computePendulum(params) {
    const { L, g, m, b, theta0 } = params
    const T = 2 * Math.PI * Math.sqrt(L / g)
    const f = 1 / T
    const omega = Math.sqrt(g / L)
    const E0 = m * g * L * (1 - Math.cos(theta0))
    const dampingRatio = b / (2 * Math.sqrt(m * g / L))
    const periodExact = T * (1 + (1 / 16) * theta0 * theta0)

    return {
      period: T,
      frequency: f,
      angularFrequency: omega,
      initialEnergy: E0,
      dampingRatio,
      exactPeriod: periodExact,
      isUnderdamped: dampingRatio < 1,
      isOverdamped: dampingRatio > 1,
      isCriticallyDamped: Math.abs(dampingRatio - 1) < 0.001
    }
  },

  computeSpringDamper(params) {
    const { k, m, c, F0, omega } = params
    const omegaNatural = Math.sqrt(k / m)
    const dampingRatio = c / (2 * Math.sqrt(k * m))
    const omegaDamped = omegaNatural * Math.sqrt(1 - dampingRatio * dampingRatio)
    const T = 2 * Math.PI / omegaDamped
    const resonanceFrequency = omegaNatural * Math.sqrt(1 - 2 * dampingRatio * dampingRatio)
    const amplitudeResonance = F0 / (c * omegaNatural)

    return {
      naturalFrequency: omegaNatural,
      dampingRatio,
      dampedFrequency: omegaDamped,
      period: T,
      resonanceFrequency,
      resonanceAmplitude: amplitudeResonance,
      isUnderdamped: dampingRatio < 1,
      isOverdamped: dampingRatio > 1,
      isCriticallyDamped: Math.abs(dampingRatio - 1) < 0.001,
      willResonate: omega > 0 && Math.abs(omega - resonanceFrequency) < omegaNatural * 0.1
    }
  },

  computeFreeFall(params) {
    const { g, m, h0, v0, Cd, A, rho, useAirResistance } = params
    const tFreeFall = Math.sqrt(2 * h0 / g)
    const vImpact = Math.sqrt(v0 * v0 + 2 * g * h0)
    const vTerminal = useAirResistance ? Math.sqrt((2 * m * g) / (rho * Cd * A)) : Infinity
    const E0 = m * g * h0 + 0.5 * m * v0 * v0
    const Reynolds = useAirResistance ? (rho * vImpact * Math.sqrt(A)) / 1.8e-5 : 0

    return {
      freeFallTime: tFreeFall,
      impactVelocity: vImpact,
      terminalVelocity: vTerminal,
      initialEnergy: E0,
      reynoldsNumber: Reynolds,
      willReachTerminal: useAirResistance && vTerminal < vImpact,
      airResistanceCoefficient: useAirResistance ? 0.5 * rho * Cd * A : 0
    }
  },

  computeDiffraction(params) {
    const { wavelength, slitWidth, slitCount, slitSpacing, screenDistance } = params
    const lambda = wavelength * 1e-9
    const d = slitWidth * 1e-6
    const a = slitSpacing * 1e-6

    const centralWidth = (2 * lambda * screenDistance) / d
    const firstMinimum = (lambda * screenDistance) / d
    const fringeSpacing = slitCount > 1 ? (lambda * screenDistance) / a : 0
    const resolution = wavelength / (slitCount * slitSpacing)
    const dispersion = slitCount > 1 ? slitCount / a : 0

    return {
      centralPeakWidth: centralWidth,
      firstMinimumPosition: firstMinimum,
      fringeSpacing,
      resolvingPower: resolution,
      angularDispersion: dispersion,
      numberFringes: slitCount > 1 ? Math.floor(d / a) : 0,
      isFraunhofer: screenDistance > (slitWidth * 1e-6) ** 2 / lambda
    }
  },

  computeSoundSpectrum(params) {
    const { sampleRate, bufferSize, frequencies } = params
    const nyquist = sampleRate / 2
    const freqResolution = sampleRate / bufferSize
    const binCount = bufferSize / 2
    const wavelengths = frequencies.map(f => 343 / f)
    const periods = frequencies.map(f => 1 / f)

    return {
      nyquistFrequency: nyquist,
      frequencyResolution: freqResolution,
      fftBinCount: binCount,
      wavelengths,
      periods,
      canDetectAllFrequencies: frequencies.every(f => f <= nyquist),
      timeResolution: 1 / freqResolution
    }
  },

  computeMagneticField(params) {
    const { wires, magnets } = params
    const mu0 = 4e-7 * Math.PI
    const wireFields = wires.map(wire => {
      const B_at_1m = (mu0 * Math.abs(wire.current)) / (2 * Math.PI)
      return {
        current: wire.current,
        fieldAt1m: B_at_1m,
        direction: wire.current >= 0 ? 'counterclockwise' : 'clockwise'
      }
    })

    const magnetMoments = magnets.map(m => ({
      strength: m.strength,
      orientation: m.orientation,
      fieldAt1m: m.strength / Math.pow(1, 3)
    }))

    const pairForces = []
    for (let i = 0; i < wires.length; i++) {
      for (let j = i + 1; j < wires.length; j++) {
        const dx = wires[j].x - wires[i].x
        const dy = wires[j].y - wires[i].y
        const dist = Math.sqrt(dx * dx + dy * dy)
        const force = (mu0 * wires[i].current * wires[j].current) / (2 * Math.PI * dist)
        pairForces.push({
          wire1: i,
          wire2: j,
          distance: dist,
          forcePerUnitLength: force,
          attractive: wires[i].current * wires[j].current > 0
        })
      }
    }

    return {
      permeability: mu0,
      wireFields,
      magnetMoments,
      pairForces,
      totalWireCount: wires.length,
      totalMagnetCount: magnets.length
    }
  },

  computeHeatDiffusion(params) {
    const { alpha, dx, dt, gridSize, boundaryTemps } = params
    const r = alpha * dt / (dx * dx)
    const isStable = r <= 0.25
    const domainSize = (gridSize - 1) * dx
    const diffusionTimeScale = (domainSize * domainSize) / alpha
    const boundaryAverage = (boundaryTemps.top + boundaryTemps.bottom +
      boundaryTemps.left + boundaryTemps.right) / 4
    const tempRange = Math.max(boundaryTemps.top, boundaryTemps.bottom,
      boundaryTemps.left, boundaryTemps.right) -
      Math.min(boundaryTemps.top, boundaryTemps.bottom,
        boundaryTemps.left, boundaryTemps.right)

    return {
      stabilityParameter: r,
      isStable,
      domainSize,
      diffusionTimeScale,
      steadyStateEstimate: boundaryAverage,
      temperatureRange: tempRange,
      recommendedDt: 0.25 * (dx * dx) / alpha
    }
  },

  autoCalculate(simulationType, params) {
    switch (simulationType) {
      case 'pendulum':
        return this.computePendulum(params)
      case 'spring-damper':
        return this.computeSpringDamper(params)
      case 'free-fall':
        return this.computeFreeFall(params)
      case 'diffraction':
        return this.computeDiffraction(params)
      case 'sound-spectrum':
        return this.computeSoundSpectrum(params)
      case 'magnetic-field':
        return this.computeMagneticField(params)
      case 'heat-diffusion':
        return this.computeHeatDiffusion(params)
      default:
        return {}
    }
  }
}