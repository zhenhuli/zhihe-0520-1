import { ref } from 'vue'

export function useAudioPlayer() {
  const audioContext = ref<AudioContext | null>(null)
  const isPlaying = ref(false)
  const currentFrequency = ref(0)

  function initAudioContext() {
    if (!audioContext.value) {
      audioContext.value = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
    return audioContext.value
  }

  function playTone(frequency: number, duration: number = 1, type: OscillatorType = 'sine', volume: number = 0.3) {
    const ctx = initAudioContext()
    if (ctx.state === 'suspended') {
      ctx.resume()
    }

    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscillator.type = type
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime)

    gainNode.gain.setValueAtTime(0, ctx.currentTime)
    gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.05)
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)

    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    currentFrequency.value = frequency
    isPlaying.value = true

    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + duration)

    oscillator.onended = () => {
      isPlaying.value = false
      currentFrequency.value = 0
    }
  }

  function playGuzhengTone(frequency: number, duration: number = 2) {
    const ctx = initAudioContext()
    if (ctx.state === 'suspended') {
      ctx.resume()
    }

    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()
    const filter = ctx.createBiquadFilter()

    oscillator.type = 'triangle'
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime)

    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(frequency * 3, ctx.currentTime)
    filter.Q.setValueAtTime(2, ctx.currentTime)

    gainNode.gain.setValueAtTime(0, ctx.currentTime)
    gainNode.gain.linearRampToValueAtTime(0.4, ctx.currentTime + 0.02)
    gainNode.gain.exponentialRampToValueAtTime(0.15, ctx.currentTime + 0.3)
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)

    oscillator.connect(filter)
    filter.connect(gainNode)
    gainNode.connect(ctx.destination)

    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + duration)
  }

  function playErhuTone(frequency: number, duration: number = 1.5) {
    const ctx = initAudioContext()
    if (ctx.state === 'suspended') {
      ctx.resume()
    }

    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()
    const vibrato = ctx.createOscillator()
    const vibratoGain = ctx.createGain()

    oscillator.type = 'sawtooth'
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime)

    vibrato.type = 'sine'
    vibrato.frequency.setValueAtTime(5, ctx.currentTime)
    vibratoGain.gain.setValueAtTime(3, ctx.currentTime)

    vibrato.connect(vibratoGain)
    vibratoGain.connect(oscillator.frequency)

    const filter = ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.setValueAtTime(frequency * 2, ctx.currentTime)
    filter.Q.setValueAtTime(3, ctx.currentTime)

    gainNode.gain.setValueAtTime(0, ctx.currentTime)
    gainNode.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 0.1)
    gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.5)
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)

    oscillator.connect(filter)
    filter.connect(gainNode)
    gainNode.connect(ctx.destination)

    oscillator.start(ctx.currentTime)
    vibrato.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + duration)
    vibrato.stop(ctx.currentTime + duration)
  }

  function playBellTone(frequency: number, duration: number = 3) {
    const ctx = initAudioContext()
    if (ctx.state === 'suspended') {
      ctx.resume()
    }

    const fundamental = ctx.createOscillator()
    const harmonic2 = ctx.createOscillator()
    const harmonic3 = ctx.createOscillator()
    const gainNode = ctx.createGain()

    fundamental.type = 'sine'
    fundamental.frequency.setValueAtTime(frequency, ctx.currentTime)

    harmonic2.type = 'sine'
    harmonic2.frequency.setValueAtTime(frequency * 2.01, ctx.currentTime)

    harmonic3.type = 'sine'
    harmonic3.frequency.setValueAtTime(frequency * 3.03, ctx.currentTime)

    gainNode.gain.setValueAtTime(0, ctx.currentTime)
    gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.01)
    gainNode.gain.exponentialRampToValueAtTime(0.1, ctx.currentTime + 0.5)
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)

    const gain2 = ctx.createGain()
    gain2.gain.setValueAtTime(0.5, ctx.currentTime)
    const gain3 = ctx.createGain()
    gain3.gain.setValueAtTime(0.3, ctx.currentTime)

    fundamental.connect(gainNode)
    harmonic2.connect(gain2)
    gain2.connect(gainNode)
    harmonic3.connect(gain3)
    gain3.connect(gainNode)
    gainNode.connect(ctx.destination)

    fundamental.start(ctx.currentTime)
    harmonic2.start(ctx.currentTime)
    harmonic3.start(ctx.currentTime)
    fundamental.stop(ctx.currentTime + duration)
    harmonic2.stop(ctx.currentTime + duration)
    harmonic3.stop(ctx.currentTime + duration)
  }

  function stopAll() {
    if (audioContext.value) {
      audioContext.value.close()
      audioContext.value = null
    }
    isPlaying.value = false
    currentFrequency.value = 0
  }

  return {
    playTone,
    playGuzhengTone,
    playErhuTone,
    playBellTone,
    stopAll,
    isPlaying,
    currentFrequency
  }
}
