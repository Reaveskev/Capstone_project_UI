import { useMemo, useState } from 'react'
import { customers, transactions } from '../data/mockData'

export default function PurchaseHistory() {
  const [selectedId, setSelectedId] = useState(customers[0]?.id ?? '')

  const selectedCustomer = customers.find((c) => c.id === selectedId)

  const history = useMemo(
    () =>
      transactions
        .filter((t) => t.customerId === selectedId)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [selectedId],
  )

  const totalSpent = history.reduce((sum, t) => sum + t.total, 0)

  return (
    <>
      <div className="page-header">
        <h1>Purchase History</h1>
        <p>Customer-specific transaction timelines with receipt breakdowns.</p>
      </div>

      <div className="history-layout">
        <div className="card card-pad">
          <div className="card-title" style={{ marginBottom: 12 }}>
            Customers
          </div>
          <div className="customer-list">
            {customers.map((c) => (
              <button
                key={c.id}
                type="button"
                className={`customer-list-item${c.id === selectedId ? ' active' : ''}`}
                onClick={() => setSelectedId(c.id)}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        <div>
          {selectedCustomer && (
            <div className="card card-pad" style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <div className="card-title">{selectedCustomer.name}'s Account History</div>
                  <div className="card-subtitle" style={{ marginBottom: 0 }}>
                    {selectedCustomer.email} · Customer since {selectedCustomer.joined}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="metric-label">Total Spent</div>
                  <div className="metric-value" style={{ fontSize: 20 }}>
                    ${totalSpent.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="card card-pad">
            {history.length === 0 ? (
              <div className="empty-state">No purchases recorded for this customer yet.</div>
            ) : (
              <div className="timeline">
                {history.map((t, i) => (
                  <div className="timeline-item" key={t.id}>
                    <div className="timeline-dot-wrap">
                      <div className="timeline-dot" />
                      {i < history.length - 1 && <div className="timeline-line" />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div className="timeline-header">
                        <div style={{ fontWeight: 600 }}>{t.id}</div>
                        <div style={{ fontWeight: 700 }}>${t.total.toFixed(2)}</div>
                      </div>
                      <div className="activity-time">{t.date}</div>
                      <div className="timeline-items">
                        {t.items.map((it) => `${it.qty}× ${it.name}`).join(', ')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
