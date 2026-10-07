import { useContext } from 'react'
import previewContext from './previewContext'

function usePreviewContext() {
  const context = useContext(previewContext)
  if (!context) {
    throw new Error('usePreviewContext must be used within a PreviewProvider')
  }
  return context
}

export default usePreviewContext
