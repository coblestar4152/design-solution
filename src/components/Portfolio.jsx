import React, { useMemo, useState } from "react";
import { useSiteData } from "../context/SiteDataContext.jsx";
import { publicImageUrl } from "../supabaseClient.js";

const FILTERS = [
  { key: "all", label: "All work" },
  { key: "video-design", label: "Video & Graphic Design" },
  { key: "minecraft", label: "Minecraft Development" },
  { key: "discord", label: "Discord Development" }
];

export default function Portfolio() {
  const { portfolio } = useSiteData();
  const [active, setActive] = useState("all");

  const filtered = useMemo(() => {
    if (active === "all") return portfolio;
    return portfolio.filter((p) => p.category === active);
  }, [portfolio, active]);

  return (
    <section className="section" id="portfolio">
      <div className="container">
        <div className="section-head">
          <span className="kicker">Selected work</span>
          <h2>Portfolio</h2>
          <p>Browse projects by category. Every entry is managed from the admin panel.</p>
        </div>

        <div className="category-tabs">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              className={`category-tab ${active === f.key ? "active" : ""}`}
              onClick={() => setActive(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            No projects here yet — add some from the admin panel.
          </div>
        ) : (
          <div className="portfolio-grid">
            {filtered.map((p) => (
              <div className="portfolio-card" key={p.id}>
                {p.image_path && (
                  <img
                    className="thumb"
                    src={publicImageUrl(p.image_path)}
                    alt={p.title}
                    loading="lazy"
                  />
                )}
                <div className="info">
                  <span className="tag">
                    {FILTERS.find((f) => f.key === p.category)?.label || p.category}
                  </span>
                  <h4>{p.title}</h4>
                  <p>{p.description}</p>
                  {p.project_link && (
                    <a
                      className="link"
                      href={p.project_link}
                      target="_blank"
                      rel="noreferrer"
                    >
                      View project ↗
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
