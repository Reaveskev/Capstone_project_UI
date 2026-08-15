import { useMemo, useState } from 'react'
import { products as initialProducts, type Product } from '../data/mockData'
import { SearchIcon } from '../components/icons'

export default function Products() {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<Product | null>(null)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return products
    return products.filter(
      (p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q),
    )
  }, [products, search])

  const handleSave = (updated: Product) => {
    setProducts((prev) => prev.map((p) => (p.sku === updated.sku ? updated : p)))
    setEditing(null)
  }

  return (
    <>
      <div className="page-header">
        <h1>Manage Products</h1>
        <p>Track inventory, adjust pricing, and monitor stock levels.</p>
      </div>

      <div className="page-toolbar">
        <div className="search-input-wrap">
          <span className="search-icon">
            <SearchIcon />
          </span>
          <input
            className="input"
            placeholder="Search by SKU or product name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>SKU</th>
                <th>Product Name</th>
                <th>Category</th>
                <th>Stock Level</th>
                <th>Price</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6}>
                    <div className="empty-state">No products match your search.</div>
                  </td>
                </tr>
              )}
              {filtered.map((p) => {
                const low = p.stock < p.lowStockThreshold
                return (
                  <tr key={p.sku} className={low ? 'row-low-stock' : ''}>
                    <td>{p.sku}</td>
                    <td>{p.name}</td>
                    <td>{p.category}</td>
                    <td className={low ? 'text-danger' : ''}>
                      {p.stock} {low && '⚠'}
                    </td>
                    <td>${p.price.toFixed(2)}</td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => setEditing(p)}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {editing && (
        <ProductModal product={editing} onCancel={() => setEditing(null)} onSubmit={handleSave} />
      )}
    </>
  )
}

function ProductModal({
  product,
  onCancel,
  onSubmit,
}: {
  product: Product
  onCancel: () => void
  onSubmit: (p: Product) => void
}) {
  const [name, setName] = useState(product.name)
  const [stock, setStock] = useState(product.stock)
  const [price, setPrice] = useState(product.price)

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(16,24,40,0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
      }}
      onClick={onCancel}
    >
      <div className="card card-pad" style={{ width: 360 }} onClick={(e) => e.stopPropagation()}>
        <div className="card-title" style={{ marginBottom: 4 }}>
          Edit Product
        </div>
        <div className="card-subtitle">{product.sku}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="field">
            <label>Product Name</label>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="field">
            <label>Stock Level</label>
            <input
              className="input"
              type="number"
              value={stock}
              onChange={(e) => setStock(Number(e.target.value))}
            />
          </div>
          <div className="field">
            <label>Price</label>
            <input
              className="input"
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
            />
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => onSubmit({ ...product, name, stock, price })}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
