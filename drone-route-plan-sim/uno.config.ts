import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetUno,
} from 'unocss'

export default defineConfig({
  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons({
      scale: 1.2,
    }),
  ],
  shortcuts: {
    'btn': 'px-4 py-2 rounded-lg font-medium transition-all duration-200 cursor-pointer',
    'btn-primary': 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95',
    'btn-secondary': 'bg-gray-200 text-gray-700 hover:bg-gray-300 active:scale-95',
    'btn-danger': 'bg-red-500 text-white hover:bg-red-600 active:scale-95',
    'btn-success': 'bg-green-500 text-white hover:bg-green-600 active:scale-95',
    'card': 'bg-white rounded-xl shadow-lg p-4',
    'input': 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
  },
})
