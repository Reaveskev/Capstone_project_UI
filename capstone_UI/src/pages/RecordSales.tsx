import { useMemo, useState } from 'react'
import { customers, products, type Customer, type Product } from '../data/mockData'
import { SearchIcon, TrashIcon } from '../components/icons'

interface CartLine {
  sku: string
  name: string
  price: number
  qty: number
}

const STEPS = ['Select Customer', 'Add Items', 'Checkout & Rewards']
const POINTS_VALUE = 0.01 // $0.01 per reward point

export default function RecordSales() {
  const [step, setStep] = useState(0)
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [cart, setCart] = useState<CartLine[]>([])
  const [customerSearch, setCustomerSearch] = useState('')
  const [productSearch, setProductSearch] = useState('')
  const [redeemPoints, setRedeemPoints] = useState(0)
  const [complete, setComplete] = useState(false)

  const filteredCustomers = useMemo(() => {
    const q = customerSearch.trim().toLowerCase()
    if (!q) return customers
    return customers.filter((c) => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q))
  }, [customerSearch])

  const filteredProducts = useMemo(() => {
    const q = productSearch.trim().toLowerCase()
    if (!q) return products
    return products.filter((p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q))
  }, [productSearch])

  const subtotal = cart.reduce((sum, l) => sum + l.price * l.qty, 0)
  const discount = redeemPoints * POINTS_VALUE
  const total = Math.max(0, subtotal - discount)
  const maxRedeemable = customer ? Math.min(customer.rewardPoints, Math.floor(subtotal / POINTS_VALUE)) : 0

  const addToCart = (p: Product) => {
    setCart((prev) => {
      const existing = prev.find((l) => l.sku === p.sku)
      if (existing) {
        return prev.map((l) => (l.sku === p.sku ? { ...l, qty: l.qty + 1 } : l))
      }
      return [...prev, { sku: p.sku, name: p.name, price: p.price, qty: 1 }]
    })
  }

  const updateQty = (sku: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((l) => (l.sku === sku ? { ...l, qty: Math.max(1, l.qty + delta) } : l))
        .filter((l) => l.qty > 0),
    )
  }

  const removeLine = (sku: string) => {
    setCart((prev) => prev.filter((l) => l.sku !== sku))
  }

  const resetAll = () => {
    setStep(0)
    setCustomer(null)
    setCart([])
    setCustomerSearch('')
    setProductSearch('')
    setRedeemPoints(0)
    setComplete(false)
  }

  const finalize = () => {
    setComplete(true)
  }

  if (complete) {
    return (
      <>
        <div className="page-header">
          <h1>Record Sales</h1>
          <p>Guided point-of-sale checkout.</p>
        </div>
        <div className="card">
          <div className="success-panel">
            <div className="success-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="m5 12 5 5 9-10" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Transaction Complete</h2>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: 4 }}>
              ${total.toFixed(2)} charged for {customer?.name}
            </p>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: 24 }}>
              Saved to the database and added to Purchase History.
            </p>
            <button type="button" className="btn btn-primary" onClick={resetAll}>
              Start New Sale
            </button>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <div className="page-header">
        <h1>Record Sales</h1>
        <p>Guided point-of-sale checkout to minimize employee errors.</p>
      </div>

      <div className="wizard-steps">
        {STEPS.map((label, i) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center' }}>
            <div className={`wizard-step${i === step ? ' active' : ''}${i < step ? ' done' : ''}`}>
              <span className="wizard-step-num">{i < step ? '✓' : i + 1}</span>
              {label}
            </div>
            {i < STEPS.length - 1 && <div className="wizard-connector" />}
          </div>
        ))}
      </div>

      <div className="card card-pad">
        {step === 0 && (
          <div>
            <div className="search-input-wrap" style={{ maxWidth: 400 }}>
              <span className="search-icon">
                <SearchIcon />
              </span>
              <input
                className="input"
                placeholder="Search for a customer"
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
              />
            </div>
            <div className="customer-pick-grid">
              {filteredCustomers.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className={`customer-pick-card${customer?.id === c.id ? ' selected' : ''}`}
                  onClick={() => setCustomer(c)}
                >
                  <div style={{ fontWeight: 600 }}>{c.name}</div>
                  <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>{c.email}</div>
                  <div style={{ fontSize: 12, marginTop: 6 }}>
                    <span className="badge badge-muted">{c.rewardPoints} pts</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 1 && (
          <div>
            <div className="search-input-wrap" style={{ maxWidth: 400, marginBottom: 16 }}>
              <span className="search-icon">
                <SearchIcon />
              </span>
              <input
                className="input"
                placeholder="Search products by name or SKU"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
              />
            </div>

            <div className="customer-pick-grid" style={{ marginBottom: 24 }}>
              {filteredProducts.map((p) => (
                <button
                  key={p.sku}
                  type="button"
                  className="customer-pick-card"
                  onClick={() => addToCart(p)}
                >
                  <div style={{ fontWeight: 600 }}>{p.name}</div>
                  <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>{p.sku}</div>
                  <div style={{ fontSize: 13, marginTop: 6, fontWeight: 600 }}>${p.price.toFixed(2)}</div>
                </button>
              ))}
            </div>

            <div className="card-title">Cart</div>
            <div className="table-wrap" style={{ marginTop: 8 }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Qty</th>
                    <th>Subtotal</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {cart.length === 0 && (
                    <tr>
                      <td colSpan={4}>
                        <div className="empty-state">Cart is empty — select items above.</div>
                      </td>
                    </tr>
                  )}
                  {cart.map((l) => (
                    <tr key={l.sku}>
                      <td>{l.name}</td>
                      <td>
                        <div className="qty-control">
                          <button type="button" className="qty-btn" onClick={() => updateQty(l.sku, -1)}>
                            −
                          </button>
                          {l.qty}
                          <button type="button" className="qty-btn" onClick={() => updateQty(l.sku, 1)}>
                            +
                          </button>
                        </div>
                      </td>
                      <td>${(l.price * l.qty).toFixed(2)}</td>
                      <td>
                        <button type="button" className="icon-btn-danger" onClick={() => removeLine(l.sku)}>
                          <TrashIcon />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {step === 2 && customer && (
          <div>
            <div className="card-title">Order Summary</div>
            <div className="card-subtitle">{customer.name} — {cart.length} item(s)</div>

            <div className="table-wrap" style={{ marginBottom: 20 }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Qty</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map((l) => (
                    <tr key={l.sku}>
                      <td>{l.name}</td>
                      <td>{l.qty}</td>
                      <td>${(l.price * l.qty).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="field" style={{ maxWidth: 300, marginBottom: 20 }}>
              <label>Redeem Reward Points (available: {customer.rewardPoints})</label>
              <input
                className="input"
                type="number"
                min={0}
                max={maxRedeemable}
                value={redeemPoints}
                onChange={(e) =>
                  setRedeemPoints(Math.max(0, Math.min(maxRedeemable, Number(e.target.value))))
                }
              />
            </div>

            <div className="checkout-summary">
              <div className="checkout-summary-row">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="checkout-summary-row">
                <span>Rewards Discount</span>
                <span>-${discount.toFixed(2)}</span>
              </div>
              <div className="checkout-summary-row total">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="wizard-actions">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
        >
          Back
        </button>
        {step < 2 ? (
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setStep((s) => s + 1)}
            disabled={(step === 0 && !customer) || (step === 1 && cart.length === 0)}
          >
            Continue
          </button>
        ) : (
          <button type="button" className="btn btn-primary" onClick={finalize}>
            Complete Sale
          </button>
        )}
      </div>
    </>
  )
}
