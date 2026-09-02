import { describe, expect, it } from "vitest";
import { StimulusPool } from "../../src/domain/pool.js";
import { Compatibility, Distance, DomainError, Stimulus } from "../../src/domain/values.js";

describe("StimulusPool", () => {
  const pool = StimulusPool.canonical();

  it("contains the 72 directed pairs of digits 1-9", () => {
    expect(pool.size()).toBe(72);
    expect(pool.all()).toHaveLength(72);

    const labels = new Set(pool.all().map((stimulus) => stimulus.toLabel()));
    expect(labels.size).toBe(72);

    for (let left = 1; left <= 9; left += 1) {
      for (let right = 1; right <= 9; right += 1) {
        if (left === right) {
          continue;
        }

        expect(labels.has(`${left}_${right}`)).toBe(true);
      }
    }
  });

  it("keeps one fewer candidate per increasing distance", () => {
    const expectedCounts = [8, 7, 6, 5, 4, 3, 2, 1];

    Distance.all().forEach((distance, index) => {
      expect(pool.candidates(distance, Compatibility.Congruent)).toHaveLength(
        expectedCounts[index] ?? -1
      );
      expect(pool.candidates(distance, Compatibility.Incongruent)).toHaveLength(
        expectedCounts[index] ?? -1
      );
    });
  });

  it("lists distance-1 pairs in the same order as the old generator", () => {
    const distance = Distance.of(1);

    expect(
      pool.candidates(distance, Compatibility.Congruent).map((stimulus) => stimulus.toLabel())
    ).toEqual(["1_2", "2_3", "3_4", "4_5", "5_6", "6_7", "7_8", "8_9"]);
    expect(
      pool.candidates(distance, Compatibility.Incongruent).map((stimulus) => stimulus.toLabel())
    ).toEqual(["2_1", "3_2", "4_3", "5_4", "6_5", "7_6", "8_7", "9_8"]);
  });

  it("only lists congruent smaller_larger pairs for a distance", () => {
    for (const stimulus of pool.candidates(Distance.of(3), Compatibility.Congruent)) {
      expect(stimulus.compatibility).toBe(Compatibility.Congruent);
      expect(stimulus.distance.value).toBe(3);
    }
  });

  it("rejects an incomplete custom pool", () => {
    expect(() => StimulusPool.fromStimuli([Stimulus.of(1, 2)])).toThrow(DomainError);
  });

  it("rejects a stimulus whose distance has no bucket", () => {
    const orphan = {
      distance: { value: 99 },
      compatibility: Compatibility.Congruent,
      toLabel: () => "1_99",
    } as unknown as Stimulus;

    expect(() => StimulusPool.fromStimuli([orphan])).toThrow(/no distance bucket/);
  });

  it("rejects a lookup for a distance the pool does not hold", () => {
    const unknownDistance = { value: 99, equals: () => false } as unknown as Distance;

    expect(() => pool.candidates(unknownDistance, Compatibility.Congruent)).toThrow(
      /No candidates for distance 99/
    );
  });
});
