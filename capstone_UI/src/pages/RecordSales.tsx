import { useEffect, useMemo, useState } from "react";
import { fetchCustomers, type Customer } from "../api/customers";
import { fetchProducts, type Product } from "../api/products";
import { createSale } from "../api/sales";
import { useAuth } from "../context/AuthContext";
import { SearchIcon, TrashIcon } from "../components/icons";

interface CartLine {
  sku: string;
  name: string;
  price: number;
  qty: number;
}

const STEPS = ["Select Customer", "Add Items", "Checkout & Rewards"];
const POINTS_VALUE = 0.01; // $0.01 per reward point

export default function RecordSales() {
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [customerSearch, setCustomerSearch] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [redeemPoints, setRedeemPoints] = useState(0);
  const [complete, setComplete] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productError, setProductsError] = useState<string | null>(null);
  const [customersError, setCustomersError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.token) return;

    let cancelled = false;

    fetchCustomers(user.token)
      .then((data) => {
        if (!cancelled) {
          setCustomers(data);
          setCustomersError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setCustomersError(
            err instanceof Error ? err.message : "Failed to load customers",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingCustomers(false);
      });

    fetchProducts(user.token)
      .then((data) => {
        if (!cancelled) {
          setProducts(data);
          setProductsError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setProductsError(
            err instanceof Error ? err.message : "Failed to load products",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingProducts(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user?.token]);

  const filteredCustomers = useMemo(() => {
    const q = customerSearch.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q),
    );
  }, [customers, customerSearch]);

  console.log("products in state:", products.length);

  const filteredProducts = useMemo(() => {
    const q = productSearch.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.productName.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q),
    );
  }, [products, productSearch]);

  const subtotal = cart.reduce((sum, l) => sum + l.price * l.qty, 0);
  const discount = redeemPoints * POINTS_VALUE;
  const total = Math.max(0, subtotal - discount);
  const maxRedeemable = customer
    ? Math.min(
        customer.rewardPointsBalance,
        Math.floor(subtotal / POINTS_VALUE),
      )
    : 0;

  const addToCart = (p: Product) => {
    setCart((prev) => {
      const existing = prev.find((l) => l.sku === p.sku);
      if (existing) {
        return prev.map((l) =>
          l.sku === p.sku ? { ...l, qty: l.qty + 1 } : l,
        );
      }
      return [
        ...prev,
        { sku: p.sku, name: p.productName, price: p.price, qty: 1 },
      ];
    });
  };

  const updateQty = (sku: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((l) =>
          l.sku === sku ? { ...l, qty: Math.max(1, l.qty + delta) } : l,
        )
        .filter((l) => l.qty > 0),
    );
  };

  const removeLine = (sku: string) => {
    setCart((prev) => prev.filter((l) => l.sku !== sku));
  };

  const resetAll = () => {
    setStep(0);
    setCustomer(null);
    setCart([]);
    setCustomerSearch("");
    setProductSearch("");
    setRedeemPoints(0);
    setComplete(false);
    setSubmitError(null);
  };

  const finalize = async () => {
    if (!user?.token || !customer) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      await createSale(user.token, {
        customerId: customer.customerId,
        items: cart.map((l) => ({
          sku: l.sku,
          quantity: l.qty,
          unitPrice: l.price,
        })),
        pointsRedeemed: redeemPoints,
      });
      setComplete(true);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Failed to complete sale",
      );
    } finally {
      setSubmitting(false);
    }
  };

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
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path
                  d="m5 12 5 5 9-10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
              Transaction Complete
            </h2>
            <p style={{ color: "var(--color-text-muted)", marginBottom: 4 }}>
              ${total.toFixed(2)} charged for {customer?.name}
            </p>
            <p style={{ color: "var(--color-text-muted)", marginBottom: 24 }}>
              Saved to the database and added to Purchase History.
            </p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={resetAll}
            >
              Start New Sale
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="page-header">
        <h1>Record Sales</h1>
        <p>Guided point-of-sale checkout to minimize employee errors.</p>
      </div>

      <div className="wizard-steps">
        {STEPS.map((label, i) => (
          <div key={label} style={{ display: "flex", alignItems: "center" }}>
            <div
              className={`wizard-step${i === step ? " active" : ""}${i < step ? " done" : ""}`}
            >
              <span className="wizard-step-num">{i < step ? "✓" : i + 1}</span>
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

            {loadingCustomers && (
              <div className="empty-state">Loading customers...</div>
            )}
            {customersError && (
              <div className="login-error-banner">{customersError}</div>
            )}

            {!loadingCustomers && !customersError && (
              <div className="customer-pick-grid">
                {filteredCustomers.map((c) => (
                  <button
                    key={c.customerId}
                    type="button"
                    className={`customer-pick-card${customer?.customerId === c.customerId ? " selected" : ""}`}
                    onClick={() => setCustomer(c)}
                  >
                    <div style={{ fontWeight: 600 }}>{c.name}</div>
                    <div
                      style={{ fontSize: 13, color: "var(--color-text-muted)" }}
                    >
                      {c.email}
                    </div>
                    <div style={{ fontSize: 12, marginTop: 6 }}>
                      <span className="badge badge-muted">
                        {c.rewardPointsBalance} pts
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {step === 1 && (
          <div>
            <div
              className="search-input-wrap"
              style={{ maxWidth: 400, marginBottom: 16 }}
            >
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

            {loadingProducts && (
              <div className="empty-state">Loading products...</div>
            )}
            {productError && (
              <div className="login-error-banner">{productError}</div>
            )}

            {!loadingProducts && !productError && (
              <div className="customer-pick-grid" style={{ marginBottom: 24 }}>
                {filteredProducts.map((p) => (
                  <button
                    key={p.sku}
                    type="button"
                    className="customer-pick-card"
                    onClick={() => addToCart(p)}
                  >
                    <div style={{ fontWeight: 600 }}>{p.productName}</div>
                    <div
                      style={{ fontSize: 13, color: "var(--color-text-muted)" }}
                    >
                      {p.sku}
                    </div>
                    <div
                      style={{ fontSize: 13, marginTop: 6, fontWeight: 600 }}
                    >
                      ${p.price.toFixed(2)}
                    </div>
                  </button>
                ))}
              </div>
            )}

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
                        <div className="empty-state">
                          Cart is empty — select items above.
                        </div>
                      </td>
                    </tr>
                  )}
                  {cart.map((l) => (
                    <tr key={l.sku}>
                      <td>{l.name}</td>
                      <td>
                        <div className="qty-control">
                          <button
                            type="button"
                            className="qty-btn"
                            onClick={() => updateQty(l.sku, -1)}
                          >
                            −
                          </button>
                          {l.qty}
                          <button
                            type="button"
                            className="qty-btn"
                            onClick={() => updateQty(l.sku, 1)}
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td>${(l.price * l.qty).toFixed(2)}</td>
                      <td>
                        <button
                          type="button"
                          className="icon-btn-danger"
                          onClick={() => removeLine(l.sku)}
                        >
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
            <div className="card-subtitle">
              {customer.name} — {cart.length} item(s)
            </div>

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
              <label>
                Redeem Reward Points (available: {customer.rewardPointsBalance})
              </label>
              <input
                className="input"
                type="number"
                min={0}
                max={maxRedeemable}
                value={redeemPoints}
                onChange={(e) =>
                  setRedeemPoints(
                    Math.max(
                      0,
                      Math.min(maxRedeemable, Number(e.target.value)),
                    ),
                  )
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

            {submitError && (
              <div className="login-error-banner" style={{ marginTop: 16 }}>
                {submitError}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="wizard-actions">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0 || submitting}
        >
          Back
        </button>
        {step < 2 ? (
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setStep((s) => s + 1)}
            disabled={
              (step === 0 && !customer) || (step === 1 && cart.length === 0)
            }
          >
            Continue
          </button>
        ) : (
          <button
            type="button"
            className="btn btn-primary"
            onClick={finalize}
            disabled={submitting}
          >
            {submitting ? "Processing..." : "Complete Sale"}
          </button>
        )}
      </div>
    </>
  );
}
