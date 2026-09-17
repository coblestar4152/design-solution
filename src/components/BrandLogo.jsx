import React from "react";
import { useSiteData } from "../context/SiteDataContext.jsx";

export default function BrandLogo({ compact = false }) {
  const { customization } = useSiteData();
  const { logo, header } = customization;
  return (
    <span className="brand-identity">
      {logo?.url ? <img className="site-logo" src={logo.url} alt={`${header.siteName} logo`} /> : <span className="brand-mark">D&S</span>}
      {!compact && <span>{header.siteName}</span>}
    </span>
  );
}
