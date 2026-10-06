import { useEffect, useRef, useState } from 'react'
import { Grid, Paper } from '@mui/material'
import EditorPanel from './components/EditorPanel'
import ProductPreview from './components/ProductPreview'
import htmlSource from '../productCodeStore/index.html?raw'
import stylesSource from '../productCodeStore/styles.css?raw'
import scriptSource from '../productCodeStore/app.js?raw'

const initialFiles = [
  {
    id: 'product-html',
    name: 'index.html',
    path: 'productCodeStore/index.html',
    language: 'html',
    folder: 'root',
    content: htmlSource,
  },
  {
    id: 'product-css',
    name: 'styles.css',
    path: 'productCodeStore/styles.css',
    language: 'css',
    folder: 'root',
    content: stylesSource,
  },
  {
    id: 'product-js',
    name: 'app.js',
    path: 'productCodeStore/app.js',
    language: 'javascript',
    folder: 'root',
    content: scriptSource,
  },
]

function App() {
  const [files, setFiles] = useState(initialFiles)
  const [activeFileId, setActiveFileId] = useState('product-html')
  const [openTabs, setOpenTabs] = useState(['product-html', 'product-css', 'product-js'])
  const [editorWidth, setEditorWidth] = useState(820)
  const shellRef = useRef(null)
  const draggingRef = useRef(false)

  const activeFile = files.find((file) => file.id === activeFileId) || files[0]

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
      <Grid size="8">
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
      <Grid size="3">
        <Paper
          elevation={0}
          sx={{
            background: '#f8fafc',
            borderRadius: 0,
            borderLeft: '1px solid rgba(148,163,184,0.2)',
            p: 2,
            display: 'flex',
            flexDirection: 'column',

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
            <ProductPreview />
          </Grid>
        </Paper>
      </Grid>
    </Grid>
  )
}

export default App
