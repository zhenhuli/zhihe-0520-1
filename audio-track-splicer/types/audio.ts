export interface AudioTrack {
  id: string
  name: string
  file: File
  audioBuffer: AudioBuffer | null
  duration: number
  startTime: number
  endTime: number
  volume: number
  fadeIn: number
  fadeOut: number
  muted: boolean
  color: string
}

export interface AudioState {
  tracks: AudioTrack[]
  isPlaying: boolean
  currentTime: number
  totalDuration: number
  masterVolume: number
}

export const TRACK_COLORS = [
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#ec4899',
  '#06b6d4',
  '#f97316'
]
