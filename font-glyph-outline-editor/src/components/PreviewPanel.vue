<template>
  <div class="preview-panel">
    <div class="panel-header">
      <h3 class="panel-title">排版预览</h3>
      <div class="preview-controls">
        <div class="control-group">
          <label>字号</label>
          <input type="range" v-model.number="fontSize" min="20" max="120" />
          <span>{{ fontSize }}px</span>
        </div>
        <div class="control-group">
          <label>字间距</label>
          <input type="range" v-model.number="letterSpacing" min="0" max="50" />
          <span>{{ letterSpacing }}px</span>
        </div>
        <div class="control-group">
          <label>行间距</label>
          <input type="range" v-model.number="lineSpacing" min="10" max="100" />
          <span>{{ lineSpacing }}px</span>
        </div>
      </div>
    </div>

    <div class="preview-area">
      <textarea
        v-model="previewText"
        class="preview-input"
        placeholder="在此输入文字，使用已保存的字形进行预览..."
        :style="{ fontSize: fontSize + 'px', letterSpacing: letterSpacing + 'px', lineHeight: (fontSize + lineSpacing) + 'px' }"
      ></textarea>
      
      <div class="glyph-preview-container">
        <div
          class="preview-text"
          :style="{ fontSize: fontSize + 'px', letterSpacing: letterSpacing + 'px', lineHeight: (fontSize + lineSpacing) + 'px' }"
        >
          <span
            v-for="(char, index) in previewText.split('')"
            :key="index"
            class="preview-char"
          >
            <svg
              v-if="store.glyphs[char]"
              :viewBox="`0 0 ${store.glyphs[char].canvasSize.width} ${store.glyphs[char].canvasSize.height}`"
              :width="fontSize"
              :height="fontSize"
              class="glyph-svg"
            >
              <path
                v-for="stroke in store.glyphs[char].strokes"
                :key="stroke.id"
                :d="getPathD(stroke)"
                fill="none"
                stroke="#333"
                :stroke-width="stroke.width * (fontSize / store.glyphs[char].canvasSize.width)"
                :stroke-linecap="stroke.cornerRadius > 0 ? 'round' : 'square'"
                :stroke-linejoin="stroke.cornerRadius > 0 ? 'round' : 'miter'"
              />
            </svg>
            <span v-else class="missing-char">{{ char }}</span>
          </span>
        </div>
      </div>
    </div>

    <div class="export-section">
      <h3 class="section-title">导出字形</h3>
      <div class="export-buttons">
        <button
          class="export-btn single-btn"
          @click="exportSingle"
          :disabled="!store.currentChar"
        >
          导出当前字形
        </button>
        <button
          class="export-btn batch-btn"
          @click="exportAll"
          :disabled="Object.keys(store.glyphs).length === 0"
        >
          批量导出全部
        </button>
      </div>
      <div class="export-info">
        已保存 <strong>{{ Object.keys(store.glyphs).length }}</strong> 个字形
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useGlyphStore } from '../stores/glyph'

const store = useGlyphStore()
const previewText = ref('你好世界')
const fontSize = ref(48)
const letterSpacing = ref(10)
const lineSpacing = ref(20)

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
    const last = points[points.length - 1]
    d += ` Q ${last.x} ${last.y} ${last.x} ${last.y}`
    return d
  }
  return ''
}

function exportSingle() {
  if (!store.currentChar) return
  const data = store.exportGlyph(store.currentChar)
  if (data) {
    downloadFile(`glyph_${store.currentChar}.json`, data)
  }
}

function exportAll() {
  const allGlyphs = store.exportAllGlyphs()
  if (allGlyphs.length === 0) return

  allGlyphs.forEach(item => {
    downloadFile(`glyph_${item.char}.json`, item.data)
  })
}

function downloadFile(filename, content) {
  const blob = new Blob([content], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
</script>

<style scoped lang="scss">
.preview-panel {
  width: 350px;
  background: #fff;
  border-left: 1px solid #e4e7ed;
  display: flex;
  flex-direction: column;
  height: 100%;
  box-sizing: border-box;
}

.panel-header {
  padding: 20px;
  border-bottom: 1px solid #ebeef5;
}

.panel-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 16px 0;
}

.preview-controls {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.control-group {
  display: flex;
  align-items: center;
  gap: 8px;

  label {
    font-size: 12px;
    color: #606266;
    width: 50px;
    flex-shrink: 0;
  }

  input[type="range"] {
    flex: 1;
    height: 4px;
    -webkit-appearance: none;
    background: #e4e7ed;
    border-radius: 2px;
    outline: none;

    &::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 14px;
      height: 14px;
      background: #409eff;
      border-radius: 50%;
      cursor: pointer;
    }
  }

  span {
    font-size: 12px;
    color: #909399;
    width: 40px;
    text-align: right;
  }
}

.preview-area {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.preview-input {
  width: 100%;
  min-height: 80px;
  padding: 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 14px;
  resize: vertical;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.2s;

  &:focus {
    border-color: #409eff;
  }
}

.glyph-preview-container {
  background: #fafafa;
  border: 1px dashed #dcdfe6;
  border-radius: 4px;
  padding: 20px;
  min-height: 120px;
}

.preview-text {
  word-break: break-all;
}

.preview-char {
  display: inline-block;
  vertical-align: middle;
}

.glyph-svg {
  display: block;
}

.missing-char {
  color: #f56c6c;
  border-bottom: 1px dashed #f56c6c;
}

.export-section {
  padding: 20px;
  border-top: 1px solid #ebeef5;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 12px 0;
}

.export-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.export-btn {
  padding: 10px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &.single-btn {
    background: #67c23a;
    color: #fff;

    &:hover:not(:disabled) {
      background: #85ce61;
    }
  }

  &.batch-btn {
    background: #409eff;
    color: #fff;

    &:hover:not(:disabled) {
      background: #66b1ff;
    }
  }
}

.export-info {
  font-size: 12px;
  color: #909399;
  text-align: center;

  strong {
    color: #409eff;
    font-size: 14px;
  }
}
</style>
