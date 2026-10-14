import { describe, it, expect } from "vitest";
import { daysAgo } from "./dates";

describe("daysAgo", () => {
  it("returns 0 for a sale made right now", () => {
    const now = new Date();

    expect(daysAgo(now.toISOString())).toBe(0);
  });
  it("returns 1 for a sale made yesterday", () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    expect(daysAgo(yesterday.toISOString())).toBe(1);
  });

  it("returns 1 for a sale made right before midnight", () => {
    const yesterday = new Date();

    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(23, 30, 0, 0);

    expect(daysAgo(yesterday.toISOString())).toBe(1);
  });
});
