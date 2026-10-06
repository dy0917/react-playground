import { writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const fileMap = {
  'product-html': 'productCodeStore/index.html',
  'product-css': 'productCodeStore/styles.css',
  'product-js': 'productCodeStore/app.js',
  app: 'src/components/Product/App.jsx',
  data: 'src/components/Product/data.js',
  styles: 'src/components/Product/styles.css',
  package: 'package.json',
}

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'project-file-writer',
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          if (req.method !== 'POST' || req.url !== '/api/save') {
            return next()
          }

          let body = ''
          req.on('data', (chunk) => {
            body += chunk
          })

          req.on('end', async () => {
            try {
              const { files } = JSON.parse(body || '{}')

              if (!Array.isArray(files)) {
                throw new Error('Invalid files payload')
              }

              await Promise.all(
                files.map(async (file) => {
                  const targetPath = fileMap[file.id]
                  if (!targetPath) return

                  await writeFile(resolve(process.cwd(), targetPath), file.content || '', 'utf8')
                }),
              )

              res.writeHead(200, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify({ ok: true }))
            } catch (error) {
              res.writeHead(500, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify({ ok: false, error: error.message }))
            }
          })
        })
      },
    },
  ],
})
