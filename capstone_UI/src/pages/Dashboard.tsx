import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Area,
  AreaChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { fetchProducts, type Product } from "../api/products";
import { fetchSales, type Sale } from "../api/sales";
import { useAuth } from "../context/useAuth";

const PIE_COLORS = ["#2f5fed", "#1f9d55", "#d98a1f", "#8a7bf0"];

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.token) return;

    let cancelled = false;

    Promise.all([fetchProducts(user.token), fetchSales(user.token)])
      .then(([productData, saleData]) => {
        if (cancelled) return;
        setProducts(productData);
        setSales(saleData);
        setError(null);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load dashboard data",
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

  const skuToCategory = useMemo(() => {
    const map = new Map<string, string>();
    products.forEach((p) => map.set(p.sku, p.category || "Other"));
    return map;
  }, [products]);

  const salesToday = useMemo(() => {
    const today = new Date();
    return sales
      .filter((s) => isSameDay(new Date(s.saleDate), today))
      .reduce((sum, s) => sum + s.totalAmount, 0);
  }, [sales]);

  const lowStockCount = useMemo(
    () => products.filter((p) => p.stockLevel < p.lowStockThreshold).length,
    [products],
  );

  const weeklySales = useMemo(() => {
    const days: { day: string; unitsSold: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const label = d.toLocaleDateString(undefined, { weekday: "short" });
      const unitsSold = sales
        .filter((s) => isSameDay(new Date(s.saleDate), d))
        .reduce(
          (sum, s) => sum + s.items.reduce((n, it) => n + it.quantity, 0),
          0,
        );
      days.push({ day: label, unitsSold });
    }
    return days;
  }, [sales]);

  const categoryBreakdown = useMemo(() => {
    const totals = new Map<string, number>();
    sales.forEach((s) => {
      s.items.forEach((it) => {
        const category = skuToCategory.get(it.sku) || "Other";
        totals.set(category, (totals.get(category) || 0) + it.lineTotal);
      });
    });
    return Array.from(totals.entries()).map(([category, value]) => ({
      category,
      value,
    }));
  }, [sales, skuToCategory]);

  const revenueTrend = useMemo(() => {
    const months: { month: string; revenue: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const label = d.toLocaleDateString(undefined, { month: "short" });
      const revenue = sales
        .filter((s) => {
          const sd = new Date(s.saleDate);
          return (
            sd.getFullYear() === d.getFullYear() &&
            sd.getMonth() === d.getMonth()
          );
        })
        .reduce((sum, s) => sum + s.totalAmount, 0);
      months.push({ month: label, revenue });
    }
    return months;
  }, [sales]);

  return (
    <>
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Sales metrics and inventory alerts.</p>
      </div>

      {loading && <div className="empty-state">Loading dashboard...</div>}
      {error && <div className="login-error-banner">{error}</div>}

      {!loading && !error && (
        <>
          <div className="metric-grid">
            <div className="card metric-card">
              <div className="metric-label">Sales Today</div>
              <div className="metric-value">${salesToday.toFixed(2)}</div>
            </div>
            <div className="card metric-card">
              <div className="metric-label">Transactions</div>
              <div className="metric-value">{sales.length}</div>
              <div className="metric-sub">Across all customers</div>
            </div>
            <div className="card metric-card">
              <div className="metric-label">Low Stock Alerts</div>
              <div className="metric-value">{lowStockCount}</div>
              <div
                className="metric-sub"
                style={{ color: lowStockCount ? "#e0362f" : undefined }}
              >
                {lowStockCount} SKUs below threshold
              </div>
            </div>
          </div>

          <div className="chart-grid">
            <div className="card card-pad">
              <div className="card-title">Weekly Sales</div>
              <div className="card-subtitle">Units sold, last 7 days</div>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={weeklySales}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e3e6ea"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar
                    dataKey="unitsSold"
                    name="Units Sold"
                    fill="#2f5fed"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="card card-pad">
              <div className="card-title">Sales Breakdown by Category</div>
              <div className="card-subtitle">Share of total revenue</div>
              {categoryBreakdown.length === 0 ? (
                <div className="empty-state">No sales yet.</div>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={categoryBreakdown}
                      dataKey="value"
                      nameKey="category"
                      innerRadius={55}
                      outerRadius={90}
                      paddingAngle={2}
                    >
                      {categoryBreakdown.map((entry, i) => (
                        <Cell
                          key={entry.category}
                          fill={PIE_COLORS[i % PIE_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(v) => [`$${Number(v).toFixed(2)}`, "Revenue"]}
                    />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="chart-grid-full card card-pad">
            <div className="card-title">Revenue Trend</div>
            <div className="card-subtitle">Last 7 months</div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={revenueTrend}>
                <defs>
                  <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2f5fed" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#2f5fed" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e3e6ea"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(v) => [
                    `$${Number(v).toLocaleString()}`,
                    "Revenue",
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#2f5fed"
                  strokeWidth={2.5}
                  fill="url(#revFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </>
  );
}
