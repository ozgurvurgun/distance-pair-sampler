import { describe, expect, it } from "vitest";
import { Digit, DomainError } from "../../src/domain/values.js";

describe("Digit", () => {
  it("accepts every integer from 1 to 9", () => {
    expect(Digit.all().map((digit) => digit.value)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });

  it.each([0, 10, 1.5, Number.NaN, Number.POSITIVE_INFINITY, -1])(
    "rejects %s",
    (value) => {
      expect(() => Digit.of(value)).toThrow(DomainError);
    }
  );

  it("compares by value", () => {
    expect(Digit.of(3).equals(Digit.of(3))).toBe(true);
    expect(Digit.of(3).equals(Digit.of(4))).toBe(false);
  });
});
