import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase } from "../supabaseClient";
import { DEFAULT_CUSTOMIZATION, mergeCustomization } from "../customizationDefaults.js";

const SiteDataContext = createContext(null);

const DEFAULT_SETTINGS = {
  id: 1,
  site_title: "Design & Solution",
  tagline: "Creative edits, Minecraft worlds & Discord communities — built to stand out.",
  about_text:
    "Design & Solution is a creative studio blending video editing, graphic design, Minecraft development, and Discord server craftsmanship into one team. Replace this text from the admin panel with your own story.",
  phone: "+1 (555) 000-0000",
  whatsapp: "15550000000",
  email: "hello@example.com",
  discord_invite: "https://discord.gg/example",
  logo_path: null
};

export function SiteDataProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [portfolio, setPortfolio] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [customization, setCustomization] = useState(DEFAULT_CUSTOMIZATION);

  const refresh = useCallback(async () => {
    setLoading(true);
    const [settingsRes, categoriesRes, servicesRes, portfolioRes, testimonialsRes, customizationRes] =
      await Promise.all([
        supabase.from("site_settings").select("*").eq("id", 1).maybeSingle(),
        supabase.from("categories").select("*").order("sort_order", { ascending: true }),
        supabase.from("services").select("*").order("sort_order", { ascending: true }),
        supabase
          .from("portfolio_projects")
          .select("*")
          .order("sort_order", { ascending: true }),
        supabase
          .from("testimonials")
          .select("*")
          .order("sort_order", { ascending: true }),
        fetch("/api/customization", { cache: "no-store" }).then((r) => r.ok ? r.json() : DEFAULT_CUSTOMIZATION).catch(() => DEFAULT_CUSTOMIZATION)
      ]);

    if (settingsRes.data) setSettings(settingsRes.data);
    setCategories(categoriesRes.data || []);
    setServices(servicesRes.data || []);
    setPortfolio(portfolioRes.data || []);
    setTestimonials(testimonialsRes.data || []);
    setCustomization(mergeCustomization(customizationRes));
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const t = customization.theme;
    const root = document.documentElement;
    const vars = {
      "--bg": t.background, "--bg-elevated": t.surface, "--bg-card": t.surface,
      "--text": t.text, "--text-muted": t.mutedText, "--accent-violet": t.primary,
      "--accent-teal": t.secondary, "--radius-sm": `${Math.max(4, t.radius - 6)}px`,
      "--radius-md": `${t.radius}px`, "--radius-lg": `${t.radius + 8}px`,
      "--font-display": `'${t.headingFont}', sans-serif`, "--font-body": `'${t.bodyFont}', sans-serif`,
      "--base-size": `${t.baseSize}px`, "--heading-scale": t.headingScale,
      "--header-bg": customization.header.background,
      "--site-shadow": t.shadow === "none" ? "none" : t.shadow === "strong" ? "0 24px 70px rgba(0,0,0,.55)" : "0 16px 45px rgba(0,0,0,.3)"
      ,"--motion-duration": `${customization.animations.duration}ms`, "--motion-delay": `${customization.animations.delay}ms`
    };
    Object.entries(vars).forEach(([key, value]) => root.style.setProperty(key, value));
    document.body.dataset.mode = t.mode;
    document.body.dataset.button = t.buttonStyle;
    document.body.dataset.animations = customization.animations.enabled ? "on" : "off";
    document.body.dataset.buttonHover = customization.animations.buttonHover;
    document.body.dataset.cardHover = customization.animations.cardHover;
    document.body.dataset.imageHover = customization.animations.imageHover;
    document.body.dataset.navHover = customization.animations.navHover;
  }, [customization]);

  useEffect(() => {
    if (!customization.animations.enabled || !customization.animations.scrollReveal) return;
    const selector = ".section-head,.service-card,.portfolio-card,.testimonial-card,.contact-card,.about-panel,.about-visual,.search-result";
    const nodes = [...document.querySelectorAll(selector)];
    nodes.forEach((node) => node.classList.add("reveal", `animate-${customization.animations.cards}`));
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.add("is-visible"); observer.unobserve(entry.target); } }), { threshold: 0.12 });
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [customization, loading]);

  const value = {
    settings,
    categories,
    services,
    portfolio,
    testimonials,
    loading,
    refresh,
    customization,
    setCustomization
  };

  return <SiteDataContext.Provider value={value}>{children}</SiteDataContext.Provider>;
}

export function useSiteData() {
  const ctx = useContext(SiteDataContext);
  if (!ctx) throw new Error("useSiteData must be used inside SiteDataProvider");
  return ctx;
}
