/**
 * This is a simple URL shortener service that allows users to create short URLs.
 * 
 * The service has the following endpoints:
 * - POST /shorten: Create a short URL
 * - GET /:shortUrl: Redirect to the original URL
 * - GET /:shortUrl/stats: Get the stats for a short URL
 */

import express, { Request, Response } from "express";
import { eq } from "drizzle-orm";
import { LRUCache } from 'lru-cache'

import * as schema from "./schema";
import { toBase62 } from "./utils";
import { db } from "./db";

const app = express();
const port = 8080;
app.use(express.json());

const cache = new LRUCache<string, {id: number, originalUrl: string}>({ max: 1000 });

// Create a short URL
app.post("/shorten", async (req: Request, res: Response) => {
    // Insert the URL into the database and use the ID as the short URL by converting it to base62.

    if (!req.body.url) {
        res.status(400).json({ error: "URL is required" });
        return;
    }

    const originalUrl = req.body.url;
    const duplicate = db.select().from(schema.urls).where(eq(schema.urls.originalUrl, originalUrl)).get();

    let shortUrl = "";

    if (!duplicate) {
        const row = await db.insert(schema.urls).values(
            {
                originalUrl,
                views: 0,
                createdAt: new Date().toISOString(),
            }
        ).returning();

        shortUrl = toBase62(row[0].id);
        await db.update(schema.urls).set({ shortUrl }).where(eq(schema.urls.id, row[0].id));
    } else {
        shortUrl = toBase62(duplicate.id);
    }

    res.json({ shortUrl });
});

// Redirect to the original URL
app.get("/:shortUrl", async (req: Request, res: Response) => {

   
    const shortUrl = req.params.shortUrl;

    if (!shortUrl) {
        res.status(404).json({ error: "Short URL not given" });
        return;
    }

    const row = cache.has(shortUrl) ? cache.get(shortUrl) : db.select().from(schema.urls).where(eq(schema.urls.shortUrl, shortUrl)).get();

    if (!row || !row.originalUrl ) {
        res.status(404).json({ error: "Short URL not found" });
        return;
    }

    cache.set(shortUrl, {id: row.id, originalUrl: row.originalUrl});

    res.setHeader("Location", row.originalUrl);
    res.redirect(302, row.originalUrl);

    incrementViews(row.id);
});

function incrementViews(id: number) {
    const row = db.select().from(schema.urls).where(eq(schema.urls.id, id)).get();
    if (row) {
        db.update(schema.urls).set({ views: (row.views ?? 0) + 1 }).where(eq(schema.urls.id, id));
    }
}

// Get the stats for a short URL
app.get("/:shortUrl/stats", async (req: Request, res: Response) => {
    const shortUrl = req.params.shortUrl;
    const row = db.select().from(schema.urls).where(eq(schema.urls.shortUrl, shortUrl)).get();

    if (!row || !row.originalUrl) {
        res.status(404).json({ error: "Short URL not found" });
        return;
    }

    res.json({ views: row.views, createdAt: row.createdAt });
});


app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});
