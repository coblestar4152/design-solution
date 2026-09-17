import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSiteData } from "../context/SiteDataContext.jsx";
import BrandLogo from "./BrandLogo.jsx";

export default function Navbar() {
  const { customization } = useSiteData();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const { header, animations } = customization;
  const LINKS = header.navigation;
  function search(e) { e.preventDefault(); if (query.trim()) navigate(`/search?q=${encodeURIComponent(query.trim())}`); }

  return (
    <header className={`navbar animate-${animations.header}`} data-layout={header.layout}>
      <div className="navbar-inner" style={{ justifyContent: header.alignment }}>
        <a href="/#top" className="brand"><BrandLogo /><span className="brand-tagline">{header.tagline}</span></a>

        <ul className="nav-links">
          {LINKS.map((l) => (
            <li key={l.href}>
              <a href={l.href}>{l.label}</a>
            </li>
          ))}
        </ul>

        <div className="nav-actions">
          <form className="nav-search" onSubmit={search}><input aria-label="Search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={header.searchPlaceholder} /></form>
          <button
            className="nav-toggle"
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? "✕" : "☰"}
          </button>
        </div>
      </div>

      <div className={`mobile-menu ${open ? "open" : ""}`} data-mobile={header.mobileStyle}>
        {LINKS.map((l) => (
          <a key={l.href} href={l.href} onClick={() => setOpen(false)}>
            {l.label}
          </a>
        ))}
        <form className="mobile-search" onSubmit={search}><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={header.searchPlaceholder} /></form>
      </div>
    </header>
  );
}
