export interface Waypoint {
  id: string
  x: number
  y: number
  altitude: number
  angle: number
  type: 'takeoff' | 'waypoint' | 'landing' | 'poi'
  name: string
}

export interface FlightMode {
  type: 'straight' | 'orbit' | 'gradient'
  name: string
  description: string
}

export interface OrbitConfig {
  centerX: number
  centerY: number
  radius: number
  altitude: number
  angleStart: number
  angleEnd: number
  clockwise: boolean
  speed: number
}

export interface FlightPath {
  waypoints: Waypoint[]
  mode: FlightMode['type']
  orbitConfig?: OrbitConfig
  totalDistance: number
  estimatedTime: number
}

export interface CameraConfig {
  fov: number
  aspectRatio: number
  gimbalPitch: number
}

export interface RouteConfig {
  name: string
  createdAt: string
  waypoints: Waypoint[]
  flightMode: FlightMode['type']
  orbitConfig?: OrbitConfig
  cameraConfig: CameraConfig
  speed: number
  totalDistance: number
  estimatedTime: number
}
