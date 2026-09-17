export const DEFAULT_CUSTOMIZATION = {
  theme: {
    mode: "dark", primary: "#6c5ce7", secondary: "#00d9c0", background: "#0b0e14",
    surface: "#151a24", text: "#edeff5", mutedText: "#9aa3b5", headingFont: "Manrope",
    bodyFont: "DM Sans", baseSize: 16, headingScale: 1, radius: 14, buttonStyle: "pill",
    shadow: "soft"
  },
  header: {
    background: "#0b0e14", siteName: "Design & Solution", tagline: "Ideas built with craft.",
    alignment: "space-between", layout: "standard", animation: "fade-in", mobileStyle: "drawer",
    searchPlaceholder: "Search services and projects…",
    navigation: [
      { label: "Services", href: "/#services" }, { label: "Portfolio", href: "/#portfolio" },
      { label: "About", href: "/#about" }, { label: "Testimonials", href: "/#testimonials" },
      { label: "Contact", href: "/#contact" }
    ]
  },
  search: { title: "Search results", background: "#12161f", accent: "#00d9c0" },
  animations: {
    enabled: true, entrance: "fade-in", duration: 550, delay: 60, scrollReveal: true,
    header: "slide-down", hero: "fade-in", cards: "slide-up", footer: "fade-in",
    buttonHover: "lift", cardHover: "lift", imageHover: "zoom", navHover: "underline"
  },
  logo: { key: null, url: null, contentType: null }
};

export function mergeCustomization(value = {}) {
  return {
    ...DEFAULT_CUSTOMIZATION, ...value,
    theme: { ...DEFAULT_CUSTOMIZATION.theme, ...value.theme },
    header: { ...DEFAULT_CUSTOMIZATION.header, ...value.header },
    search: { ...DEFAULT_CUSTOMIZATION.search, ...value.search },
    animations: { ...DEFAULT_CUSTOMIZATION.animations, ...value.animations },
    logo: { ...DEFAULT_CUSTOMIZATION.logo, ...value.logo }
  };
}
