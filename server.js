import { readFile, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const fileMap = {
  'product-html': 'productCodeStore/index.html',
  'product-css': 'productCodeStore/styles.css',
  'product-js': 'productCodeStore/app.js',
  app: 'src/components/Product/App.jsx',
  data: 'src/components/Product/data.js',
  styles: 'src/components/Product/styles.css',
  package: 'package.json',
}

export async function saveFiles(files) {
  await Promise.all(
    files.map(async (file) => {
      const targetPath = fileMap[file.id]
      if (!targetPath) return
      const absPath = resolve(__dirname, targetPath)
      await writeFile(absPath, file.content, 'utf8')
    }),
  )
}

export async function createServer() {
  const { createServer: createHttpServer } = await import('node:http')

  return createHttpServer(async (req, res) => {
    if (req.method === 'POST' && req.url === '/api/save') {
      let body = ''
      req.on('data', (chunk) => {
        body += chunk
      })

      req.on('end', async () => {
        try {
          const { files } = JSON.parse(body || '{}')
          if (!Array.isArray(files)) {
            throw new Error('Files payload missing')
          }

          await saveFiles(files)

          res.writeHead(200, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ ok: true }))
        } catch (error) {
          res.writeHead(500, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ ok: false, error: error.message }))
        }
      })

      return
    }

    res.writeHead(404)
    res.end('Not found')
  })
}

const server = await createServer()
server.listen(4173, () => {
  console.log('Project save server running on http://localhost:4173')
})
