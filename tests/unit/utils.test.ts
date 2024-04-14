import { expect, test, describe } from "bun:test";
import { toBase62 } from "../../utils";

describe("Utils", () => {
  test("base62 encoding for large number", () => {
    expect(toBase62(1234567890)).toBe("1ly7vk");
    expect(toBase62(9876543210)).toBe("aMoY42");
  });

  test("base62 encoding for small number", () => {
    expect(toBase62(1)).toBe("1");
    expect(toBase62(10)).toBe("a");
    expect(toBase62(30)).toBe("u");
    expect(toBase62(61)).toBe("Z");
  });
});