import { useEffect, useMemo, useState } from "react";
import {
  fetchCustomers,
  createCustomer,
  updateCustomer,
  type Customer,
} from "../api/customers";
import { useAuth } from "../context/useAuth";
import { SearchIcon } from "../components/icons";

const PAGE_SIZE = 5;

export default function Customers() {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user?.token) return;
    let cancelled = false;

    fetchCustomers(user.token)
      .then((data) => {
        if (!cancelled) {
          setCustomers(data);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load customers",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user?.token]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q),
    );
  }, [customers, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageSafe = Math.min(page, totalPages);
  const pageItems = filtered.slice(
    (pageSafe - 1) * PAGE_SIZE,
    pageSafe * PAGE_SIZE,
  );

  const handleAdd = async (vals: ModalFields) => {
    if (!user?.token) return;
    setSaving(true);
    try {
      const created = await createCustomer(user.token, {
        name: vals.name,
        email: vals.email,
        phone: vals.phone,
        rewardPointsBalance: vals.rewardPointsBalance,
      });
      setCustomers((prev) => [created, ...prev]);
      setShowAdd(false);
      setPage(1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add customer");
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async (customerId: number, vals: ModalFields) => {
    if (!user?.token) return;
    setSaving(true);
    try {
      const updated = await updateCustomer(user.token, customerId, {
        name: vals.name,
        email: vals.email,
        phone: vals.phone,
        rewardPointsBalance: vals.rewardPointsBalance,
      });
      setCustomers((prev) =>
        prev.map((c) => (c.customerId === customerId ? updated : c)),
      );
      setEditing(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update customer",
      );
    } finally {
      setSaving(false);
    }
  };

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
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setShowAdd(true)}
        >
          + Add Customer
        </button>
      </div>

      <div className="card">
        {error && <div className="login-error-banner">{error}</div>}

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Reward Points</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={5}>
                    <div className="empty-state">Loading customers...</div>
                  </td>
                </tr>
              )}
              {!loading && pageItems.length === 0 && (
                <tr>
                  <td colSpan={5}>
                    <div className="empty-state">
                      No customers match your search.
                    </div>
                  </td>
                </tr>
              )}
              {!loading &&
                pageItems.map((c) => (
                  <tr key={c.customerId}>
                    <td>{c.name}</td>
                    <td>{c.email}</td>
                    <td>{c.phone}</td>
                    <td>{c.rewardPointsBalance.toLocaleString()}</td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => setEditing(c)}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        <div className="pagination">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={pageSafe === 1}
          >
            {"< Previous"}
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              type="button"
              className={n === pageSafe ? "active" : ""}
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
            {"Next >"}
          </button>
        </div>
      </div>

      {editing && (
        <CustomerModal
          title="Edit Customer"
          initial={{
            name: editing.name,
            email: editing.email,
            phone: editing.phone,
            rewardPointsBalance: editing.rewardPointsBalance,
          }}
          saving={saving}
          onCancel={() => setEditing(null)}
          onSubmit={(vals) => handleSave(editing.customerId, vals)}
        />
      )}

      {showAdd && (
        <CustomerModal
          title="Add Customer"
          initial={{ name: "", email: "", phone: "", rewardPointsBalance: 0 }}
          saving={saving}
          onCancel={() => setShowAdd(false)}
          onSubmit={handleAdd}
        />
      )}
    </>
  );
}

interface ModalFields {
  name: string;
  email: string;
  phone: string;
  rewardPointsBalance: number;
}

function CustomerModal({
  title,
  initial,
  saving,
  onCancel,
  onSubmit,
}: {
  title: string;
  initial: ModalFields;
  saving: boolean;
  onCancel: () => void;
  onSubmit: (vals: ModalFields) => void;
}) {
  const [name, setName] = useState(initial.name);
  const [email, setEmail] = useState(initial.email);
  const [phone, setPhone] = useState(initial.phone);
  const [rewardPointsBalance, setRewardPointsBalance] = useState(
    initial.rewardPointsBalance,
  );

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(16,24,40,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
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
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="field">
            <label>Name</label>
            <input
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="field">
            <label>Email</label>
            <input
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="field">
            <label>Phone</label>
            <input
              className="input"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div className="field">
            <label>Reward Points</label>
            <input
              className="input"
              type="number"
              value={rewardPointsBalance}
              onChange={(e) => setRewardPointsBalance(Number(e.target.value))}
            />
          </div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 10,
            marginTop: 20,
          }}
        >
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() =>
              onSubmit({ name, email, phone, rewardPointsBalance })
            }
            disabled={!name.trim() || !email.trim() || saving}
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
