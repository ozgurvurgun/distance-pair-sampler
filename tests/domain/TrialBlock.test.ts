import { describe, expect, it } from "vitest";
import { TrialBlock } from "../../src/domain/sampling.js";
import { Compatibility, Distance, DomainError, Stimulus } from "../../src/domain/values.js";

function firstOfEachDistance(compatibility: typeof Compatibility.Congruent | typeof Compatibility.Incongruent) {
  const selection = new Map<Distance, Stimulus>();

  for (const distance of Distance.all()) {
    const left = compatibility === Compatibility.Congruent ? 1 : 1 + distance.value;
    const right = compatibility === Compatibility.Congruent ? 1 + distance.value : 1;
    selection.set(distance, Stimulus.of(left, right));
  }

  return selection;
}

describe("TrialBlock", () => {
  it("holds one congruent and one incongruent stimulus per distance", () => {
    const block = TrialBlock.create({
      index: 0,
      congruent: firstOfEachDistance(Compatibility.Congruent),
      incongruent: firstOfEachDistance(Compatibility.Incongruent),
    });

    expect(block.labels(Compatibility.Congruent)).toEqual([
      "1_2",
      "1_3",
      "1_4",
      "1_5",
      "1_6",
      "1_7",
      "1_8",
      "1_9",
    ]);
    expect(block.stimulusAt(Distance.of(8), Compatibility.Incongruent).toLabel()).toBe("9_1");
  });

  it("rejects a negative index", () => {
    expect(() =>
      TrialBlock.create({
        index: -1,
        congruent: firstOfEachDistance(Compatibility.Congruent),
        incongruent: firstOfEachDistance(Compatibility.Incongruent),
      })
    ).toThrow(/non-negative integer/);
  });

  it("rejects a non-integer index", () => {
    expect(() =>
      TrialBlock.create({
        index: 1.4,
        congruent: firstOfEachDistance(Compatibility.Congruent),
        incongruent: firstOfEachDistance(Compatibility.Incongruent),
      })
    ).toThrow(/non-negative integer/);
  });

  it("rejects a full-size map that still omits a distance key", () => {
    const congruent = firstOfEachDistance(Compatibility.Congruent);
    const distanceEight = [...congruent.keys()].find((distance) => distance.value === 8);

    if (distanceEight === undefined) {
      throw new Error("expected distance 8");
    }

    congruent.delete(distanceEight);
    congruent.set(Distance.of(1), Stimulus.of(1, 2));

    expect(() =>
      TrialBlock.create({
        index: 0,
        congruent,
        incongruent: firstOfEachDistance(Compatibility.Incongruent),
      })
    ).toThrow(/Missing congruent stimulus for distance 8/);
  });

  it("rejects a lookup for a distance the block does not hold", () => {
    const block = TrialBlock.create({
      index: 0,
      congruent: firstOfEachDistance(Compatibility.Congruent),
      incongruent: firstOfEachDistance(Compatibility.Incongruent),
    });
    const unknownDistance = { value: 99, equals: () => false } as unknown as Distance;

    expect(() => block.stimulusAt(unknownDistance, Compatibility.Congruent)).toThrow(
      /Missing congruent stimulus at distance 99/
    );
  });

  it("rejects a missing distance", () => {
    const congruent = new Map(
      [...firstOfEachDistance(Compatibility.Congruent).entries()].filter(
        ([distance]) => distance.value !== 4
      )
    );

    expect(() =>
      TrialBlock.create({
        index: 0,
        congruent,
        incongruent: firstOfEachDistance(Compatibility.Incongruent),
      })
    ).toThrow(DomainError);
  });

  it("rejects a stimulus placed in the wrong distance slot", () => {
    const congruent = firstOfEachDistance(Compatibility.Congruent);
    for (const distance of congruent.keys()) {
      if (distance.value === 2) {
        congruent.set(distance, Stimulus.of(1, 9));
      }
    }

    expect(() =>
      TrialBlock.create({
        index: 0,
        congruent,
        incongruent: firstOfEachDistance(Compatibility.Incongruent),
      })
    ).toThrow(/does not belong to distance 2/);
  });

  it("rejects swapping compatibility", () => {
    const congruent = firstOfEachDistance(Compatibility.Congruent);
    for (const distance of congruent.keys()) {
      if (distance.value === 1) {
        congruent.set(distance, Stimulus.of(2, 1));
      }
    }

    expect(() =>
      TrialBlock.create({
        index: 0,
        congruent,
        incongruent: firstOfEachDistance(Compatibility.Incongruent),
      })
    ).toThrow(/expected congruent/);
  });
});
