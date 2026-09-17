import React from "react";
import { useSiteData } from "../context/SiteDataContext.jsx";

export default function Contact() {
  const { settings } = useSiteData();

  const cards = [
    {
      icon: "✉️",
      title: "Email",
      value: settings.email,
      href: `mailto:${settings.email}`
    },
    {
      icon: "📞",
      title: "Phone",
      value: settings.phone,
      href: `tel:${settings.phone?.replace(/[^\d+]/g, "")}`
    },
    {
      icon: "🟢",
      title: "WhatsApp",
      value: settings.phone,
      href: `https://wa.me/${settings.whatsapp}`
    },
    {
      icon: "💬",
      title: "Discord",
      value: "Join our server",
      href: settings.discord_invite
    }
  ];

  return (
    <section className="section" id="contact">
      <div className="container">
        <div className="section-head">
          <span className="kicker">Let's talk</span>
          <h2>Ready to start your project?</h2>
          <p>Reach out through whichever channel works best for you.</p>
        </div>

        <div className="contact-grid">
          {cards.map((c) => (
            <a
              className="contact-card"
              key={c.title}
              href={c.href}
              target={c.title === "Discord" ? "_blank" : undefined}
              rel={c.title === "Discord" ? "noreferrer" : undefined}
            >
              <div className="icon">{c.icon}</div>
              <div>
                <h4>{c.title}</h4>
                <p>{c.value}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
