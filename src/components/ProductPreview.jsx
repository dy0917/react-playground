function ProductPreview() {
  return (
    <main className="product-panel">
      <div className="product-window">
        <iframe
          title="Product catalog preview"
          src="http://127.0.0.1:5500/productCodeStore/index.html"
          style={{
            display: 'block',
            width: '100%',
            height: '760px',
            border: 0,
            background: '#f4f5ef',
          }}
        />
      </div>
    </main>
  )
}

export default ProductPreview
