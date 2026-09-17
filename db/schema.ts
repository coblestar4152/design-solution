import { integer, jsonb, pgTable, timestamp } from "drizzle-orm/pg-core";

export const siteCustomization = pgTable("site_customization", {
  id: integer("id").primaryKey(),
  settings: jsonb("settings").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
