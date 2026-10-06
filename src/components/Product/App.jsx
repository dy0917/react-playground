import { useMemo, useState } from 'react'
import ProductPreview from '../ProductPreview'

const defaultProduct = {
  brand: 'Northstar',
  title: 'Build beautiful product experiences',
  subtitle: 'Launch polished features faster with a simple design system your team can actually ship.',
  cta: 'Start free trial',
  accent: '#7c3aed',
  stats: [
    { label: 'Projects shipped', value: '1.2k' },
    { label: 'Avg. engagement', value: '94%' },
    { label: 'Team velocity', value: '3.5x' },
  ],
}

function App() {
  const [product, setProduct] = useState(defaultProduct)

  return (
    <div className="workspace-shell">

    </div>
  )
}

export default App
