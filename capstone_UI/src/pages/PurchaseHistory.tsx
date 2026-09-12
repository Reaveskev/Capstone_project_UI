import { useEffect, useMemo, useState } from "react";
import { fetchCustomers, type Customer } from "../api/customers";
import { fetchSales, type Sale } from "../api/sales";
import { useAuth } from "../context/AuthContext";

export default function PurchaseHistory() {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState(customers[0]?.id ?? "");

  useEffect(() => {
    if (!user?.token) return;

    let cancelled = false;

    Promise.all([fetchCustomers(user.token), fetchSales(user.token)])
      .then(([customerData, saleData]) => {
        if (cancelled) return;
        setCustomers(customerData);
        setSales(saleData);
        setError(null);
        setSelectedId(
          (current) => current ?? customerData[0]?.customerId ?? null,
        );
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load purchase history",
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

  const selectedCustomer = customers.find((c) => c.customerId === selectedId);

  const history = useMemo(
    () =>
      sales
        .filter((s) => s.customerId === selectedId)
        .sort(
          (a, b) =>
            new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime(),
        ),
    [sales, selectedId],
  );

  const totalSpent = history.reduce((sum, s) => sum + s.totalAmount, 0);

  return (
    <>
      <div className="page-header">
        <h1>Purchase History</h1>
        <p>Customer-specific transaction timelines with receipt breakdowns.</p>
      </div>

      {loading && (
        <div className="empty-state">Loading purchase history...</div>
      )}
      {error && <div className="login-error-banner">{error}</div>}

      {!loading && !error && (
        <div className="history-layout">
          <div className="card card-pad">
            <div className="card-title" style={{ marginBottom: 12 }}>
              Customers
            </div>
            <div className="customer-list">
              {customers.map((c) => (
                <button
                  key={c.customerId}
                  type="button"
                  className={`customer-list-item${c.customerId === selectedId ? " active" : ""}`}
                  onClick={() => setSelectedId(c.customerId)}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            {selectedCustomer && (
              <div className="card card-pad" style={{ marginBottom: 16 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: 12,
                  }}
                >
                  <div>
                    <div className="card-title">
                      {selectedCustomer.name}'s Account History
                    </div>
                    <div className="card-subtitle" style={{ marginBottom: 0 }}>
                      {selectedCustomer.email}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
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
                <div className="empty-state">
                  No purchases recorded for this customer yet.
                </div>
              ) : (
                <div className="timeline">
                  {history.map((s, i) => (
                    <div className="timeline-item" key={s.saleId}>
                      <div className="timeline-dot-wrap">
                        <div className="timeline-dot" />
                        {i < history.length - 1 && (
                          <div className="timeline-line" />
                        )}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div className="timeline-header">
                          <div style={{ fontWeight: 600 }}>
                            Sale #{s.saleId}
                          </div>
                          <div style={{ fontWeight: 700 }}>
                            ${s.totalAmount.toFixed(2)}
                          </div>
                        </div>
                        <div className="activity-time">
                          {new Date(s.saleDate).toLocaleDateString()}
                        </div>
                        <div className="timeline-items">
                          {s.items
                            .map((it) => `${it.quantity}× ${it.productName}`)
                            .join(", ")}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
