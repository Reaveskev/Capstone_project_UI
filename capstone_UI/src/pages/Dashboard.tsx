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
} from 'recharts'
import {
  products,
  transactions,
  weeklySales,
  categoryBreakdown,
  revenueTrend,
  recentActivity,
} from '../data/mockData'

const PIE_COLORS = ['#2f5fed', '#1f9d55', '#d98a1f', '#8a7bf0']

const salesToday = transactions
  .filter((t) => t.date === '2026-08-14')
  .reduce((sum, t) => sum + t.total, 0)

const lowStockCount = products.filter((p) => p.stock < p.lowStockThreshold).length

export default function Dashboard() {
  return (
    <>
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Sales metrics, inventory alerts, and live operational updates.</p>
      </div>

      <div className="metric-grid">
        <div className="card metric-card">
          <div className="metric-label">Sales Today</div>
          <div className="metric-value">${salesToday.toFixed(2)}</div>
          <div className="metric-sub positive">▲ 12.4% vs yesterday</div>
        </div>
        <div className="card metric-card">
          <div className="metric-label">Transactions</div>
          <div className="metric-value">{transactions.length}</div>
          <div className="metric-sub">Across all customers</div>
        </div>
        <div className="card metric-card">
          <div className="metric-label">Low Stock Alerts</div>
          <div className="metric-value">{lowStockCount}</div>
          <div className="metric-sub" style={{ color: lowStockCount ? '#e0362f' : undefined }}>
            {lowStockCount} SKUs below threshold
          </div>
        </div>
      </div>

      <div className="chart-grid">
        <div className="card card-pad">
          <div className="card-title">Weekly Sales</div>
          <div className="card-subtitle">Units sold vs. returns</div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={weeklySales}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e3e6ea" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="unitsSold" name="Units Sold" fill="#2f5fed" radius={[4, 4, 0, 0]} />
              <Bar dataKey="returns" name="Returns" fill="#f0a3a0" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card card-pad">
          <div className="card-title">Sales Breakdown by Category</div>
          <div className="card-subtitle">Share of total sales</div>
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
                  <Cell key={entry.category} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
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
            <CartesianGrid strokeDasharray="3 3" stroke="#e3e6ea" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip formatter={(v) => [`$${Number(v).toLocaleString()}`, 'Revenue']} />
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

      <div className="card card-pad">
        <div className="card-title">Recent Activity</div>
        <div className="card-subtitle">Live record of sales, inventory, and sign-ups</div>
        <div className="activity-list">
          {recentActivity.map((a) => (
            <div className="activity-item" key={a.id}>
              <span className={`activity-dot ${a.type}`} />
              <div>
                <div className="activity-message">{a.message}</div>
                <div className="activity-time">{a.time}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
