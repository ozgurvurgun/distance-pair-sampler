import * as fc from "fast-check";
import { describe, expect, it } from "vitest";
import { Compatibility, DomainError, oppositeCompatibility, Stimulus } from "../../src/domain/values.js";

const digitArb = fc.integer({ min: 1, max: 9 });

describe("Stimulus", () => {
  it("treats smaller_larger as congruent and larger_smaller as incongruent", () => {
    const congruent = Stimulus.of(2, 7);
    const incongruent = Stimulus.of(7, 2);

    expect(congruent.toLabel()).toBe("2_7");
    expect(congruent.distance.value).toBe(5);
    expect(congruent.compatibility).toBe(Compatibility.Congruent);
    expect(incongruent.compatibility).toBe(Compatibility.Incongruent);
    expect(incongruent.reverse().equals(congruent)).toBe(true);
    expect(congruent.equals(Stimulus.of(2, 8))).toBe(false);
  });

  it("parses and rejects labels", () => {
    expect(Stimulus.fromLabel("1_9").toLabel()).toBe("1_9");
    expect(() => Stimulus.fromLabel("19")).toThrow(DomainError);
    expect(() => Stimulus.fromLabel("1_1")).toThrow(DomainError);
    expect(() => Stimulus.fromLabel("0_2")).toThrow(DomainError);
  });

  it("rejects identical digits", () => {
    expect(() => Stimulus.of(4, 4)).toThrow(/must be different/);
  });

  it("reverse keeps distance and flips compatibility", () => {
    fc.assert(
      fc.property(digitArb, digitArb, (left, right) => {
        fc.pre(left !== right);

        const stimulus = Stimulus.of(left, right);
        const reversed = stimulus.reverse();

        expect(stimulus.distance.value).toBe(Math.abs(left - right));
        expect(reversed.distance.equals(stimulus.distance)).toBe(true);
        expect(reversed.compatibility).toBe(oppositeCompatibility(stimulus.compatibility));
        expect(reversed.toLabel()).toBe(`${right}_${left}`);
      })
    );
  });
});
