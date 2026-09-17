import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

const NAV = [
  { to: "/admin", label: "Dashboard", end: true },
  { to: "/admin/settings", label: "Site Settings" },
  { to: "/admin/categories", label: "Categories" },
  { to: "/admin/services", label: "Services" },
  { to: "/admin/portfolio", label: "Portfolio" },
  { to: "/admin/testimonials", label: "Testimonials" }
];

export default function AdminLayout() {
  const { signOut, user } = useAuth();

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="brand">
          <span className="brand-mark">D&S</span>
          <span>Admin</span>
        </div>

        <nav className="admin-nav">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <a className="admin-view-site" href="/" target="_blank" rel="noreferrer">
          View live site ↗
        </a>
        <button className="admin-signout" onClick={signOut}>
          Sign out {user?.email ? `(${user.email})` : ""}
        </button>
      </aside>

      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
