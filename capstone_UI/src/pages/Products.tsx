import { useEffect, useMemo, useState } from "react";
import { fetchProducts, updateProduct, type Product } from "../api/products";
import { useAuth } from "../context/AuthContext";
import { SearchIcon } from "../components/icons";

export default function Products() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user?.token) return;

    let cancelled = false;

    fetchProducts(user.token)
      .then((data) => {
        if (!cancelled) {
          setProducts(data);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load products",
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
    if (!q) return products;
    return products.filter(
      (p) =>
        p.productName.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q),
    );
  }, [products, search]);

  const handleSave = async (updated: Product) => {
    if (!user?.token) return;
    setSaving(true);
    try {
      const saved = await updateProduct(user.token, updated.sku, {
        productName: updated.productName,
        price: updated.price,
        stockLevel: updated.stockLevel,
        category: updated.category,
        lowStockThreshold: updated.lowStockThreshold,
      });
      setProducts((prev) => prev.map((p) => (p.sku === saved.sku ? saved : p)));
      setEditing(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save product");
    } finally {
      setSaving(false);
    }
  };

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

      {error && (
        <div className="login-error-banner" style={{ marginBottom: 16 }}>
          {error}
        </div>
      )}

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
              {loading && (
                <tr>
                  <td colSpan={6}>
                    <div className="empty-state">Loading products...</div>
                  </td>
                </tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={6}>
                    <div className="empty-state">
                      No products match your search.
                    </div>
                  </td>
                </tr>
              )}
              {!loading &&
                filtered.map((p) => {
                  const low = p.stockLevel < p.lowStockThreshold;
                  return (
                    <tr key={p.sku} className={low ? "row-low-stock" : ""}>
                      <td>{p.sku}</td>
                      <td>{p.productName}</td>
                      <td>{p.category}</td>
                      <td className={low ? "text-danger" : ""}>
                        {p.stockLevel} {low && "⚠"}
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
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

      {editing && (
        <ProductModal
          product={editing}
          saving={saving}
          onCancel={() => setEditing(null)}
          onSubmit={handleSave}
        />
      )}
    </>
  );
}

function ProductModal({
  product,
  saving,
  onCancel,
  onSubmit,
}: {
  product: Product;
  saving: boolean;
  onCancel: () => void;
  onSubmit: (p: Product) => void;
}) {
  const [productName, setProductName] = useState(product.productName);
  const [stockLevel, setStockLevel] = useState(product.stockLevel);
  const [price, setPrice] = useState(product.price);

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
        <div className="card-title" style={{ marginBottom: 4 }}>
          Edit Product
        </div>
        <div className="card-subtitle">{product.sku}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="field">
            <label>Product Name</label>
            <input
              className="input"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
            />
          </div>
          <div className="field">
            <label>Stock Level</label>
            <input
              className="input"
              type="number"
              value={stockLevel}
              onChange={(e) => setStockLevel(Number(e.target.value))}
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
            disabled={saving}
            onClick={() =>
              onSubmit({ ...product, productName, stockLevel, price })
            }
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
