import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSiteData } from "../../context/SiteDataContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { DEFAULT_CUSTOMIZATION, mergeCustomization } from "../../customizationDefaults.js";

const SECTIONS = ["Theme Editor", "Logo Manager", "Header Editor", "Search Page Editor", "Animation Settings", "Live Preview"];
const ANIMATIONS = ["none", "fade-in", "slide-up", "slide-down", "zoom-in", "scale"];
const FONTS = ["DM Sans", "Manrope", "Outfit", "Lora", "Playfair Display", "Fira Sans"];

export default function CustomizeSite() {
  const { customization, setCustomization, refresh } = useSiteData();
  const { session } = useAuth();
  const [draft, setDraft] = useState(customization);
  const [section, setSection] = useState(SECTIONS[0]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const savedRef = useRef(customization);
  useEffect(() => setDraft(customization), [customization]);
  useEffect(() => { setCustomization(draft); }, [draft, setCustomization]);
  useEffect(() => () => setCustomization(savedRef.current), [setCustomization]);
  const token = session?.access_token;
  const headers = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);
  const patch = (group, key, value) => setDraft((d) => ({ ...d, [group]: { ...d[group], [key]: value } }));

  async function save() {
    setSaving(true); setError(""); setMessage("");
    try {
      const res = await fetch("/api/customization", { method: "PUT", headers: { ...headers, "Content-Type": "application/json" }, body: JSON.stringify(draft) });
      if (!res.ok) throw new Error(await res.text());
      const saved = await res.json();
      if (savedRef.current.logo?.key && savedRef.current.logo.key !== saved.logo?.key) await fetch(`/api/logo?key=${encodeURIComponent(savedRef.current.logo.key)}`, { method: "DELETE", headers });
      savedRef.current = saved; setCustomization(saved); setMessage("Website customization saved and published."); await refresh();
    } catch (e) { setError(e.message || "Unable to save customization."); } finally { setSaving(false); }
  }
  async function uploadLogo(file) {
    if (!file) return;
    setSaving(true); setError("");
    try {
      const data = new FormData(); data.append("logo", file);
      const res = await fetch("/api/logo", { method: "POST", headers, body: data });
      if (!res.ok) throw new Error(await res.text());
      const logo = await res.json();
      setDraft((d) => ({ ...d, logo })); setMessage("Logo uploaded. Save changes to publish it.");
    } catch (e) { setError(e.message); } finally { setSaving(false); }
  }
  async function removeLogo() {
    setDraft((d) => ({ ...d, logo: DEFAULT_CUSTOMIZATION.logo })); setMessage("Logo removed. Save changes to publish the default mark.");
  }
  function navChange(index, field, value) { const navigation = draft.header.navigation.map((n, i) => i === index ? { ...n, [field]: value } : n); patch("header", "navigation", navigation); }

  return <div className="customizer">
    <div className="admin-header"><span className="admin-kicker">Appearance system</span><h1>Website Customizer</h1><p>Shape the public website and preview every change before publishing.</p></div>
    {error && <div className="form-error">{error}</div>}{message && <div className="form-success">{message}</div>}
    <div className="customizer-tabs" role="tablist">{SECTIONS.map((s) => <button className={section === s ? "active" : ""} onClick={() => setSection(s)} key={s}>{s}</button>)}</div>
    <div className="customizer-workspace">
      <div className="customizer-controls">
        {section === "Theme Editor" && <Panel title="Theme Editor" copy="Set the global palette, typography, shape, and depth.">
          <div className="control-grid"><Color label="Primary" value={draft.theme.primary} onChange={(v) => patch("theme", "primary", v)} /><Color label="Secondary" value={draft.theme.secondary} onChange={(v) => patch("theme", "secondary", v)} /><Color label="Background" value={draft.theme.background} onChange={(v) => patch("theme", "background", v)} /><Color label="Surface" value={draft.theme.surface} onChange={(v) => patch("theme", "surface", v)} /><Color label="Text" value={draft.theme.text} onChange={(v) => patch("theme", "text", v)} /><Color label="Muted text" value={draft.theme.mutedText} onChange={(v) => patch("theme", "mutedText", v)} /></div>
          <div className="form-row"><Select label="Mode" value={draft.theme.mode} options={["dark", "light"]} onChange={(v) => setDraft((d) => ({ ...d, theme: { ...d.theme, mode: v, ...(v === "light" ? { background: "#f5f3ee", surface: "#ffffff", text: "#191b20", mutedText: "#606672" } : { background: "#0b0e14", surface: "#151a24", text: "#edeff5", mutedText: "#9aa3b5" }) } }))} /><Select label="Heading font" value={draft.theme.headingFont} options={FONTS} onChange={(v) => patch("theme", "headingFont", v)} /><Select label="Body font" value={draft.theme.bodyFont} options={FONTS} onChange={(v) => patch("theme", "bodyFont", v)} /></div>
          <Range label={`Base font size — ${draft.theme.baseSize}px`} min="14" max="20" value={draft.theme.baseSize} onChange={(v) => patch("theme", "baseSize", +v)} /><Range label={`Border radius — ${draft.theme.radius}px`} min="0" max="28" value={draft.theme.radius} onChange={(v) => patch("theme", "radius", +v)} />
          <div className="form-row"><Select label="Button style" value={draft.theme.buttonStyle} options={["pill", "rounded", "square"]} onChange={(v) => patch("theme", "buttonStyle", v)} /><Select label="Shadows" value={draft.theme.shadow} options={["none", "soft", "strong"]} onChange={(v) => patch("theme", "shadow", v)} /></div>
        </Panel>}
        {section === "Logo Manager" && <Panel title="Logo Manager" copy="PNG, JPG, SVG, or WebP up to 5 MB. The same asset appears in the navbar, footer, and login.">
          <div className="logo-drop">{draft.logo.url ? <img src={draft.logo.url} alt="Current logo" /> : <span className="brand-mark">D&S</span>}<div><strong>{draft.logo.url ? "Custom logo" : "Default brand mark"}</strong><p>Use a transparent image for the most flexible result.</p></div></div>
          <div className="form-actions"><label className="btn btn-primary file-button">{draft.logo.url ? "Replace logo" : "Upload logo"}<input type="file" accept=".png,.jpg,.jpeg,.svg,.webp,image/png,image/jpeg,image/svg+xml,image/webp" onChange={(e) => uploadLogo(e.target.files?.[0])} /></label>{draft.logo.url && <button className="btn btn-outline" type="button" onClick={removeLogo}>Remove & restore default</button>}</div>
        </Panel>}
        {section === "Header Editor" && <Panel title="Header Editor" copy="Customize desktop and mobile navigation from one place.">
          <Color label="Header background" value={draft.header.background} onChange={(v) => patch("header", "background", v)} /><Text label="Website name" value={draft.header.siteName} onChange={(v) => patch("header", "siteName", v)} /><Text label="Header tagline" value={draft.header.tagline} onChange={(v) => patch("header", "tagline", v)} /><Text label="Search placeholder" value={draft.header.searchPlaceholder} onChange={(v) => patch("header", "searchPlaceholder", v)} />
          <div className="form-row"><Select label="Layout" value={draft.header.layout} options={["standard", "compact", "centered"]} onChange={(v) => patch("header", "layout", v)} /><Select label="Alignment" value={draft.header.alignment} options={["space-between", "center", "flex-start"]} onChange={(v) => patch("header", "alignment", v)} /><Select label="Mobile style" value={draft.header.mobileStyle} options={["drawer", "stacked"]} onChange={(v) => patch("header", "mobileStyle", v)} /></div>
          <h3 className="subheading">Navigation items</h3>{draft.header.navigation.map((n, i) => <div className="nav-edit-row" key={i}><input aria-label="Label" value={n.label} onChange={(e) => navChange(i, "label", e.target.value)} /><input aria-label="Link" value={n.href} onChange={(e) => navChange(i, "href", e.target.value)} /><button type="button" onClick={() => patch("header", "navigation", draft.header.navigation.filter((_, x) => x !== i))}>Remove</button></div>)}<button className="icon-btn" type="button" onClick={() => patch("header", "navigation", [...draft.header.navigation, { label: "New item", href: "/" }])}>Add navigation item</button>
        </Panel>}
        {section === "Search Page Editor" && <Panel title="Search Page Editor" copy="Control the editable masthead users see above search results."><Text label="Results page title" value={draft.search.title} onChange={(v) => patch("search", "title", v)} /><div className="control-grid"><Color label="Page background" value={draft.search.background} onChange={(v) => patch("search", "background", v)} /><Color label="Accent" value={draft.search.accent} onChange={(v) => patch("search", "accent", v)} /></div></Panel>}
        {section === "Animation Settings" && <Panel title="Animation Settings" copy="Motion uses only transform and opacity and respects reduced-motion preferences.">
          <Toggle label="Enable animations globally" checked={draft.animations.enabled} onChange={(v) => patch("animations", "enabled", v)} /><Toggle label="Scroll-based reveals" checked={draft.animations.scrollReveal} onChange={(v) => patch("animations", "scrollReveal", v)} /><Select label="Default entrance" value={draft.animations.entrance} options={ANIMATIONS} onChange={(v) => patch("animations", "entrance", v)} /><Range label={`Duration — ${draft.animations.duration}ms`} min="150" max="1500" step="50" value={draft.animations.duration} onChange={(v) => patch("animations", "duration", +v)} /><Range label={`Delay — ${draft.animations.delay}ms`} min="0" max="600" step="20" value={draft.animations.delay} onChange={(v) => patch("animations", "delay", +v)} />
          <div className="control-grid"><Select label="Header" value={draft.animations.header} options={ANIMATIONS} onChange={(v) => patch("animations", "header", v)} /><Select label="Hero" value={draft.animations.hero} options={ANIMATIONS} onChange={(v) => patch("animations", "hero", v)} /><Select label="Cards" value={draft.animations.cards} options={ANIMATIONS} onChange={(v) => patch("animations", "cards", v)} /><Select label="Footer" value={draft.animations.footer} options={ANIMATIONS} onChange={(v) => patch("animations", "footer", v)} /></div>
          <div className="control-grid"><Select label="Button hover" value={draft.animations.buttonHover} options={["none", "lift", "scale"]} onChange={(v) => patch("animations", "buttonHover", v)} /><Select label="Card hover" value={draft.animations.cardHover} options={["none", "lift", "scale"]} onChange={(v) => patch("animations", "cardHover", v)} /><Select label="Image hover" value={draft.animations.imageHover} options={["none", "zoom", "scale"]} onChange={(v) => patch("animations", "imageHover", v)} /><Select label="Nav hover" value={draft.animations.navHover} options={["none", "underline", "lift"]} onChange={(v) => patch("animations", "navHover", v)} /></div>
          <button className={`animation-demo animate-${draft.animations.entrance}`} key={`${draft.animations.entrance}-${draft.animations.duration}`}>Replay animation preview</button>
        </Panel>}
        {section === "Live Preview" && <Panel title="Live Preview" copy="This responsive canvas uses your unsaved draft settings."><p className="preview-note">Resize the browser to inspect desktop and mobile behavior.</p></Panel>}
      </div>
      <Preview draft={draft} />
    </div>
    <div className="customizer-savebar"><button type="button" className="btn btn-outline" onClick={() => { setDraft(mergeCustomization(DEFAULT_CUSTOMIZATION)); setMessage("Defaults loaded in preview. Save to publish them."); }}>Reset to Default</button><span>Changes remain in preview until saved.</span><button type="button" className="btn btn-primary" disabled={saving} onClick={save}>{saving ? "Saving…" : "Save Changes"}</button></div>
  </div>;
}

function Panel({ title, copy, children }) { return <section className="admin-panel customizer-panel"><h2>{title}</h2><p className="panel-copy">{copy}</p>{children}</section>; }
function Text({ label, value, onChange }) { return <div className="field"><label>{label}</label><input value={value} onChange={(e) => onChange(e.target.value)} /></div>; }
function Select({ label, value, options, onChange }) { return <div className="field"><label>{label}</label><select value={value} onChange={(e) => onChange(e.target.value)}>{options.map((x) => <option key={x}>{x}</option>)}</select></div>; }
function Color({ label, value, onChange }) { return <div className="field color-field"><label>{label}</label><div><input type="color" value={value} onChange={(e) => onChange(e.target.value)} /><input value={value} pattern="#[0-9a-fA-F]{6}" onChange={(e) => onChange(e.target.value)} /></div></div>; }
function Range(props) { return <div className="field"><label>{props.label}</label><input type="range" {...props} /></div>; }
function Toggle({ label, checked, onChange }) { return <label className="toggle-row"><span>{label}</span><input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} /></label>; }
function Preview({ draft }) { return <aside className="live-preview"><div className="preview-chrome"><i /><i /><i /><span>Live preview</span></div><div className="preview-site" style={{ background: draft.theme.background, color: draft.theme.text, fontFamily: draft.theme.bodyFont }}><header style={{ background: draft.header.background }}><div className="preview-brand">{draft.logo.url ? <img src={draft.logo.url} alt="" /> : <b>D&S</b>}<span>{draft.header.siteName}</span></div><nav>{draft.header.navigation.slice(0, 3).map((n) => <span key={n.label}>{n.label}</span>)}</nav></header><main><div><small>{draft.header.tagline}</small><h2 style={{ fontFamily: draft.theme.headingFont }}>Thoughtful design,<br />built to stand out.</h2><p>Color, type, shape, and motion stay connected across every page.</p><button style={{ background: draft.theme.primary, borderRadius: draft.theme.buttonStyle === "pill" ? 99 : draft.theme.buttonStyle === "square" ? 0 : draft.theme.radius }}>Explore our work</button></div><div className="preview-cards"><article style={{ background: draft.theme.surface, borderRadius: draft.theme.radius }} /><article style={{ background: draft.theme.secondary, borderRadius: draft.theme.radius }} /></div></main></div></aside>; }
