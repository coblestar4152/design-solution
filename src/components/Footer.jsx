import React from "react";
import { useSiteData } from "../context/SiteDataContext.jsx";

export default function Footer() {
  const { settings } = useSiteData();
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container footer-inner">
        <span>
          © {year} {settings.site_title}. All rights reserved.
        </span>
        <div className="footer-links">
          <a href="#services">Services</a>
          <a href="#portfolio">Portfolio</a>
          <a href="#contact">Contact</a>
          <a href="/admin/login">Admin</a>
        </div>
      </div>
    </footer>
  );
}
