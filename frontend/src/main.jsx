import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import PreviewProvider from './contexts/PreviewProvider.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <PreviewProvider>
      <App />
    </PreviewProvider>
  </StrictMode>,
)
