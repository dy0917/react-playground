import usePreviewContext from '../contexts/usePreviewContext'

function ProductPreview() {
  const { preview } = usePreviewContext()
  const previewUrl = new URL(preview.url, window.location.href)
  previewUrl.searchParams.set('v', preview.version)

  return (
    <main className="product-panel" style={{ width: '100%', height: '100%', minHeight: 0, padding: 0 }}>
      <div className="product-window" style={{ width: '100%', height: '100%', minHeight: 0, borderRadius: 0 }}>
        <iframe
          title="Product catalog preview"
          src={previewUrl.href}
          style={{
            display: 'block',
            width: '100%',
            height: '100%',
            minHeight: 0,
            border: 0,
            background: '#f4f5ef',
          }}
        />
      </div>
    </main>
  )
}

export default ProductPreview
