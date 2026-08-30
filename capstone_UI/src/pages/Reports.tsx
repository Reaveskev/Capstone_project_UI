import { useEffect, useMemo, useState } from "react";
import { fetchSales, type Sale } from "../api/sales";
import { useAuth } from "../context/AuthContext";

type Filter = "All Sales" | "Today" | "This Week";
const TABS: Filter[] = ["All Sales", "Today", "This Week"];

function daysAgo(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  return Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
}

export default function Reports() {
  const { user } = useAuth();
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("All Sales");

  useEffect(() => {
    if (!user?.token) return;

    let cancelled = false;

    fetchSales(user.token)
      .then((data) => {
        if (!cancelled) {
          setSales(data);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load sales");
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
    return sales.filter((s) => {
      const age = daysAgo(s.saleDate);
      if (filter === "Today") return age === 0;
      if (filter === "This Week") return age >= 0 && age <= 7;
      return true;
    });
  }, [sales, filter]);

  const totalAmount = filtered.reduce((sum, s) => sum + s.totalAmount, 0);

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
            className={`tab${filter === t ? " active" : ""}`}
            onClick={() => setFilter(t)}
          >
            {t}
          </button>
        ))}
      </div>

      {error && (
        <div className="login-error-banner" style={{ marginBottom: 16 }}>
          {error}
        </div>
      )}

      <div
        className="metric-grid"
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}
      >
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
                <th>Sale ID</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Date</th>
                <th>Total Amount</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={5}>
                    <div className="empty-state">Loading sales...</div>
                  </td>
                </tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={5}>
                    <div className="empty-state">
                      No transactions in this range.
                    </div>
                  </td>
                </tr>
              )}
              {!loading &&
                filtered.map((s) => (
                  <tr key={s.saleId}>
                    <td>{s.saleId}</td>
                    <td>{s.customerName}</td>
                    <td>
                      {s.items.reduce((n, i) => n + i.quantity, 0)} item(s)
                    </td>
                    <td>{new Date(s.saleDate).toLocaleDateString()}</td>
                    <td>${s.totalAmount.toFixed(2)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
