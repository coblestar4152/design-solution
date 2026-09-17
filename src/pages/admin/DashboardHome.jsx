import React from "react";
import { Link } from "react-router-dom";
import { useSiteData } from "../../context/SiteDataContext.jsx";

export default function DashboardHome() {
  const { categories, services, portfolio, testimonials } = useSiteData();

  const stats = [
    { label: "Categories", value: categories.length, to: "/admin/categories" },
    { label: "Services", value: services.length, to: "/admin/services" },
    { label: "Portfolio projects", value: portfolio.length, to: "/admin/portfolio" },
    { label: "Testimonials", value: testimonials.length, to: "/admin/testimonials" }
  ];

  return (
    <div>
      <div className="admin-header">
        <h1>Dashboard</h1>
        <p>An overview of your website's content.</p>
      </div>

      <div className="dashboard-stats">
        {stats.map((s) => (
          <Link to={s.to} key={s.label} className="stat-card" style={{ display: "block" }}>
            <div className="num">{s.value}</div>
            <div className="label">{s.label}</div>
          </Link>
        ))}
      </div>

      <div className="admin-panel">
        <h2>Quick start</h2>
        <p style={{ color: "var(--text-muted)", marginBottom: 14 }}>
          Use the sidebar to manage every part of the site. Changes appear on the
          live site immediately — no code, no redeploys.
        </p>
        <ul style={{ color: "var(--text-muted)", paddingLeft: 20, lineHeight: 1.9 }}>
          <li><strong>Site Settings</strong> — title, tagline, about text, and contact details.</li>
          <li><strong>Categories</strong> — the service groupings shown on the homepage.</li>
          <li><strong>Services</strong> — individual services with images and descriptions.</li>
          <li><strong>Portfolio</strong> — project gallery, filterable by category.</li>
          <li><strong>Testimonials</strong> — client quotes and ratings.</li>
        </ul>
      </div>
    </div>
  );
}
