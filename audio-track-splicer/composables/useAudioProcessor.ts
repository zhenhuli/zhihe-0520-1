import type { AudioTrack } from '~/types/audio'
import { TRACK_COLORS } from '~/types/audio'

export function useAudioProcessor() {
  const audioContext = ref<AudioContext | null>(null)
  const masterGainNode = ref<GainNode | null>(null)
  const sourceNodes = ref<Map<string, AudioBufferSourceNode>>(new Map())
  const gainNodes = ref<Map<string, GainNode>>(new Map())
  const tracks = ref<AudioTrack[]>([])
  const isPlaying = ref(false)
  const currentTime = ref(0)
  const masterVolume = ref(1)
  let animationFrameId: number | null = null
  let startTime = 0
  let pausedAt = 0

  const totalDuration = computed(() => {
    if (tracks.value.length === 0) return 0
    return Math.max(...tracks.value.map(t => t.endTime))
  })

  function initAudioContext() {
    if (!audioContext.value) {
      audioContext.value = new AudioContext()
      masterGainNode.value = audioContext.value.createGain()
      masterGainNode.value.connect(audioContext.value.destination)
      masterGainNode.value.gain.value = masterVolume.value
    }
    if (audioContext.value.state === 'suspended') {
      audioContext.value.resume()
    }
  }

  async function addTrack(file: File): Promise<AudioTrack> {
    initAudioContext()
    const arrayBuffer = await file.arrayBuffer()
    const audioBuffer = await audioContext.value!.decodeAudioData(arrayBuffer)
    
    const track: AudioTrack = {
      id: generateId(),
      name: file.name,
      file,
      audioBuffer,
      duration: audioBuffer.duration,
      startTime: 0,
      endTime: audioBuffer.duration,
      volume: 1,
      fadeIn: 0,
      fadeOut: 0,
      muted: false,
      color: TRACK_COLORS[tracks.value.length % TRACK_COLORS.length]
    }
    
    tracks.value.push(track)
    return track
  }

  function removeTrack(id: string) {
    stopTrack(id)
    tracks.value = tracks.value.filter(t => t.id !== id)
  }

  function updateTrack(id: string, updates: Partial<AudioTrack>) {
    const track = tracks.value.find(t => t.id === id)
    if (track) {
      Object.assign(track, updates)
    }
  }

  function reorderTracks(newOrder: AudioTrack[]) {
    tracks.value = newOrder
  }

  function playTrack(track: AudioTrack, offset: number = 0) {
    if (!audioContext.value || !masterGainNode.value || !track.audioBuffer) return

    stopTrack(track.id)

    const source = audioContext.value.createBufferSource()
    source.buffer = track.audioBuffer

    const gainNode = audioContext.value.createGain()
    gainNode.gain.value = track.muted ? 0 : track.volume

    const trackDuration = track.endTime - track.startTime
    const startOffset = Math.max(0, track.startTime + offset)
    const playDuration = Math.max(0, trackDuration - offset)

    if (playDuration <= 0) return

    if (track.fadeIn > 0) {
      const fadeInEnd = Math.min(track.fadeIn, playDuration)
      gainNode.gain.setValueAtTime(0, audioContext.value.currentTime)
      gainNode.gain.linearRampToValueAtTime(
        track.muted ? 0 : track.volume,
        audioContext.value.currentTime + fadeInEnd
      )
    }

    if (track.fadeOut > 0 && playDuration > track.fadeOut) {
      const fadeOutStart = audioContext.value.currentTime + playDuration - track.fadeOut
      gainNode.gain.setValueAtTime(
        track.muted ? 0 : track.volume,
        fadeOutStart
      )
      gainNode.gain.linearRampToValueAtTime(0, audioContext.value.currentTime + playDuration)
    }

    source.connect(gainNode)
    gainNode.connect(masterGainNode.value)

    source.start(audioContext.value.currentTime, startOffset, playDuration)
    sourceNodes.value.set(track.id, source)
    gainNodes.value.set(track.id, gainNode)

    source.onended = () => {
      sourceNodes.value.delete(track.id)
      gainNodes.value.delete(track.id)
    }
  }

  function stopTrack(id: string) {
    const source = sourceNodes.value.get(id)
    if (source) {
      try {
        source.stop()
      } catch (e) {}
      sourceNodes.value.delete(id)
    }
    gainNodes.value.delete(id)
  }

  function playAll() {
    if (!audioContext.value) return
    
    initAudioContext()
    
    const offset = pausedAt
    startTime = audioContext.value.currentTime - offset
    
    tracks.value.forEach(track => {
      playTrack(track, offset)
    })
    
    isPlaying.value = true
    startProgressTracking()
  }

  function pauseAll() {
    sourceNodes.value.forEach(source => {
      try {
        source.stop()
      } catch (e) {}
    })
    sourceNodes.value.clear()
    gainNodes.value.clear()
    
    if (audioContext.value) {
      pausedAt = audioContext.value.currentTime - startTime
    }
    
    isPlaying.value = false
    stopProgressTracking()
  }

  function stopAll() {
    pauseAll()
    currentTime.value = 0
    pausedAt = 0
  }

  function seek(time: number) {
    const wasPlaying = isPlaying.value
    pauseAll()
    pausedAt = time
    currentTime.value = time
    if (wasPlaying) {
      playAll()
    }
  }

  function setMasterVolume(volume: number) {
    masterVolume.value = volume
    if (masterGainNode.value) {
      masterGainNode.value.gain.value = volume
    }
  }

  function startProgressTracking() {
    const update = () => {
      if (audioContext.value && isPlaying.value) {
        currentTime.value = audioContext.value.currentTime - startTime
        if (currentTime.value >= totalDuration.value) {
          stopAll()
          return
        }
      }
      animationFrameId = requestAnimationFrame(update)
    }
    update()
  }

  function stopProgressTracking() {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId)
      animationFrameId = null
    }
  }

  async function exportMix(): Promise<Blob> {
    if (!audioContext.value || tracks.value.length === 0) {
      throw new Error('No tracks to export')
    }

    const sampleRate = audioContext.value.sampleRate
    const duration = totalDuration.value
    const offlineContext = new OfflineAudioContext(2, sampleRate * duration, sampleRate)
    const offlineMasterGain = offlineContext.createGain()
    offlineMasterGain.gain.value = masterVolume.value
    offlineMasterGain.connect(offlineContext.destination)

    tracks.value.forEach(track => {
      if (!track.audioBuffer || track.muted) return

      const source = offlineContext.createBufferSource()
      source.buffer = track.audioBuffer

      const gainNode = offlineContext.createGain()
      gainNode.gain.value = track.volume

      const trackDuration = track.endTime - track.startTime

      if (track.fadeIn > 0) {
        const fadeInEnd = Math.min(track.fadeIn, trackDuration)
        gainNode.gain.setValueAtTime(0, 0)
        gainNode.gain.linearRampToValueAtTime(track.volume, fadeInEnd)
      }

      if (track.fadeOut > 0 && trackDuration > track.fadeOut) {
        const fadeOutStart = trackDuration - track.fadeOut
        gainNode.gain.setValueAtTime(track.volume, fadeOutStart)
        gainNode.gain.linearRampToValueAtTime(0, trackDuration)
      }

      source.connect(gainNode)
      gainNode.connect(offlineMasterGain)
      source.start(0, track.startTime, trackDuration)
    })

    const renderedBuffer = await offlineContext.startRendering()
    return audioBufferToWav(renderedBuffer)
  }

  function audioBufferToWav(buffer: AudioBuffer): Blob {
    const numChannels = buffer.numberOfChannels
    const sampleRate = buffer.sampleRate
    const format = 1
    const bitDepth = 16

    const bytesPerSample = bitDepth / 8
    const blockAlign = numChannels * bytesPerSample

    const dataLength = buffer.length * blockAlign
    const bufferLength = 44 + dataLength

    const arrayBuffer = new ArrayBuffer(bufferLength)
    const view = new DataView(arrayBuffer)

    writeString(view, 0, 'RIFF')
    view.setUint32(4, bufferLength - 8, true)
    writeString(view, 8, 'WAVE')
    writeString(view, 12, 'fmt ')
    view.setUint32(16, 16, true)
    view.setUint16(20, format, true)
    view.setUint16(22, numChannels, true)
    view.setUint32(24, sampleRate, true)
    view.setUint32(28, sampleRate * blockAlign, true)
    view.setUint16(32, blockAlign, true)
    view.setUint16(34, bitDepth, true)
    writeString(view, 36, 'data')
    view.setUint32(40, dataLength, true)

    const channels: Float32Array[] = []
    for (let i = 0; i < numChannels; i++) {
      channels.push(buffer.getChannelData(i))
    }

    let offset = 44
    for (let i = 0; i < buffer.length; i++) {
      for (let channel = 0; channel < numChannels; channel++) {
        let sample = Math.max(-1, Math.min(1, channels[channel][i]))
        sample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF
        view.setInt16(offset, sample, true)
        offset += 2
      }
    }

    return new Blob([arrayBuffer], { type: 'audio/wav' })
  }

  function writeString(view: DataView, offset: number, str: string) {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i))
    }
  }

  function generateId(): string {
    return Math.random().toString(36).substring(2, 9)
  }

  function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    const ms = Math.floor((seconds % 1) * 100)
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`
  }

  return {
    tracks,
    isPlaying,
    currentTime,
    totalDuration,
    masterVolume,
    addTrack,
    removeTrack,
    updateTrack,
    reorderTracks,
    playAll,
    pauseAll,
    stopAll,
    seek,
    setMasterVolume,
    exportMix,
    formatTime
  }
}
