# url-shortener

A simple URL shortener service made with Bun, Express and Drizzle ORM.

The short URL is generated using the base62 encoding of the auto-incremented ID of the URL.

## Getting Started

### Installation

> [!NOTE]
> You need to have [Bun](https://bun.sh) installed to run this project.

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

> [!NOTE]
> You need to run the database migration before running the server.

This project was created using `bun init` in bun v1.1.3. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.

### Database

Create migration:

```bash
bunx drizzle-kit generate:sqlite --schema ./schema.ts
```

Run migration:

```bash
bun run migrate.ts
```

### Testing

To run tests:

```bash
bun test
```

Unit tests are located in the `test/unit` directory. For E2E tests, they are located in the `test/e2e` directory.

## Endpoints

### POST /shorten

Shorten a URL.

#### Request

```json
{
  "url": "https://example.com"
}
```

#### Response

```json
{
  "shortUrl": "http://localhost:3000/abc123"
}
```

Example:

```bash
curl -X POST http://localhost:3000/shorten -d '{"url": "https://example.com"}' -H 'Content-Type: application/json'
```

### GET /:shortUrl

Redirect to the original URL.

Example:

```bash
curl http://localhost:3000/abc123
```

### GET /:shortUrl/stats

Get the stats of a shortened URL.

#### Response

```json
{
  "views": 1,
  "createdAt": "2024-04-14T16:57:33.677Z",
}
```

Example:

```bash
curl http://localhost:3000/abc123/stats
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

