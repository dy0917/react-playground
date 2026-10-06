import { useEffect, useMemo, useRef, useState } from 'react'
import { Box, Grid, Paper } from '@mui/material'
import EditorPanel from './components/EditorPanel'
import ProductPreview from './components/ProductPreview'
import appSource from './components/Product/App.jsx?raw'
import dataSource from './components/Product/data.js?raw'
import stylesSource from './components/Product/styles.css?raw'
import packageSource from '../package.json?raw'

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

const starterFiles = [
  {
    id: 'app',
    name: 'App.jsx',
    path: 'src/components/Product/App.jsx',
    language: 'jsx',
    folder: 'src',
    content: appSource,
  },
  {
    id: 'data',
    name: 'data.js',
    path: 'src/components/Product/data.js',
    language: 'javascript',
    folder: 'src',
    content: dataSource,
  },
  {
    id: 'styles',
    name: 'styles.css',
    path: 'src/components/Product/styles.css',
    language: 'css',
    folder: 'src',
    content: stylesSource,
  },
  {
    id: 'package',
    name: 'package.json',
    path: 'package.json',
    language: 'json',
    folder: 'root',
    content: packageSource,
  },
]

const initialFiles = starterFiles

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

  const handleRun = async () => {
    try {
      const response = await fetch('/api/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ files }),
      })

      if (!response.ok) {
        throw new Error('Save failed')
      }

      window.location.reload()
    } catch (error) {
      console.error('Run failed:', error)
      alert('Unable to save to the actual project files. Check the dev server.')
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
    <Grid container ref={shellRef} style={{ '--editor-width': `${editorWidth}px` }}>
      <Grid size={8}>
        <EditorPanel
          files={files}
          activeFileId={activeFileId}
          openTabs={openTabs}
          activeFile={activeFile}
          openFile={openFile}
          closeTab={closeTab}
          updateFileContent={updateFileContent}
          setActiveFileId={setActiveFileId}
          onRun={handleRun}
        />
      </Grid>

      <Grid
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
        <Grid sx={{ mb: 1.5, display: 'flex', alignItems: 'center' }}>
          <Grid
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
          </Grid>
        </Grid>

        <Grid
          sx={{
            flex: 1,
            background: '#fff',
            border: '1px solid rgba(148,163,184,0.2)',
            borderRadius: 3,
            overflow: 'hidden',
            boxShadow: '0 12px 30px rgba(15,23,42,0.08)',
          }}
        >
          <Grid component="style">{previewStyles}</Grid>
          <ProductPreview product={previewProduct} />
        </Grid>
      </Paper>
    </Grid>
  )
}

export default App
