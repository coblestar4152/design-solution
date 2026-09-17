import type { Config } from "@netlify/functions";
import { eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { siteCustomization } from "../../db/schema.js";
import { DEFAULT_CUSTOMIZATION, mergeCustomization } from "../../src/customizationDefaults.js";
import { requireAdmin } from "./_auth.mts";

export default async (req: Request) => {
  if (req.method === "GET") {
    const [row] = await db.select().from(siteCustomization).where(eq(siteCustomization.id, 1)).limit(1);
    return Response.json(mergeCustomization(row?.settings || DEFAULT_CUSTOMIZATION), { headers: { "Cache-Control": "no-store" } });
  }
  if (req.method !== "PUT") return new Response("Method not allowed", { status: 405 });
  if (!(await requireAdmin(req))) return new Response("Unauthorized", { status: 401 });
  const settings = mergeCustomization(await req.json());
  const encoded = JSON.stringify(settings);
  if (encoded.length > 100000) return new Response("Settings are too large", { status: 400 });
  await db.insert(siteCustomization).values({ id: 1, settings, updatedAt: new Date() })
    .onConflictDoUpdate({ target: siteCustomization.id, set: { settings, updatedAt: new Date() } });
  return Response.json(settings);
};

export const config: Config = { path: "/api/customization" };
