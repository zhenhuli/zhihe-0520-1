import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import net from 'net'

function getAvailablePort(startPort) {
  return new Promise((resolve, reject) => {
    const server = net.createServer()
    server.listen(startPort, () => {
      server.close(() => resolve(startPort))
    })
    server.on('error', () => {
      getAvailablePort(startPort + 1).then(resolve).catch(reject)
    })
  })
}

export default defineConfig(async () => {
  const port = await getAvailablePort(5173)
  return {
    plugins: [vue()],
    server: {
      port: port,
      strictPort: false,
      open: true
    }
  }
})
