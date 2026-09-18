import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const assetsFilePath = path.resolve(__dirname, 'src/data/assets.json')

// Plugin de dev que expõe /api/assets para ler e persistir o assets.json direto no disco.
function assetsApiPlugin() {
  return {
    name: 'assets-api',
    configureServer(server) {
      server.middlewares.use('/api/assets', (req, res) => {
        if (req.method === 'GET') {
          const data = fs.readFileSync(assetsFilePath, 'utf-8')
          res.setHeader('Content-Type', 'application/json')
          res.end(data)
          return
        }

        if (req.method === 'POST') {
          let body = ''
          req.on('data', (chunk) => {
            body += chunk
          })
          req.on('end', () => {
            try {
              const parsed = JSON.parse(body)
              fs.writeFileSync(assetsFilePath, JSON.stringify(parsed, null, 2), 'utf-8')
              res.statusCode = 200
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ ok: true }))
            } catch (err) {
              res.statusCode = 400
              res.end(JSON.stringify({ ok: false, error: err.message }))
            }
          })
          return
        }

        res.statusCode = 405
        res.end('Method not allowed')
      })
    },
  }
}

export default defineConfig({
  plugins: [vue(), assetsApiPlugin()],
})
