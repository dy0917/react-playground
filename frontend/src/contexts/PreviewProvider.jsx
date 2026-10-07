import { useReducer } from 'react'
import previewContext from './previewContext'

const initialPreviewState = {
  url: '/productCodeStore/index.html',
  version: 0,
}

function previewReducer(state, action) {
  switch (action.type) {
    case 'generated':
      return { ...state, version: state.version + 1 }
    case 'open-generated':
      return { ...state, url: action.url }
    default:
      return state
  }
}

function PreviewProvider({ children }) {
  const [preview, dispatch] = useReducer(previewReducer, initialPreviewState)

  return (
    <previewContext.Provider value={{ preview, dispatch }}>
      {children}
    </previewContext.Provider>
  )
}

export default PreviewProvider
