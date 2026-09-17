import React from "react";
import { useSiteData } from "../context/SiteDataContext.jsx";
import { publicImageUrl } from "../supabaseClient.js";

export default function Services() {
  const { categories, services } = useSiteData();

  return (
    <section className="section" id="services">
      <div className="container">
        <div className="section-head">
          <span className="kicker">What we do</span>
          <h2>Services across three crafts</h2>
          <p>
            Every service below is fully editable from the admin panel — add
            new ones, change descriptions, or swap the image any time.
          </p>
        </div>

        {categories.length === 0 && (
          <div className="empty-state">
            No categories yet. Add one from the admin panel.
          </div>
        )}

        {categories.map((cat) => {
          const catServices = services.filter((s) => s.category_id === cat.id);
          return (
            <div className="category-block" key={cat.id}>
              <div className="category-block-head">
                <div>
                  <h3>{cat.name}</h3>
                  {cat.description && <p>{cat.description}</p>}
                </div>
              </div>

              {catServices.length === 0 ? (
                <div className="empty-state">No services in this category yet.</div>
              ) : (
                <div className="service-grid">
                  {catServices.map((svc) => (
                    <div className="service-card" key={svc.id}>
                      {svc.image_path && (
                        <img
                          src={publicImageUrl(svc.image_path)}
                          alt={svc.name}
                          loading="lazy"
                        />
                      )}
                      <h3>{svc.name}</h3>
                      <p>{svc.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
