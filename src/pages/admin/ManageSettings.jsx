import React, { useState } from "react";
import { useSiteData } from "../../context/SiteDataContext.jsx";
import { supabase } from "../../supabaseClient.js";

export default function ManageSettings() {
  const { settings, refresh } = useSiteData();
  const [form, setForm] = useState(settings);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Keep the form in sync if settings load after mount
  React.useEffect(() => {
    setForm(settings);
  }, [settings]);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const { error: updateError } = await supabase
        .from("site_settings")
        .update({
          site_title: form.site_title,
          tagline: form.tagline,
          about_text: form.about_text,
          phone: form.phone,
          whatsapp: form.whatsapp,
          email: form.email,
          discord_invite: form.discord_invite
        })
        .eq("id", 1);

      if (updateError) throw updateError;

      setMessage("Settings saved.");
      await refresh();
    } catch (err) {
      setError(err.message || "Something went wrong while saving.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="admin-header">
        <h1>Site settings</h1>
        <p>Global content shown across the website.</p>
      </div>

      {error && <div className="form-error">{error}</div>}
      {message && <div className="form-success">{message}</div>}

      <form onSubmit={handleSubmit}>
        <div className="admin-panel">
          <h2>Branding</h2>

          <div className="settings-notice">Logo, colors, navigation, search, and motion are managed in the <a href="/admin/customize">Website Customizer</a>.</div>

          <div className="field">
            <label htmlFor="site_title">Site title</label>
            <input
              id="site_title"
              value={form.site_title || ""}
              onChange={(e) => update("site_title", e.target.value)}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="tagline">Hero tagline</label>
            <textarea
              id="tagline"
              value={form.tagline || ""}
              onChange={(e) => update("tagline", e.target.value)}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="about_text">About section text</label>
            <textarea
              id="about_text"
              rows={6}
              value={form.about_text || ""}
              onChange={(e) => update("about_text", e.target.value)}
              required
            />
          </div>
        </div>

        <div className="admin-panel">
          <h2>Contact details</h2>

          <div className="form-row">
            <div className="field">
              <label htmlFor="phone">Phone (displayed)</label>
              <input
                id="phone"
                value={form.phone || ""}
                onChange={(e) => update("phone", e.target.value)}
                placeholder="+1 (555) 000-0000"
              />
            </div>
            <div className="field">
              <label htmlFor="whatsapp">WhatsApp number (digits only, with country code)</label>
              <input
                id="whatsapp"
                value={form.whatsapp || ""}
                onChange={(e) => update("whatsapp", e.target.value)}
                placeholder="15550000000"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={form.email || ""}
                onChange={(e) => update("email", e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="discord_invite">Discord invite link</label>
              <input
                id="discord_invite"
                value={form.discord_invite || ""}
                onChange={(e) => update("discord_invite", e.target.value)}
                placeholder="https://discord.gg/your-invite"
              />
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "Saving…" : "Save settings"}
          </button>
        </div>
      </form>
    </div>
  );
}
