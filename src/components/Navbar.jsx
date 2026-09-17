import React, { useState } from "react";
import { useSiteData } from "../context/SiteDataContext.jsx";

const LINKS = [
  { href: "#services", label: "Services" },
  { href: "#portfolio", label: "Portfolio" },
  { href: "#about", label: "About" },
  { href: "#testimonials", label: "Testimonials" },
  { href: "#contact", label: "Contact" }
];

export default function Navbar() {
  const { settings } = useSiteData();
  const [open, setOpen] = useState(false);

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <a href="#top" className="brand">
          <span className="brand-mark">D&S</span>
          <span>{settings.site_title}</span>
        </a>

        <ul className="nav-links">
          {LINKS.map((l) => (
            <li key={l.href}>
              <a href={l.href}>{l.label}</a>
            </li>
          ))}
        </ul>

        <div className="nav-actions">
          <a href="#contact" className="btn btn-primary">
            Get a quote
          </a>
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

      <div className={`mobile-menu ${open ? "open" : ""}`}>
        {LINKS.map((l) => (
          <a key={l.href} href={l.href} onClick={() => setOpen(false)}>
            {l.label}
          </a>
        ))}
        <a href="#contact" onClick={() => setOpen(false)}>
          Get a quote
        </a>
      </div>
    </header>
  );
}
