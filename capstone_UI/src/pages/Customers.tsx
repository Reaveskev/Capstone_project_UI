import { useMemo, useState } from 'react'
import { customers as initialCustomers, type Customer } from '../data/mockData'
import { SearchIcon } from '../components/icons'

const PAGE_SIZE = 5

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [editing, setEditing] = useState<Customer | null>(null)
  const [showAdd, setShowAdd] = useState(false)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return customers
    return customers.filter(
      (c) => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q),
    )
  }, [customers, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageSafe = Math.min(page, totalPages)
  const pageItems = filtered.slice((pageSafe - 1) * PAGE_SIZE, pageSafe * PAGE_SIZE)

  const handleAdd = (c: ModalFields) => {
    const id = `C-${1000 + customers.length + 1}`
    const joined = new Date().toISOString().slice(0, 10)
    setCustomers((prev) => [{ ...c, id, joined }, ...prev])
    setShowAdd(false)
    setPage(1)
  }

  const handleSave = (updated: Customer) => {
    setCustomers((prev) => prev.map((c) => (c.id === updated.id ? updated : c)))
    setEditing(null)
  }

  return (
    <>
      <div className="page-header">
        <h1>Manage Customers</h1>
        <p>Search, update profiles, and monitor loyalty points.</p>
      </div>

      <div className="page-toolbar">
        <div className="search-input-wrap">
          <span className="search-icon">
            <SearchIcon />
          </span>
          <input
            className="input"
            placeholder="Search for Customer"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
          />
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setShowAdd(true)}>
          + Add Customer
        </button>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Reward Points</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {pageItems.length === 0 && (
                <tr>
                  <td colSpan={4}>
                    <div className="empty-state">No customers match your search.</div>
                  </td>
                </tr>
              )}
              {pageItems.map((c) => (
                <tr key={c.id}>
                  <td>{c.name}</td>
                  <td>{c.email}</td>
                  <td>{c.rewardPoints.toLocaleString()}</td>
                  <td>
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => setEditing(c)}>
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="pagination">
          <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={pageSafe === 1}>
            {'< Previous'}
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              type="button"
              className={n === pageSafe ? 'active' : ''}
              onClick={() => setPage(n)}
            >
              {n}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={pageSafe === totalPages}
          >
            {'Next >'}
          </button>
        </div>
      </div>

      {editing && (
        <CustomerModal
          title="Edit Customer"
          initial={editing}
          onCancel={() => setEditing(null)}
          onSubmit={(vals) => handleSave({ ...editing, ...vals })}
        />
      )}

      {showAdd && (
        <CustomerModal
          title="Add Customer"
          initial={{ name: '', email: '', rewardPoints: 0 }}
          onCancel={() => setShowAdd(false)}
          onSubmit={handleAdd}
        />
      )}
    </>
  )
}

interface ModalFields {
  name: string
  email: string
  rewardPoints: number
}

function CustomerModal({
  title,
  initial,
  onCancel,
  onSubmit,
}: {
  title: string
  initial: ModalFields
  onCancel: () => void
  onSubmit: (vals: ModalFields) => void
}) {
  const [name, setName] = useState(initial.name)
  const [email, setEmail] = useState(initial.email)
  const [rewardPoints, setRewardPoints] = useState(initial.rewardPoints)

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
      <div
        className="card card-pad"
        style={{ width: 360 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="card-title" style={{ marginBottom: 16 }}>
          {title}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="field">
            <label>Name</label>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="field">
            <label>Email</label>
            <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="field">
            <label>Reward Points</label>
            <input
              className="input"
              type="number"
              value={rewardPoints}
              onChange={(e) => setRewardPoints(Number(e.target.value))}
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
            onClick={() => onSubmit({ name, email, rewardPoints })}
            disabled={!name.trim() || !email.trim()}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
