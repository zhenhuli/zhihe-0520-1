<template>
  <div class="app-container">
    <header class="app-header">
      <h1 class="app-title">矢量字体笔画编辑器</h1>
      <div class="app-info">
        <span v-if="store.currentChar">当前编辑: <strong>{{ store.currentChar }}</strong></span>
        <span class="stroke-count">笔画数: {{ store.strokes.length }}</span>
      </div>
    </header>
    <div class="app-body">
      <Toolbar />
      <main class="main-content">
        <GlyphCanvas ref="canvasRef" />
        <div class="canvas-tips">
          <p v-if="store.currentTool === 'line'">💡 直线工具：点击画布两点绘制直线</p>
          <p v-if="store.currentTool === 'curve'">💡 曲线工具：依次点击三点绘制曲线</p>
          <p>💡 点击已有笔画可选中进行属性调整</p>
        </div>
      </main>
      <PreviewPanel />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useGlyphStore } from './stores/glyph'
import Toolbar from './components/Toolbar.vue'
import GlyphCanvas from './components/GlyphCanvas.vue'
import PreviewPanel from './components/PreviewPanel.vue'

const store = useGlyphStore()
const canvasRef = ref(null)
</script>

<style lang="scss">
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body, #app {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background: #f0f2f5;
  color: #333;
}

.app-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.app-header {
  height: 60px;
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  z-index: 100;
}

.app-title {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.app-info {
  display: flex;
  gap: 24px;
  align-items: center;
  font-size: 14px;
  color: #606266;

  strong {
    color: #409eff;
    font-size: 16px;
  }

  .stroke-count {
    background: #ecf5ff;
    padding: 4px 12px;
    border-radius: 12px;
    color: #409eff;
  }
}

.app-body {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  overflow: auto;
}

.canvas-tips {
  margin-top: 16px;
  text-align: center;

  p {
    font-size: 13px;
    color: #909399;
    margin: 4px 0;

    &:first-child {
      color: #67c23a;
    }
  }
}
</style>
