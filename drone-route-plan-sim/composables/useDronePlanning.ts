import type { Waypoint, FlightMode, OrbitConfig, FlightPath, CameraConfig, RouteConfig } from '~/types/drone'

export const useDronePlanning = () => {
  const waypoints = ref<Waypoint[]>([])
  const selectedWaypoint = ref<Waypoint | null>(null)
  const flightMode = ref<FlightMode['type']>('straight')
  const speed = ref(5)
  const isPlanning = ref(true)

  const cameraConfig = ref<CameraConfig>({
    fov: 90,
    aspectRatio: 16 / 9,
    gimbalPitch: -45,
  })

  const orbitConfig = ref<OrbitConfig>({
    centerX: 400,
    centerY: 300,
    radius: 100,
    altitude: 50,
    angleStart: 0,
    angleEnd: 360,
    clockwise: true,
    speed: 5,
  })

  const flightModes: FlightMode[] = [
    { type: 'straight', name: '直线飞行', description: '按航点顺序直线飞行' },
    { type: 'orbit', name: '环绕飞行', description: '围绕目标点环绕飞行' },
    { type: 'gradient', name: '渐变飞行', description: '高度和角度渐变过渡' },
  ]

  const generateId = () => Math.random().toString(36).substr(2, 9)

  const addWaypoint = (x: number, y: number, type: Waypoint['type'] = 'waypoint') => {
    const wp: Waypoint = {
      id: generateId(),
      x,
      y,
      altitude: 50,
      angle: 0,
      type,
      name: type === 'takeoff' ? '起飞点' : type === 'landing' ? '降落点' : type === 'poi' ? '兴趣点' : `航点${waypoints.value.filter(w => w.type === 'waypoint').length + 1}`,
    }
    waypoints.value.push(wp)
    return wp
  }

  const removeWaypoint = (id: string) => {
    const index = waypoints.value.findIndex(w => w.id === id)
    if (index > -1) {
      waypoints.value.splice(index, 1)
      if (selectedWaypoint.value?.id === id) {
        selectedWaypoint.value = null
      }
    }
  }

  const updateWaypoint = (id: string, updates: Partial<Waypoint>) => {
    const wp = waypoints.value.find(w => w.id === id)
    if (wp) {
      Object.assign(wp, updates)
    }
  }

  const clearWaypoints = () => {
    waypoints.value = []
    selectedWaypoint.value = null
  }

  const calculateDistance = (x1: number, y1: number, x2: number, y2: number) => {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
  }

  const generateFlightPath = (): FlightPath => {
    let pathWaypoints: Waypoint[] = []

    if (flightMode.value === 'straight') {
      pathWaypoints = [...waypoints.value]
    } else if (flightMode.value === 'orbit') {
      pathWaypoints = generateOrbitPath()
    } else if (flightMode.value === 'gradient') {
      pathWaypoints = generateGradientPath()
    }

    let totalDistance = 0
    for (let i = 0; i < pathWaypoints.length - 1; i++) {
      totalDistance += calculateDistance(
        pathWaypoints[i].x, pathWaypoints[i].y,
        pathWaypoints[i + 1].x, pathWaypoints[i + 1].y
      )
    }

    const estimatedTime = totalDistance / (speed.value * 10)

    return {
      waypoints: pathWaypoints,
      mode: flightMode.value,
      orbitConfig: flightMode.value === 'orbit' ? orbitConfig.value : undefined,
      totalDistance,
      estimatedTime,
    }
  }

  const generateOrbitPath = (): Waypoint[] => {
    const path: Waypoint[] = []
    const { centerX, centerY, radius, altitude, angleStart, angleEnd, clockwise } = orbitConfig.value
    const steps = 36

    const startRad = (angleStart * Math.PI) / 180
    const endRad = (angleEnd * Math.PI) / 180
    const direction = clockwise ? 1 : -1
    const totalAngle = direction * (endRad - startRad)

    for (let i = 0; i <= steps; i++) {
      const angle = startRad + (totalAngle * i) / steps
      const x = centerX + radius * Math.cos(angle)
      const y = centerY + radius * Math.sin(angle)

      path.push({
        id: generateId(),
        x,
        y,
        altitude,
        angle: ((angle * 180) / Math.PI + 90) % 360,
        type: 'waypoint',
        name: `环绕点${i + 1}`,
      })
    }

    return path
  }

  const generateGradientPath = (): Waypoint[] => {
    if (waypoints.value.length < 2) return [...waypoints.value]

    const path: Waypoint[] = []
    const steps = 10

    for (let i = 0; i < waypoints.value.length - 1; i++) {
      const start = waypoints.value[i]
      const end = waypoints.value[i + 1]

      if (i === 0) {
        path.push({ ...start })
      }

      for (let j = 1; j <= steps; j++) {
        const t = j / steps
        path.push({
          id: generateId(),
          x: start.x + (end.x - start.x) * t,
          y: start.y + (end.y - start.y) * t,
          altitude: start.altitude + (end.altitude - start.altitude) * t,
          angle: start.angle + (end.angle - start.angle) * t,
          type: 'waypoint' as const,
          name: `过渡点${i}-${j}`,
        })
      }
    }

    return path
  }

  const exportRouteConfig = (name: string): RouteConfig => {
    const flightPath = generateFlightPath()
    return {
      name,
      createdAt: new Date().toISOString(),
      waypoints: waypoints.value,
      flightMode: flightMode.value,
      orbitConfig: orbitConfig.value,
      cameraConfig: cameraConfig.value,
      speed: speed.value,
      totalDistance: flightPath.totalDistance,
      estimatedTime: flightPath.estimatedTime,
    }
  }

  const downloadConfig = (config: RouteConfig) => {
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${config.name}_${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const downloadCSV = (config: RouteConfig) => {
    const headers = ['序号', '名称', 'X坐标', 'Y坐标', '高度(m)', '角度(°)', '类型']
    const rows = config.waypoints.map((wp, i) => [
      i + 1,
      wp.name,
      wp.x.toFixed(2),
      wp.y.toFixed(2),
      wp.altitude.toFixed(1),
      wp.angle.toFixed(1),
      wp.type,
    ])

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${config.name}_航线清单_${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return {
    waypoints,
    selectedWaypoint,
    flightMode,
    flightModes,
    speed,
    isPlanning,
    cameraConfig,
    orbitConfig,
    addWaypoint,
    removeWaypoint,
    updateWaypoint,
    clearWaypoints,
    generateFlightPath,
    exportRouteConfig,
    downloadConfig,
    downloadCSV,
  }
}
