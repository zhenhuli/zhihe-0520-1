<template>
  <div class="glyph-canvas-container">
    <svg
      ref="svgRef"
      :width="store.canvasSize.width"
      :height="store.canvasSize.height"
      class="glyph-canvas"
      @mousedown="handleMouseDown"
      @mousemove="handleMouseMove"
      @mouseup="handleMouseUp"
      @mouseleave="handleMouseUp"
    >
      <defs>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.2" />
        </filter>
      </defs>

      <rect
        :width="store.canvasSize.width"
        :height="store.canvasSize.height"
        fill="#fafafa"
        stroke="#ddd"
        stroke-width="1"
      />

      <line
        :x1="store.canvasSize.width / 2"
        y1="0"
        :x2="store.canvasSize.width / 2"
        :y2="store.canvasSize.height"
        stroke="#e0e0e0"
        stroke-width="1"
        stroke-dasharray="5,5"
      />
      <line
        x1="0"
        :y1="store.canvasSize.height / 2"
        :x2="store.canvasSize.width"
        :y2="store.canvasSize.height / 2"
        stroke="#e0e0e0"
        stroke-width="1"
        stroke-dasharray="5,5"
      />

      <path
        v-for="stroke in store.strokes"
        :key="stroke.id"
        :d="getPathD(stroke)"
        :fill="stroke.fill || 'none'"
        :stroke="stroke.id === store.selectedStrokeId ? '#409eff' : '#333'"
        :stroke-width="stroke.width"
        :stroke-linecap="stroke.cornerRadius > 0 ? 'round' : 'square'"
        :stroke-linejoin="stroke.cornerRadius > 0 ? 'round' : 'miter'"
        :stroke-miterlimit="10"
        class="stroke-path"
        :class="{ selected: stroke.id === store.selectedStrokeId }"
        @click.stop="handleStrokeClick(stroke.id)"
      />

      <g v-if="drawingPoints.length > 0">
        <circle
          v-for="(point, index) in drawingPoints"
          :key="index"
          :cx="point.x"
          :cy="point.y"
          r="5"
          :fill="index === 0 ? '#67c23a' : '#409eff'"
          stroke="#fff"
          stroke-width="2"
        />
        <path
          v-if="drawingPoints.length >= 2"
          :d="getTempPathD()"
          fill="none"
          stroke="#409eff"
          :stroke-width="store.strokeWidth"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-dasharray="5,5"
          opacity="0.6"
        />
      </g>
    </svg>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useGlyphStore } from '../stores/glyph'

const store = useGlyphStore()
const svgRef = ref(null)
const drawingPoints = ref([])
const isDrawing = ref(false)

function getMousePosition(e) {
  const svg = svgRef.value
  const rect = svg.getBoundingClientRect()
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  }
}

function getPathD(stroke) {
  const points = stroke.points
  if (points.length < 2) return ''

  if (stroke.type === 'line') {
    let d = `M ${points[0].x} ${points[0].y}`
    for (let i = 1; i < points.length; i++) {
      d += ` L ${points[i].x} ${points[i].y}`
    }
    return d
  } else if (stroke.type === 'curve') {
    if (points.length < 3) {
      return `M ${points[0].x} ${points[0].y} L ${points[1]?.x || 0} ${points[1]?.y || 0}`
    }
    let d = `M ${points[0].x} ${points[0].y}`
    for (let i = 1; i < points.length - 1; i++) {
      const xc = (points[i].x + points[i + 1].x) / 2
      const yc = (points[i].y + points[i + 1].y) / 2
      d += ` Q ${points[i].x} ${points[i].y} ${xc} ${yc}`
    }
    if (points.length >= 2) {
      const last = points[points.length - 1]
      d += ` Q ${last.x} ${last.y} ${last.x} ${last.y}`
    }
    return d
  }
  return ''
}

function getTempPathD() {
  const points = drawingPoints.value
  if (points.length < 2) return ''

  if (store.currentTool === 'line') {
    let d = `M ${points[0].x} ${points[0].y}`
    for (let i = 1; i < points.length; i++) {
      d += ` L ${points[i].x} ${points[i].y}`
    }
    return d
  } else if (store.currentTool === 'curve') {
    if (points.length < 3) {
      return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`
    }
    let d = `M ${points[0].x} ${points[0].y}`
    for (let i = 1; i < points.length - 1; i++) {
      const xc = (points[i].x + points[i + 1].x) / 2
      const yc = (points[i].y + points[i + 1].y) / 2
      d += ` Q ${points[i].x} ${points[i].y} ${xc} ${yc}`
    }
    const last = points[points.length - 1]
    d += ` Q ${last.x} ${last.y} ${last.x} ${last.y}`
    return d
  }
  return ''
}

function handleMouseDown(e) {
  if (e.button !== 0) return
  const pos = getMousePosition(e)
  isDrawing.value = true

  if (drawingPoints.value.length === 0) {
    drawingPoints.value = [pos]
  } else {
    drawingPoints.value.push(pos)
  }

  if (store.currentTool === 'line' && drawingPoints.value.length >= 2) {
    store.startStroke(drawingPoints.value)
    drawingPoints.value = []
    isDrawing.value = false
  }
}

function handleMouseMove(e) {
  if (!isDrawing.value) return
}

function handleMouseUp(e) {
  if (!isDrawing.value) return

  if (store.currentTool === 'curve' && drawingPoints.value.length >= 3) {
    store.startStroke(drawingPoints.value)
    drawingPoints.value = []
    isDrawing.value = false
  } else if (store.currentTool === 'line') {
    isDrawing.value = false
  }
}

function handleStrokeClick(id) {
  store.selectStroke(id)
}

function finishCurrentDrawing() {
  if (drawingPoints.value.length >= 2) {
    store.startStroke(drawingPoints.value)
  }
  drawingPoints.value = []
  isDrawing.value = false
}

defineExpose({ finishCurrentDrawing })
</script>

<style scoped lang="scss">
.glyph-canvas-container {
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f5f5f5;
  padding: 20px;
  border-radius: 8px;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
}

.glyph-canvas {
  cursor: crosshair;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

  &:hover {
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
  }
}

.stroke-path {
  cursor: pointer;
  transition: stroke 0.2s;

  &:hover {
    stroke: #66b1ff;
  }

  &.selected {
    filter: drop-shadow(0 0 4px rgba(64, 158, 255, 0.5));
  }
}
</style>
