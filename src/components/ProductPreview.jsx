function ProductPreview({ product }) {
  return (
    <main className="product-panel">
      <div className="product-window">
        <header className="topbar">
          <div className="brand-mark">{product.brand.slice(0, 2).toUpperCase()}</div>
          <div className="topbar-links">
            <span>Product</span>
            <span>Pricing</span>
            <span>Docs</span>
          </div>
          <button type="button" className="ghost-button">
            Log in
          </button>
        </header>

        <section className="hero-section">
          <div className="copy-column">
            <p className="badge">Now shipping</p>
            <h1>{product.title}</h1>
            <p className="subtitle">{product.subtitle}</p>

            <div className="cta-row">
              <button
                type="button"
                className="primary-button product-button"
                style={{ background: product.accent }}
              >
                {product.cta}
              </button>
              <button type="button" className="secondary-button">
                View demo
              </button>
            </div>

            <div className="stats-grid">
              {product.stats.map((stat) => (
                <div key={stat.label} className="stat-card">
                  <strong>{stat.value}</strong>
                  <span>{stat.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mockup-column">
            <div className="mockup-card" style={{ borderColor: product.accent }}>
              <div className="mockup-header">
                <span className="dot red" />
                <span className="dot yellow" />
                <span className="dot green" />
              </div>

              <div className="mockup-body">
                <div className="mockup-sidebar">
                  <span className="sidebar-item active" style={{ background: product.accent }} />
                  <span className="sidebar-item" />
                  <span className="sidebar-item" />
                  <span className="sidebar-item" />
                </div>

                <div className="mockup-content">
                  <div className="chart-box" style={{ background: product.accent }} />
                  <div className="mini-grid">
                    <div className="mini-card" />
                    <div className="mini-card" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

export default ProductPreview
