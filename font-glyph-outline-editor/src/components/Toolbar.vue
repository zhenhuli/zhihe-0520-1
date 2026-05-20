<template>
  <div class="toolbar">
    <div class="toolbar-section">
      <h3 class="section-title">绘制工具</h3>
      <div class="tool-buttons">
        <button
          class="tool-btn"
          :class="{ active: store.currentTool === 'line' }"
          @click="store.setTool('line')"
        >
          <span class="tool-icon">━</span>
          <span>直线</span>
        </button>
        <button
          class="tool-btn"
          :class="{ active: store.currentTool === 'curve' }"
          @click="store.setTool('curve')"
        >
          <span class="tool-icon">⟒</span>
          <span>曲线</span>
        </button>
      </div>
    </div>

    <div class="toolbar-section">
      <h3 class="section-title">字框尺寸</h3>
      <div class="size-inputs">
        <div class="input-group">
          <label>宽度</label>
          <input
            type="number"
            v-model.number="canvasWidth"
            min="100"
            max="1000"
            @change="updateCanvasSize"
          />
        </div>
        <div class="input-group">
          <label>高度</label>
          <input
            type="number"
            v-model.number="canvasHeight"
            min="100"
            max="1000"
            @change="updateCanvasSize"
          />
        </div>
      </div>
      <div class="preset-sizes">
        <button @click="setPresetSize(300, 300)">300</button>
        <button @click="setPresetSize(500, 500)">500</button>
        <button @click="setPresetSize(700, 700)">700</button>
      </div>
    </div>

    <div class="toolbar-section">
      <h3 class="section-title">笔画属性</h3>
      <div class="property-group">
        <label>笔画粗细: {{ store.strokeWidth }}px</label>
        <input
          type="range"
          v-model.number="store.strokeWidth"
          min="1"
          max="50"
        />
      </div>
      <div class="property-group">
        <label>转折弧度: {{ store.cornerRadius }}px</label>
        <input
          type="range"
          v-model.number="store.cornerRadius"
          min="0"
          max="30"
        />
      </div>
    </div>

    <div class="toolbar-section">
      <h3 class="section-title">编辑操作</h3>
      <div class="action-buttons">
        <button class="action-btn delete-btn" @click="handleDeleteStroke" :disabled="!store.selectedStrokeId">
          删除选中笔画
        </button>
        <button class="action-btn clear-btn" @click="store.clearCanvas">
          清空画布
        </button>
      </div>
    </div>

    <div class="toolbar-section">
      <h3 class="section-title">字形管理</h3>
      <div class="glyph-input">
        <input
          type="text"
          v-model="currentChar"
          maxlength="1"
          placeholder="输入汉字"
          class="char-input"
        />
      </div>
      <div class="glyph-actions">
        <button class="action-btn save-btn" @click="handleSaveGlyph" :disabled="!currentChar">
          保存字形
        </button>
      </div>
    </div>

    <div class="toolbar-section">
      <h3 class="section-title">已保存字形</h3>
      <div class="glyph-list">
        <div
          v-for="glyph in Object.keys(store.glyphs)"
          :key="glyph"
          class="glyph-item"
          :class="{ active: store.currentChar === glyph }"
        >
          <span class="glyph-char" @click="handleLoadGlyph(glyph)">{{ glyph }}</span>
          <button class="glyph-delete" @click="handleDeleteGlyph(glyph)">×</button>
        </div>
        <div v-if="Object.keys(store.glyphs).length === 0" class="empty-hint">
          暂无保存的字形
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useGlyphStore } from '../stores/glyph'

const store = useGlyphStore()
const canvasWidth = ref(store.canvasSize.width)
const canvasHeight = ref(store.canvasSize.height)
const currentChar = ref('')

watch(() => store.canvasSize, (size) => {
  canvasWidth.value = size.width
  canvasHeight.value = size.height
}, { deep: true })

watch(() => store.strokeWidth, (newWidth) => {
  store.setStrokeWidth(newWidth)
})

watch(() => store.cornerRadius, (newRadius) => {
  store.setCornerRadius(newRadius)
})

function updateCanvasSize() {
  store.setCanvasSize(
    Math.max(100, Math.min(1000, canvasWidth.value)),
    Math.max(100, Math.min(1000, canvasHeight.value))
  )
}

function setPresetSize(width, height) {
  canvasWidth.value = width
  canvasHeight.value = height
  updateCanvasSize()
}

function handleDeleteStroke() {
  store.deleteSelectedStroke()
}

function handleSaveGlyph() {
  if (currentChar.value) {
    store.saveGlyph(currentChar.value)
  }
}

function handleLoadGlyph(char) {
  store.loadGlyph(char)
  currentChar.value = char
}

function handleDeleteGlyph(char) {
  if (confirm(`确定要删除字形 "${char}" 吗？`)) {
    store.deleteGlyph(char)
  }
}
</script>

<style scoped lang="scss">
.toolbar {
  width: 280px;
  background: #fff;
  border-right: 1px solid #e4e7ed;
  padding: 20px;
  overflow-y: auto;
  height: 100%;
  box-sizing: border-box;
}

.toolbar-section {
  margin-bottom: 24px;

  &:last-child {
    margin-bottom: 0;
  }
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 12px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid #ebeef5;
}

.tool-buttons {
  display: flex;
  gap: 8px;
}

.tool-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 12px 8px;
  border: 1px solid #dcdfe6;
  background: #fff;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 12px;
  color: #606266;

  &:hover {
    border-color: #409eff;
    color: #409eff;
  }

  &.active {
    background: #409eff;
    border-color: #409eff;
    color: #fff;
  }
}

.tool-icon {
  font-size: 20px;
}

.size-inputs {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.input-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;

  label {
    font-size: 12px;
    color: #606266;
  }

  input {
    padding: 6px 10px;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    font-size: 14px;
    outline: none;
    transition: border-color 0.2s;

    &:focus {
      border-color: #409eff;
    }
  }
}

.preset-sizes {
  display: flex;
  gap: 8px;

  button {
    flex: 1;
    padding: 6px;
    border: 1px solid #dcdfe6;
    background: #f5f7fa;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
    color: #606266;
    transition: all 0.2s;

    &:hover {
      background: #409eff;
      color: #fff;
      border-color: #409eff;
    }
  }
}

.property-group {
  margin-bottom: 16px;

  label {
    display: block;
    font-size: 12px;
    color: #606266;
    margin-bottom: 8px;
  }

  input[type="range"] {
    width: 100%;
    height: 4px;
    -webkit-appearance: none;
    background: #e4e7ed;
    border-radius: 2px;
    outline: none;

    &::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 16px;
      height: 16px;
      background: #409eff;
      border-radius: 50%;
      cursor: pointer;
      transition: transform 0.2s;

      &:hover {
        transform: scale(1.1);
      }
    }
  }
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.action-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &.delete-btn {
    background: #fef0f0;
    color: #f56c6c;
    border: 1px solid #fbc4c4;

    &:hover:not(:disabled) {
      background: #f56c6c;
      color: #fff;
    }
  }

  &.clear-btn {
    background: #fdf6ec;
    color: #e6a23c;
    border: 1px solid #f5dab1;

    &:hover {
      background: #e6a23c;
      color: #fff;
    }
  }

  &.save-btn {
    background: #409eff;
    color: #fff;
    width: 100%;

    &:hover:not(:disabled) {
      background: #66b1ff;
    }
  }
}

.glyph-input {
  margin-bottom: 12px;

  .char-input {
    width: 100%;
    padding: 10px;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    font-size: 24px;
    text-align: center;
    outline: none;
    transition: border-color 0.2s;

    &:focus {
      border-color: #409eff;
    }
  }
}

.glyph-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  max-height: 150px;
  overflow-y: auto;
}

.glyph-item {
  display: flex;
  align-items: center;
  background: #f5f7fa;
  border-radius: 4px;
  padding: 4px 4px 4px 8px;
  border: 1px solid transparent;

  &.active {
    background: #ecf5ff;
    border-color: #409eff;
  }
}

.glyph-char {
  font-size: 20px;
  cursor: pointer;
  padding: 4px;

  &:hover {
    color: #409eff;
  }
}

.glyph-delete {
  border: none;
  background: transparent;
  color: #909399;
  cursor: pointer;
  font-size: 16px;
  padding: 0 4px;

  &:hover {
    color: #f56c6c;
  }
}

.empty-hint {
  font-size: 12px;
  color: #c0c4cc;
  text-align: center;
  width: 100%;
  padding: 12px;
}
</style>
