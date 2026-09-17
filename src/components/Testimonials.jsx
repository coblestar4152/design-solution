import React from "react";
import { useSiteData } from "../context/SiteDataContext.jsx";
import { publicImageUrl } from "../supabaseClient.js";

export default function Testimonials() {
  const { testimonials } = useSiteData();

  if (testimonials.length === 0) return null;

  return (
    <section className="section" id="testimonials">
      <div className="container">
        <div className="section-head">
          <span className="kicker">Client feedback</span>
          <h2>What clients say</h2>
        </div>

        <div className="testimonial-grid">
          {testimonials.map((t) => (
            <div className="testimonial-card" key={t.id}>
              <div className="testimonial-stars">
                {"★".repeat(t.rating || 5)}
                {"☆".repeat(5 - (t.rating || 5))}
              </div>
              <p className="quote">"{t.content}"</p>
              <div className="testimonial-person">
                {t.avatar_path ? (
                  <img
                    className="testimonial-avatar"
                    src={publicImageUrl(t.avatar_path)}
                    alt={t.name}
                  />
                ) : (
                  <div className="testimonial-avatar" />
                )}
                <div>
                  <div className="name">{t.name}</div>
                  {t.role && <div className="role">{t.role}</div>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
