import { useMemo, useState } from 'react'
import { transactions } from '../data/mockData'

type Filter = 'All Sales' | 'Today' | 'This Week'
const TABS: Filter[] = ['All Sales', 'Today', 'This Week']

const TODAY = new Date('2026-08-14')

function daysAgo(dateStr: string) {
  const d = new Date(dateStr)
  return Math.floor((TODAY.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))
}

export default function Reports() {
  const [filter, setFilter] = useState<Filter>('All Sales')

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      const age = daysAgo(t.date)
      if (filter === 'Today') return age === 0
      if (filter === 'This Week') return age >= 0 && age <= 7
      return true
    })
  }, [filter])

  const totalAmount = filtered.reduce((sum, t) => sum + t.total, 0)

  return (
    <>
      <div className="page-header">
        <h1>View Reports</h1>
        <p>Transaction history and sales performance, filtered by date.</p>
      </div>

      <div className="tabs">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            className={`tab${filter === t ? ' active' : ''}`}
            onClick={() => setFilter(t)}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="metric-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
        <div className="card metric-card">
          <div className="metric-label">Transactions</div>
          <div className="metric-value">{filtered.length}</div>
        </div>
        <div className="card metric-card">
          <div className="metric-label">Total Amount</div>
          <div className="metric-value">${totalAmount.toFixed(2)}</div>
        </div>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Transaction ID</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Date</th>
                <th>Total Amount</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5}>
                    <div className="empty-state">No transactions in this range.</div>
                  </td>
                </tr>
              )}
              {filtered.map((t) => (
                <tr key={t.id}>
                  <td>{t.id}</td>
                  <td>{t.customerName}</td>
                  <td>{t.items.reduce((n, i) => n + i.qty, 0)} item(s)</td>
                  <td>{t.date}</td>
                  <td>${t.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
