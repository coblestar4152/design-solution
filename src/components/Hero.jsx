import React from "react";
import { useSiteData } from "../context/SiteDataContext.jsx";

export default function Hero() {
  const { settings, customization } = useSiteData();

  return (
    <section className={`hero animate-${customization.animations.hero}`} id="top">
      <div className="hero-glow" />
      <div className="container hero-grid">
        <div>
          <span className="hero-eyebrow">
            <span className="dot" />
            Now booking new projects
          </span>
          <h1>{settings.tagline}</h1>
          <p className="lead">
            One studio, three crafts: sharp video and design work, custom
            Minecraft builds, and Discord servers that run themselves.
          </p>
          <div className="hero-cta">
            <a href="#contact" className="btn btn-primary">
              Start a project
            </a>
            <a href="#portfolio" className="btn btn-outline">
              View our work
            </a>
          </div>
        </div>

        <div className="hero-stack">
          <div className="hero-tile">
            <div className="hero-tile-icon">🎬</div>
            <div>
              <h4>Video & Design</h4>
              <p>Editing, motion graphics, thumbnails & branding</p>
            </div>
          </div>
          <div className="hero-tile">
            <div className="hero-tile-icon">⛏️</div>
            <div>
              <h4>Minecraft Development</h4>
              <p>Skins, servers, plugins & custom maps</p>
            </div>
          </div>
          <div className="hero-tile">
            <div className="hero-tile-icon">💬</div>
            <div>
              <h4>Discord Development</h4>
              <p>Setup, bots, moderation & server management</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
