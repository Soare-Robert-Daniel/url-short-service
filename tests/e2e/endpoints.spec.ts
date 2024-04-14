import { expect, test, describe } from "bun:test";

describe("Endpoints", () => {

  const hostname = "http://localhost:8080";

  test("short URL", async() => {
    const url = "https://example.com";
    const response = await fetch(`${hostname}/shorten`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url }),
    });

    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.shortUrl).toBeDefined();
    expect(data.shortUrl).toMatch(/^[0-9a-zA-Z]+$/);
  });

  test("redirect to the original URL", async() => {
    const url = "https://example.com";
    const response = await fetch(`${hostname}/shorten`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url }),
    });

    const data = await response.json();
    const shortUrl = data.shortUrl;
    const redirectResponse = await fetch(`${hostname}/${shortUrl}`);

    expect(redirectResponse.url).toInclude(url);
  });

  test("get the stats for a short URL", async() => {
    const url = "https://example.com";
    const response = await fetch(`${hostname}/shorten`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url }),
    });

    const data = await response.json();
    const shortUrl = data.shortUrl;

    const statsResponse = await fetch(`${hostname}/${shortUrl}/stats`);
    const stats = await statsResponse.json();

    expect(stats.views).toBeDefined();
    expect(stats.views).toBeGreaterThanOrEqual(0);

    expect(stats.createdAt).toBeDefined();
    expect(new Date(stats.createdAt)).toBeInstanceOf(Date);
  });

  test("missing shortUrl param", async() => {
    const response = await fetch(`${hostname}/`);

    expect(response.status).toBe(404);
  });

  test("short URL invalid", async() => {
    const shortUrl = "invalid";
    const response = await fetch(`${hostname}/${shortUrl}`);

    expect(response.status).toBe(404);
    const data = await response.json();
    expect(data.error).toBe("Short URL not found");
  });

  test("short URL stats not found", async() => {
    const shortUrl = "invalid";
    const response = await fetch(`${hostname}/${shortUrl}/stats`);

    expect(response.status).toBe(404);
    const data = await response.json();
    expect(data.error).toBe("Short URL not found");
  });

  test("URL is required", async() => {
    const response = await fetch(`${hostname}/shorten`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    });

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe("URL is required");
  });

  test("URL duplicate", async() => {
    const url = "https://example.com";
    const response = await fetch(`${hostname}/shorten`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url }),
    });

    const data = await response.json();
    const shortUrl = data.shortUrl;

    const response2 = await fetch(`${hostname}/shorten`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url }),
    });

    const data2 = await response2.json();
    const shortUrl2 = data2.shortUrl;

    expect(shortUrl).toBe(shortUrl2);
  });
});