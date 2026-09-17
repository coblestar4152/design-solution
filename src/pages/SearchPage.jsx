import React from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import { useSiteData } from "../context/SiteDataContext.jsx";

export default function SearchPage() {
  const [params] = useSearchParams();
  const query = (params.get("q") || "").toLowerCase();
  const { services, portfolio, customization } = useSiteData();
  const results = [
    ...services.map((x) => ({ title: x.name, text: x.description, href: "/#services", type: "Service" })),
    ...portfolio.map((x) => ({ title: x.title, text: x.description, href: "/#portfolio", type: "Project" }))
  ].filter((x) => `${x.title} ${x.text}`.toLowerCase().includes(query));
  return <><Navbar /><main className="search-page" style={{ background: customization.search.background, "--accent-teal": customization.search.accent }}>
    <header className="search-hero"><span className="kicker">{query ? `Results for “${params.get("q")}”` : "Website search"}</span><h1>{customization.search.title}</h1><p>{results.length} {results.length === 1 ? "match" : "matches"} found</p></header>
    <section className="search-results">{results.map((item, i) => <a className="search-result reveal" href={item.href} key={`${item.type}-${i}`}><span>{item.type}</span><h2>{item.title}</h2><p>{item.text}</p></a>)}{query && !results.length && <div className="empty-state">No matching services or projects. Try a broader search.</div>}</section>
  </main><Footer /></>;
}
