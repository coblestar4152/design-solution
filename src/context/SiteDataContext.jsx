import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase } from "../supabaseClient";

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

  const refresh = useCallback(async () => {
    setLoading(true);
    const [settingsRes, categoriesRes, servicesRes, portfolioRes, testimonialsRes] =
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
          .order("sort_order", { ascending: true })
      ]);

    if (settingsRes.data) setSettings(settingsRes.data);
    setCategories(categoriesRes.data || []);
    setServices(servicesRes.data || []);
    setPortfolio(portfolioRes.data || []);
    setTestimonials(testimonialsRes.data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const value = {
    settings,
    categories,
    services,
    portfolio,
    testimonials,
    loading,
    refresh
  };

  return <SiteDataContext.Provider value={value}>{children}</SiteDataContext.Provider>;
}

export function useSiteData() {
  const ctx = useContext(SiteDataContext);
  if (!ctx) throw new Error("useSiteData must be used inside SiteDataProvider");
  return ctx;
}
