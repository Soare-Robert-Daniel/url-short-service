import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const urls = sqliteTable("urls", {
  id: integer("id").primaryKey(),
  shortUrl: text("short_url"),
  originalUrl: text("original_url"),
  views: integer("views").default(0),
  createdAt: text("created_at"),
});