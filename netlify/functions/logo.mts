import type { Config } from "@netlify/functions";
import { getStore } from "@netlify/blobs";
import { requireAdmin } from "./_auth.mts";

const allowed = new Set(["image/png", "image/jpeg", "image/svg+xml", "image/webp"]);
const store = () => getStore({ name: "site-brand-assets", consistency: "strong" });

export default async (req: Request) => {
  if (req.method === "GET") {
    const key = new URL(req.url).searchParams.get("key");
    if (!key || !/^logo\/[a-f0-9-]+$/.test(key)) return new Response("Not found", { status: 404 });
    const result = await store().getWithMetadata(key, { type: "arrayBuffer" });
    if (!result) return new Response("Not found", { status: 404 });
    return new Response(result.data as ArrayBuffer, { headers: { "Content-Type": String(result.metadata?.contentType || "application/octet-stream"), "Cache-Control": "public, max-age=3600" } });
  }
  if (!(await requireAdmin(req))) return new Response("Unauthorized", { status: 401 });
  if (req.method === "DELETE") {
    const key = new URL(req.url).searchParams.get("key");
    if (key?.startsWith("logo/")) await store().delete(key);
    return new Response(null, { status: 204 });
  }
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  const form = await req.formData();
  const file = form.get("logo");
  if (!(file instanceof File) || !allowed.has(file.type)) return new Response("Choose a PNG, JPG, SVG, or WebP image", { status: 400 });
  if (file.size > 5 * 1024 * 1024) return new Response("Logo must be smaller than 5 MB", { status: 400 });
  const key = `logo/${crypto.randomUUID()}`;
  await store().set(key, await file.arrayBuffer(), { metadata: { contentType: file.type } });
  return Response.json({ key, url: `/api/logo?key=${encodeURIComponent(key)}`, contentType: file.type }, { status: 201 });
};

export const config: Config = { path: "/api/logo" };
