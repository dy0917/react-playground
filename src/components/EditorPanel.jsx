import { Box, Button, Divider, List, ListItemButton, ListItemText, Stack, TextField, Typography } from '@mui/material'

function EditorPanel({
  files,
  activeFileId,
  openTabs,
  activeFile,
  openFile,
  closeTab,
  updateFileContent,
  setActiveFileId,
}) {
  return (
    <Box
      component="main"
      sx={{
        display: 'flex',
        minWidth: 0,
        height: '100vh',
        background: '#0f172a',
      }}
    >
      <Box
        component="aside"
        sx={{
          width: 220,
          minWidth: 220,
          background: '#111827',
          borderRight: '1px solid rgba(148,163,184,0.2)',
          p: 1.5,
          color: '#e2e8f0',
        }}
      >
        <Box sx={{ mb: 2 }}>
          <Box
            component="span"
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              borderRadius: 999,
              background: 'rgba(167,139,250,0.14)',
              color: '#c4b5fd',
              px: 1.2,
              py: 0.6,
              fontSize: 11,
              letterSpacing: 0.8,
              fontWeight: 700,
              textTransform: 'uppercase',
            }}
          >
            React Playground
          </Box>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              color: '#94a3b8',
              letterSpacing: 1,
              textTransform: 'uppercase',
              mb: 1,
            }}
          >
            src
          </Typography>
          <List disablePadding sx={{ display: 'flex', flexDirection: 'column', gap: 0.6 }}>
            {files
              .filter((file) => file.folder === 'src')
              .map((file) => (
                <ListItemButton
                  key={file.id}
                  selected={file.id === activeFileId}
                  onClick={() => openFile(file.id)}
                  sx={{
                    borderRadius: 1,
                    px: 1,
                    py: 0.8,
                    color: '#dbeafe',
                    background: file.id === activeFileId ? 'rgba(148,163,184,0.12)' : 'transparent',
                    '&.Mui-selected': {
                      background: 'rgba(148,163,184,0.12)',
                    },
                  }}
                >
                  <Box
                    component="span"
                    sx={{
                      width: 22,
                      height: 22,
                      borderRadius: 1,
                      background: 'rgba(59,130,246,0.18)',
                      color: '#bfdbfe',
                      display: 'grid',
                      placeItems: 'center',
                      fontSize: 10,
                      fontWeight: 700,
                      mr: 1,
                    }}
                  >
                    {file.language === 'css' ? '{ }' : 'JS'}
                  </Box>
                  <ListItemText primary={file.name} sx={{ my: 0 }} />
                </ListItemButton>
              ))}
          </List>
        </Box>

        <Box>
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              color: '#94a3b8',
              letterSpacing: 1,
              textTransform: 'uppercase',
              mb: 1,
            }}
          >
            root
          </Typography>
          <List disablePadding sx={{ display: 'flex', flexDirection: 'column', gap: 0.6 }}>
            {files
              .filter((file) => file.folder === 'root')
              .map((file) => (
                <ListItemButton
                  key={file.id}
                  selected={file.id === activeFileId}
                  onClick={() => openFile(file.id)}
                  sx={{
                    borderRadius: 1,
                    px: 1,
                    py: 0.8,
                    color: '#dbeafe',
                    background: file.id === activeFileId ? 'rgba(148,163,184,0.12)' : 'transparent',
                    '&.Mui-selected': {
                      background: 'rgba(148,163,184,0.12)',
                    },
                  }}
                >
                  <Box
                    component="span"
                    sx={{
                      width: 22,
                      height: 22,
                      borderRadius: 1,
                      background: 'rgba(59,130,246,0.18)',
                      color: '#bfdbfe',
                      display: 'grid',
                      placeItems: 'center',
                      fontSize: 10,
                      fontWeight: 700,
                      mr: 1,
                    }}
                  >
                    {file.language === 'json' ? 'J' : 'F'}
                  </Box>
                  <ListItemText primary={file.name} sx={{ my: 0 }} />
                </ListItemButton>
              ))}
          </List>
        </Box>
      </Box>

      <Box sx={{ flex: 1,  display: 'flex', flexDirection: 'column', background: '#0f172a' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1.2, pt: 1, background: '#111827', borderBottom: '1px solid rgba(148,163,184,0.16)', minHeight: 48, overflowX: 'auto' }}>
          {openTabs.map((tabId) => {
            const tabFile = files.find((file) => file.id === tabId)
            if (!tabFile) return null

            return (
              <Button
                key={tabId}
                variant={tabId === activeFileId ? 'contained' : 'text'}
                onClick={() => setActiveFileId(tabId)}
                sx={{
                  minWidth: 0,
                  borderRadius: '8px 8px 0 0',
                  px: 1.2,
                  py: 0.8,
                  color: tabId === activeFileId ? '#fff' : '#cbd5e1',
                  background: tabId === activeFileId ? '#0f172a' : '#1f2937',
                  fontSize: 12,
                  textTransform: 'none',
                  justifyContent: 'space-between',
                  '& .MuiButton-startIcon': { margin: 0 },
                }}
              >
                {tabFile.name}
                <Box
                  component="span"
                  onClick={(event) => {
                    event.stopPropagation()
                    closeTab(tabId)
                  }}
                  sx={{ ml: 1, opacity: 0.7, fontSize: 16 }}
                >
                  ×
                </Box>
              </Button>
            )
          })}
        </Box>

        <Box sx={{ flex: 1, p: 1.5, minHeight: 0 }}>
          <TextField
            multiline
            fullWidth
            value={activeFile.content}
            onChange={(event) => updateFileContent(activeFile.id, event.target.value)}
            spellCheck={false}
            sx={{
              height: '100%',
              '& .MuiInputBase-root': {
                height: '100%',
                alignItems: 'flex-start',
                background: '#0b1120',
                color: '#e2e8f0',
                border: '1px solid rgba(148,163,184,0.15)',
                borderRadius: 2,
                fontFamily: 'Consolas, Monaco, monospace',
                fontSize: 14,
                lineHeight: 1.65,
              },
              '& .MuiInputBase-input': {
                color: '#e2e8f0',
                padding: '18px 16px',
                fontFamily: 'Consolas, Monaco, monospace',
                fontSize: 14,
                lineHeight: 1.65,
                resize: 'none',
              },
              '& .MuiOutlinedInput-notchedOutline': {
                border: 'none',
              },
            }}
          />
        </Box>
      </Box>
    </Box>
  )
}

export default EditorPanel
