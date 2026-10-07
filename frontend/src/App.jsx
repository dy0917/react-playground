import { useState } from 'react'
import { Grid, Paper } from '@mui/material'
import EditorPanel from './components/EditorPanel'
import ProductPreview from './components/ProductPreview'
import ChatWidget from './components/ChatWidget'
import usePreviewContext from './contexts/usePreviewContext'
import htmlSource from '../../productCodeStore/index.html?raw'
import stylesSource from '../../productCodeStore/styles.css?raw'
import scriptSource from '../../productCodeStore/app.js?raw'

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
  const { dispatch } = usePreviewContext()

  const activeFile = files.find((file) => file.id === activeFileId) || files[0]

  const updateFileContent = (fileId, value) => {
    setFiles((currentFiles) =>
      currentFiles.map((file) =>
        file.id === fileId ? { ...file, content: value } : file,
      ),
    )
  }

  const handleGenerated = (generatedFiles) => {
    const fileIdsByPath = {
      'index.html': 'product-html',
      'styles.css': 'product-css',
      'app.js': 'product-js',
    }
    const fileContents = Object.fromEntries(
      generatedFiles.map((file) => [fileIdsByPath[file.path], file.content]),
    )

    setFiles((currentFiles) =>
      currentFiles.map((file) =>
        Object.hasOwn(fileContents, file.id)
          ? { ...file, content: fileContents[file.id] }
          : file,
      ),
    )
    dispatch({ type: 'generated' })
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

  return (
    <Grid
      container
      sx={{
        position: 'fixed',
        inset: 0,
        width: 'auto',
        height: '100vh',
        minHeight: '100vh',
        m: 0,
        p: 0,
        overflow: 'hidden',
      }}
    >
      <Grid size={8} sx={{ minWidth: 0 }}>
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

      <Grid size={4} sx={{ minWidth: 0 }}>
        <Paper
          elevation={0}
          sx={{
            background: '#f8fafc',
            borderRadius: 0,
            borderLeft: '1px solid rgba(148,163,184,0.2)',
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            height: '100vh',
            m: 0,
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

      <ChatWidget onGenerated={handleGenerated} />
    </Grid>
  )
}

export default App
