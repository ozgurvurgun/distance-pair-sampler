import { describe, expect, it } from "vitest";
import {
  Compatibility,
  oppositeCompatibility,
} from "../../src/domain/values.js";

describe("Compatibility", () => {
  it("flips congruent and incongruent", () => {
    expect(oppositeCompatibility(Compatibility.Congruent)).toBe(Compatibility.Incongruent);
    expect(oppositeCompatibility(Compatibility.Incongruent)).toBe(Compatibility.Congruent);
  });
});
