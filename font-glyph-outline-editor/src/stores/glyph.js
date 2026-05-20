import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useGlyphStore = defineStore('glyph', () => {
  const canvasSize = ref({ width: 500, height: 500 })
  const strokes = ref([])
  const currentStroke = ref(null)
  const selectedStrokeId = ref(null)
  const currentTool = ref('line')
  const strokeWidth = ref(8)
  const cornerRadius = ref(0)
  const glyphs = ref({})
  const currentChar = ref('')

  const selectedStroke = computed(() => {
    return strokes.value.find(s => s.id === selectedStrokeId.value)
  })

  function setCanvasSize(width, height) {
    canvasSize.value = { width, height }
  }

  function setTool(tool) {
    currentTool.value = tool
  }

  function setStrokeWidth(width) {
    strokeWidth.value = width
    if (selectedStrokeId.value) {
      const stroke = strokes.value.find(s => s.id === selectedStrokeId.value)
      if (stroke) {
        stroke.width = width
      }
    }
  }

  function setCornerRadius(radius) {
    cornerRadius.value = radius
    if (selectedStrokeId.value) {
      const stroke = strokes.value.find(s => s.id === selectedStrokeId.value)
      if (stroke) {
        stroke.cornerRadius = radius
      }
    }
  }

  function startStroke(points) {
    const id = Date.now()
    currentStroke.value = {
      id,
      type: currentTool.value,
      points: [...points],
      width: strokeWidth.value,
      cornerRadius: cornerRadius.value
    }
    strokes.value.push(currentStroke.value)
    selectedStrokeId.value = id
  }

  function updateStrokePoints(points) {
    if (currentStroke.value) {
      currentStroke.value.points = [...points]
    }
  }

  function finishStroke() {
    currentStroke.value = null
  }

  function selectStroke(id) {
    selectedStrokeId.value = id
    const stroke = strokes.value.find(s => s.id === id)
    if (stroke) {
      strokeWidth.value = stroke.width
      cornerRadius.value = stroke.cornerRadius
    }
  }

  function deleteSelectedStroke() {
    if (selectedStrokeId.value) {
      strokes.value = strokes.value.filter(s => s.id !== selectedStrokeId.value)
      selectedStrokeId.value = null
    }
  }

  function clearCanvas() {
    strokes.value = []
    selectedStrokeId.value = null
    currentStroke.value = null
  }

  function saveGlyph(char) {
    if (char && strokes.value.length > 0) {
      glyphs.value[char] = {
        char,
        strokes: JSON.parse(JSON.stringify(strokes.value)),
        canvasSize: { ...canvasSize.value },
        timestamp: Date.now()
      }
    }
  }

  function loadGlyph(char) {
    if (glyphs.value[char]) {
      const glyph = glyphs.value[char]
      strokes.value = JSON.parse(JSON.stringify(glyph.strokes))
      canvasSize.value = { ...glyph.canvasSize }
      currentChar.value = char
      selectedStrokeId.value = null
    }
  }

  function deleteGlyph(char) {
    if (glyphs.value[char]) {
      delete glyphs.value[char]
      if (currentChar.value === char) {
        clearCanvas()
        currentChar.value = ''
      }
    }
  }

  function exportGlyph(char) {
    if (glyphs.value[char]) {
      return JSON.stringify(glyphs.value[char], null, 2)
    }
    return null
  }

  function exportAllGlyphs() {
    return Object.entries(glyphs.value).map(([char, data]) => ({
      char,
      data: JSON.stringify(data, null, 2)
    }))
  }

  return {
    canvasSize,
    strokes,
    currentStroke,
    selectedStrokeId,
    currentTool,
    strokeWidth,
    cornerRadius,
    glyphs,
    currentChar,
    selectedStroke,
    setCanvasSize,
    setTool,
    setStrokeWidth,
    setCornerRadius,
    startStroke,
    updateStrokePoints,
    finishStroke,
    selectStroke,
    deleteSelectedStroke,
    clearCanvas,
    saveGlyph,
    loadGlyph,
    deleteGlyph,
    exportGlyph,
    exportAllGlyphs
  }
})
