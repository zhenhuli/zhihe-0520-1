<template>
  <div
    class="border-2 border-dashed border-gray-600 rounded-xl p-8 text-center transition-all hover:border-blue-500 hover:bg-blue-500/5"
    :class="{ 'border-blue-500 bg-blue-500/10': isDragging }"
    @dragover.prevent="isDragging = true"
    @dragleave="isDragging = false"
    @drop.prevent="handleDrop"
  >
    <input
      ref="fileInput"
      type="file"
      accept="audio/*"
      multiple
      class="hidden"
      @change="handleFileSelect"
    />
    
    <div class="flex flex-col items-center gap-4">
      <div class="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center">
        <span class="text-3xl">📁</span>
      </div>
      <div>
        <p class="text-lg font-medium text-gray-300">拖拽音频文件到此处</p>
        <p class="text-sm text-gray-500 mt-1">或</p>
        <button
          @click="browseFiles"
          class="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
        >
          选择文件
        </button>
      </div>
      <p class="text-xs text-gray-500">支持 MP3, WAV, OGG, FLAC 等常见音频格式</p>
    </div>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  add: [files: File[]]
}>()

const isDragging = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

function browseFiles() {
  fileInput.value?.click()
}

function handleFileSelect(e: Event) {
  const target = e.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    emit('add', Array.from(target.files))
    target.value = ''
  }
}

function handleDrop(e: DragEvent) {
  isDragging.value = false
  const files = e.dataTransfer?.files
  if (files && files.length > 0) {
    const audioFiles = Array.from(files).filter(f => f.type.startsWith('audio/'))
    if (audioFiles.length > 0) {
      emit('add', audioFiles)
    }
  }
}
</script>
