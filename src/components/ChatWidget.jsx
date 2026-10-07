import { useState } from 'react'
import {
  Box,
  Button,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'

function ChatWidget({ onGenerated }) {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([])
  const [isGenerating, setIsGenerating] = useState(false)

  const sendMessage = async (event) => {
    event.preventDefault()
    const trimmedMessage = message.trim()
    if (!trimmedMessage || isGenerating) return

    setMessages((currentMessages) => [
      ...currentMessages,
      { role: 'user', text: trimmedMessage },
    ])
    setMessage('')
    setIsGenerating(true)

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requirement: trimmedMessage }),
      })
      const result = await response.json()
      if (!response.ok || !result.ok) {
        throw new Error(result.error || `Page generation failed (${response.status})`)
      }

      onGenerated(result.files)
      setMessages((currentMessages) => [
        ...currentMessages,
        { role: 'assistant', text: 'Your page is ready:', url: result.url },
      ])
    } catch (error) {
      setMessages((currentMessages) => [
        ...currentMessages,
        { role: 'assistant', text: `I couldn't build that page: ${error.message}` },
      ])
    } finally {
      setIsGenerating(false)
    }
  }

  if (!isOpen) {
    return (
      <Button
        variant="contained"
        onClick={() => setIsOpen(true)}
        aria-label="Open chat"
        startIcon={
          <Box
            component="svg"
            viewBox="0 0 24 24"
            aria-hidden="true"
            sx={{ width: 18, height: 18, fill: 'none', stroke: 'currentColor', strokeWidth: 2 }}
          >
            <path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8z" />
          </Box>
        }
        sx={{
          position: 'fixed',
          right: { xs: 16, sm: 24 },
          bottom: { xs: 16, sm: 24 },
          zIndex: 1400,
          borderRadius: 999,
          px: 2.2,
          py: 1.2,
          background: '#7c3aed',
          boxShadow: '0 8px 24px rgba(76,29,149,0.3)',
          textTransform: 'none',
          fontWeight: 700,
          '&:hover': { background: '#6d28d9' },
        }}
      >
        Chat
      </Button>
    )
  }

  return (
    <Paper
      elevation={12}
      role="region"
      aria-label="Chat window"
      sx={{
        position: 'fixed',
        right: { xs: 12, sm: 24 },
        bottom: { xs: 12, sm: 24 },
        zIndex: 1400,
        display: 'flex',
        flexDirection: 'column',
        width: { xs: 'calc(100vw - 24px)', sm: 360 },
        height: { xs: 'min(480px, calc(100dvh - 24px))', sm: 480 },
        maxHeight: 'calc(100dvh - 24px)',
        overflow: 'hidden',
        border: '1px solid rgba(148,163,184,0.25)',
        borderRadius: 3,
        background: '#fff',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          py: 1.5,
          color: '#fff',
          background: '#1e1b4b',
        }}
      >
        <Box>
          <Typography sx={{ fontSize: 15, fontWeight: 700, lineHeight: 1.4 }}>
            Playground chat
          </Typography>
          <Typography sx={{ fontSize: 11, color: '#c4b5fd' }}>
            Gemini · describe the page you want
          </Typography>
        </Box>
        <IconButton
          size="small"
          onClick={() => setIsOpen(false)}
          aria-label="Minimize chat"
          sx={{ color: '#fff', fontSize: 20 }}
        >
          −
        </IconButton>
      </Box>

      <Stack
        spacing={1.5}
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          p: 2,
          background: '#f8fafc',
        }}
      >
        <Box
          sx={{
            alignSelf: 'flex-start',
            maxWidth: '85%',
            px: 1.5,
            py: 1,
            borderRadius: '14px 14px 14px 4px',
            background: '#fff',
            color: '#334155',
            boxShadow: '0 1px 3px rgba(15,23,42,0.08)',
          }}
        >
          <Typography sx={{ fontSize: 13, lineHeight: 1.5 }}>
            Describe a simple page and I’ll build it in the productCodeStore folder.
          </Typography>
        </Box>
        {messages.map((item, index) => (
          <Box
            key={`${index}-${item.role}-${item.text}`}
            sx={{
              alignSelf: item.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '85%',
              px: 1.5,
              py: 1,
              borderRadius: item.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
              background: item.role === 'user' ? '#7c3aed' : '#fff',
              color: item.role === 'user' ? '#fff' : '#334155',
              overflowWrap: 'anywhere',
              boxShadow: item.role === 'assistant' ? '0 1px 3px rgba(15,23,42,0.08)' : 'none',
            }}
          >
            <Typography sx={{ fontSize: 13, lineHeight: 1.5 }}>{item.text}</Typography>
            {item.url && (
              <Typography
                component="a"
                href={item.url}
                target="_blank"
                rel="noreferrer"
                sx={{
                  display: 'inline-block',
                  mt: 0.5,
                  color: '#6d28d9',
                  fontSize: 13,
                  fontWeight: 700,
                  textDecoration: 'underline',
                }}
              >
                Open generated page
              </Typography>
            )}
          </Box>
        ))}
        {isGenerating && (
          <Typography aria-live="polite" sx={{ color: '#64748b', fontSize: 12 }}>
            Building your page…
          </Typography>
        )}
      </Stack>

      <Box
        component="form"
        onSubmit={sendMessage}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          p: 1.5,
          borderTop: '1px solid #e2e8f0',
          background: '#fff',
        }}
      >
        <TextField
          fullWidth
          size="small"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          disabled={isGenerating}
          placeholder="Write a message..."
          slotProps={{ htmlInput: { 'aria-label': 'Write a message' } }}
          sx={{
            '& .MuiOutlinedInput-root': { borderRadius: 2, fontSize: 13 },
          }}
        />
        <Button
          type="submit"
          variant="contained"
          disabled={!message.trim() || isGenerating}
          sx={{
            minWidth: 0,
            px: 1.5,
            borderRadius: 2,
            background: '#7c3aed',
            textTransform: 'none',
            '&:hover': { background: '#6d28d9' },
          }}
        >
          Send
        </Button>
      </Box>
    </Paper>
  )
}

export default ChatWidget
