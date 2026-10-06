import { useEffect, useMemo, useRef, useState } from 'react'
import { Box, Divider, Paper } from '@mui/material'
import EditorPanel from './components/EditorPanel'
import ProductPreview from './components/ProductPreview'

const defaultProduct = {
  brand: 'Northstar',
  title: 'Build beautiful product experiences',
  subtitle:
    'Launch polished features faster with a simple design system your team can actually ship.',
  cta: 'Start free trial',
  accent: '#7c3aed',
  stats: [
    { label: 'Projects shipped', value: '1.2k' },
    { label: 'Avg. engagement', value: '94%' },
    { label: 'Team velocity', value: '3.5x' },
  ],
}

const initialFiles = [
  {
    id: 'app',
    name: 'App.jsx',
    path: 'src/App.jsx',
    language: 'jsx',
    folder: 'src',
    content: `import { useMemo, useState } from 'react'
import ProductPreview from './components/ProductPreview'

const defaultProduct = {
  brand: 'Northstar',
  title: 'Build beautiful product experiences',
  subtitle: 'Launch polished features faster with a simple design system your team can actually ship.',
  cta: 'Start free trial',
  accent: '#7c3aed',
  stats: [
    { label: 'Projects shipped', value: '1.2k' },
    { label: 'Avg. engagement', value: '94%' },
    { label: 'Team velocity', value: '3.5x' }
  ]
}

function App() {
  const [product, setProduct] = useState(defaultProduct)

  return (
    <div className="workspace-shell">
      <ProductPreview product={product} />
    </div>
  )
}

export default App`,
  },
  {
    id: 'data',
    name: 'data.js',
    path: 'src/data.js',
    language: 'javascript',
    folder: 'src',
    content: `const product = {
  brand: 'Northstar',
  title: 'Build beautiful product experiences',
  subtitle: 'Launch polished features faster with a simple design system your team can actually ship.',
  cta: 'Start free trial',
  accent: '#7c3aed',
  stats: [
    { label: 'Projects shipped', value: '1.2k' },
    { label: 'Avg. engagement', value: '94%' },
    { label: 'Team velocity', value: '3.5x' }
  ]
}

export default product`,
  },
  {
    id: 'styles',
    name: 'styles.css',
    path: 'src/styles.css',
    language: 'css',
    folder: 'src',
    content: `.workspace-shell {
  display: grid;
  place-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #f4f1ff 0%, #eef7ff 100%);
}

.product-window {
  width: min(1080px, 90vw);
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 28px;
  box-shadow: 0 18px 50px rgba(15, 23, 42, 0.12);
}

.hero-section {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
}
`,
  },
  {
    id: 'package',
    name: 'package.json',
    path: 'package.json',
    language: 'json',
    folder: 'root',
    content: `{
  "name": "react-playground",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}`,
  },
]

const parseProductData = (source) => {
  const trimmed = source.trim()

  if (!trimmed) {
    return null
  }

  const cleaned = trimmed
    .replace(/^export\s+default\s+/, '')
    .replace(/^const\s+product\s*=\s*/, '')
    .replace(/;\s*$/, '')

  try {
    const result = Function(`"use strict"; return (${cleaned});`)()
    if (result && typeof result === 'object') {
      return {
        brand: result.brand || defaultProduct.brand,
        title: result.title || defaultProduct.title,
        subtitle: result.subtitle || defaultProduct.subtitle,
        cta: result.cta || defaultProduct.cta,
        accent: result.accent || defaultProduct.accent,
        stats:
          Array.isArray(result.stats) && result.stats.length
            ? result.stats.map((stat) => ({
                label: stat.label || 'Metric',
                value: stat.value || '0',
              }))
            : defaultProduct.stats,
      }
    }
  } catch (error) {
    console.warn('Preview parse failed:', error.message)
  }

  return null
}

function App() {
  const [files, setFiles] = useState(initialFiles)
  const [activeFileId, setActiveFileId] = useState('data')
  const [openTabs, setOpenTabs] = useState(['data', 'app', 'styles'])
  const [editorWidth, setEditorWidth] = useState(820)
  const shellRef = useRef(null)
  const draggingRef = useRef(false)

  const activeFile = files.find((file) => file.id === activeFileId) || files[0]

  const previewProduct = useMemo(() => {
    const dataFile = files.find((file) => file.id === 'data')
    if (!dataFile) return defaultProduct

    return parseProductData(dataFile.content) || defaultProduct
  }, [files])

  const previewStyles = useMemo(() => {
    const styleFile = files.find((file) => file.id === 'styles')
    return styleFile ? styleFile.content : ''
  }, [files])

  const updateFileContent = (fileId, value) => {
    setFiles((currentFiles) =>
      currentFiles.map((file) =>
        file.id === fileId ? { ...file, content: value } : file,
      ),
    )
  }

  const openFile = (fileId) => {
    if (!openTabs.includes(fileId)) {
      setOpenTabs((currentTabs) => [...currentTabs, fileId])
    }
    setActiveFileId(fileId)
  }

  const closeTab = (fileId) => {
    setOpenTabs((currentTabs) => currentTabs.filter((tabId) => tabId !== fileId))

    if (activeFileId === fileId) {
      const remaining = openTabs.filter((tabId) => tabId !== fileId)
      setActiveFileId(remaining[0] || files[0].id)
    }
  }

  useEffect(() => {
    const handlePointerMove = (event) => {
      if (!draggingRef.current || !shellRef.current) return

      const rect = shellRef.current.getBoundingClientRect()
      const leftOffset = 220
      const minEditorWidth = 520
      const maxEditorWidth = rect.width - leftOffset - 340
      const nextWidth = Math.min(
        Math.max(event.clientX - rect.left - leftOffset, minEditorWidth),
        maxEditorWidth,
      )

      setEditorWidth(nextWidth)
    }

    const handlePointerUp = () => {
      draggingRef.current = false
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)

    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
    }
  }, [])

  return (
    <Box
      ref={shellRef}
      sx={{
        display: 'grid',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        background: '#0b1020',
      }}
      style={{ '--editor-width': `${editorWidth}px` }}
    >
      <EditorPanel
        files={files}
        activeFileId={activeFileId}
        openTabs={openTabs}
        activeFile={activeFile}
        openFile={openFile}
        closeTab={closeTab}
        updateFileContent={updateFileContent}
        setActiveFileId={setActiveFileId}
      />

      <Box
        sx={{
          width: 12,
          background: 'rgba(148,163,184,0.12)',
          borderLeft: '1px solid rgba(148,163,184,0.12)',
          borderRight: '1px solid rgba(148,163,184,0.12)',
          cursor: 'col-resize',
          userSelect: 'none',
        }}
        onPointerDown={() => {
          draggingRef.current = true
        }}
        aria-label="Resize editor and preview panes"
        role="separator"
      />

      <Paper
        elevation={0}
        sx={{
          background: '#f8fafc',
          borderRadius: 0,
          borderLeft: '1px solid rgba(148,163,184,0.2)',
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 280,
        }}
      >
        <Box sx={{ mb: 1.5, display: 'flex', alignItems: 'center' }}>
          <Box
            component="span"
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              borderRadius: 999,
              background: 'rgba(167, 139, 250, 0.14)',
              color: '#7c3aed',
              px: 1.2,
              py: 0.5,
              fontSize: 11,
              letterSpacing: 0.8,
              fontWeight: 700,
              textTransform: 'uppercase',
            }}
          >
            Live preview
          </Box>
        </Box>

        <Box
          sx={{
            flex: 1,
            background: '#fff',
            border: '1px solid rgba(148,163,184,0.2)',
            borderRadius: 3,
            overflow: 'hidden',
            boxShadow: '0 12px 30px rgba(15,23,42,0.08)',
          }}
        >
          <Box component="style">{previewStyles}</Box>
          <ProductPreview product={previewProduct} />
        </Box>
      </Paper>
    </Box>
  )
}

export default App
