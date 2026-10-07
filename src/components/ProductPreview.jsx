function ProductPreview({ version }) {
  return (
    <main className="product-panel" style={{ width: '100%', height: '100%', minHeight: 0, padding: 0 }}>
      <div className="product-window" style={{ width: '100%', height: '100%', minHeight: 0, borderRadius: 0 }}>
        <iframe
          title="Product catalog preview"
          src={`/productCodeStore/index.html?v=${version}`}
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
