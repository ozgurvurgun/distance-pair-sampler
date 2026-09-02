import { describe, expect, it } from "vitest";
import { DomainError, IterationCount } from "../../src/domain/values.js";

describe("IterationCount", () => {
  it("defaults to 70", () => {
    expect(IterationCount.default().value).toBe(70);
  });

  it.each([0, -1, 1.5, Number.NaN])("rejects %s", (value) => {
    expect(() => IterationCount.of(value)).toThrow(DomainError);
  });
});
