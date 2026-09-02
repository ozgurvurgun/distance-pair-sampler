import { describe, expect, it } from "vitest";
import { CryptoRandomSource } from "../../src/infrastructure/random.js";

describe("CryptoRandomSource", () => {
  it("stays inside [0, maxExclusive)", () => {
    const source = new CryptoRandomSource();
    const draws = Array.from({ length: 400 }, () => source.nextInt(8));

    expect(draws.every((value) => Number.isInteger(value) && value >= 0 && value < 8)).toBe(
      true
    );
    expect(new Set(draws).size).toBeGreaterThan(1);
  });

  it("rejects a non-positive bound", () => {
    expect(() => new CryptoRandomSource().nextInt(0)).toThrow(RangeError);
    expect(() => new CryptoRandomSource().nextInt(-3)).toThrow(RangeError);
  });
});
