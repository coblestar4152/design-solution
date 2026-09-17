import React from "react";
import { useSiteData } from "../context/SiteDataContext.jsx";

export default function About() {
  const { settings } = useSiteData();

  return (
    <section className="section" id="about">
      <div className="container about-grid">
        <div className="about-visual" aria-hidden="true">
          D&S
        </div>
        <div className="about-panel">
          <span className="kicker">About the studio</span>
          <h2 style={{ marginBottom: 18 }}>{settings.site_title}</h2>
          <p>{settings.about_text}</p>
        </div>
      </div>
    </section>
  );
}
