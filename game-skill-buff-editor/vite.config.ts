import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import net from 'net'

function getPort(port: number): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = net.createServer()
    server.once('error', (err: any) => {
      if (err.code === 'EADDRINUSE') {
        server.close()
        resolve(getPort(port + 1))
      } else {
        reject(err)
      }
    })
    server.once('listening', () => {
      server.close()
      resolve(port)
    })
    server.listen(port)
  })
}

export default defineConfig(async () => {
  const port = await getPort(5173)
  console.log(`\n🚀 自动检测可用端口: ${port}\n`)
  return {
    plugins: [vue()],
    server: {
      port,
      open: true,
      host: true
    }
  }
})
