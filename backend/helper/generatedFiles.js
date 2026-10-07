import { Buffer } from 'node:buffer'

const maxGeneratedBytes = 512 * 1024
const requiredFiles = [
  { path: 'index.html', fileType: 'html', legacyKey: 'html' },
  { path: 'styles.css', fileType: 'css', legacyKey: 'css' },
  { path: 'app.js', fileType: 'javascript', legacyKey: 'js' },
]

export function normalizeGeneratedFiles(response) {
  let files
  if (Array.isArray(response?.files)) {
    files = response.files
  } else if (response && typeof response === 'object' && !Array.isArray(response)) {
    files = requiredFiles.map(({ path, fileType, legacyKey }) => ({
      path,
      fileType,
      content: response[legacyKey],
    }))
  }

  if (!files || files.length !== requiredFiles.length) {
    throw new Error('The response must contain exactly index.html, styles.css, and app.js.')
  }

  const filesByPath = new Map()
  for (const file of files) {
    if (
      !file ||
      typeof file !== 'object' ||
      typeof file.path !== 'string' ||
      typeof file.fileType !== 'string' ||
      typeof file.content !== 'string'
    ) {
      throw new Error('Each generated file must include string content, path, and fileType properties.')
    }
    if (filesByPath.has(file.path)) {
      throw new Error(`The response contains a duplicate file path: ${file.path}`)
    }
    filesByPath.set(file.path, file)
  }

  const normalizedFiles = requiredFiles.map(({ path, fileType }) => {
    const file = filesByPath.get(path)
    if (!file || file.fileType !== fileType) {
      throw new Error(`The response must include ${path} with fileType "${fileType}".`)
    }
    return { content: file.content, path, fileType }
  })
  const generatedBytes = normalizedFiles.reduce(
    (total, file) => total + Buffer.byteLength(file.content),
    0,
  )
  if (generatedBytes > maxGeneratedBytes) {
    throw new Error('The generated page is too large. Please use a shorter requirement.')
  }

  return normalizedFiles
}
