import { describe, expect, it } from "vitest";
import { Distance, DomainError } from "../../src/domain/values.js";

describe("Distance", () => {
  it("enumerates levels 1-8", () => {
    expect(Distance.all().map((distance) => distance.value)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });

  it.each([0, 9, 1.2, Number.NaN])("rejects %s", (value) => {
    expect(() => Distance.of(value)).toThrow(DomainError);
  });

  it("compares by value", () => {
    expect(Distance.of(3).equals(Distance.of(3))).toBe(true);
    expect(Distance.of(3).equals(Distance.of(4))).toBe(false);
  });
});
