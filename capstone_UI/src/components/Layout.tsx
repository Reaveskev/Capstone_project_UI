import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import {
  DashboardIcon,
  CustomersIcon,
  ProductsIcon,
  SalesIcon,
  ReportsIcon,
  HistoryIcon,
  LogoutIcon,
} from "./icons";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: DashboardIcon },
  { to: "/customers", label: "Manage Customers", icon: CustomersIcon },
  { to: "/products", label: "Manage Products", icon: ProductsIcon },
  { to: "/record-sales", label: "Record Sales", icon: SalesIcon },
  { to: "/reports", label: "View Reports", icon: ReportsIcon },
  { to: "/purchase-history", label: "Purchase History", icon: HistoryIcon },
];

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-brand-mark">SB</div>
          <div className="sidebar-brand-name">SalesBridge</div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `sidebar-link${isActive ? " active" : ""}`
              }
            >
              <span className="sidebar-icon">
                <Icon />
              </span>
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">
              {user ? initials(user.name) : "?"}
            </div>
            <div>
              <div className="sidebar-user-name">{user?.name ?? "Guest"}</div>
              <div className="sidebar-user-role">{user?.role ?? ""}</div>
            </div>
          </div>
          <button
            type="button"
            className="sidebar-link logout-link"
            onClick={handleLogout}
          >
            <span className="sidebar-icon">
              <LogoutIcon />
            </span>
            Logout
          </button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
