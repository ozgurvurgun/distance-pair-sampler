import { describe, expect, it } from "vitest";
import { SamplingRun, TrialBlock } from "../../src/domain/sampling.js";
import { Compatibility, Distance, DomainError, Stimulus } from "../../src/domain/values.js";

function block(index: number, congruentLabel: string): TrialBlock {
  const congruent = new Map<Distance, Stimulus>();
  const incongruent = new Map<Distance, Stimulus>();

  for (const distance of Distance.all()) {
    congruent.set(
      distance,
      distance.value === 1 ? Stimulus.fromLabel(congruentLabel) : Stimulus.of(1, 1 + distance.value)
    );
    incongruent.set(distance, Stimulus.of(1 + distance.value, 1));
  }

  return TrialBlock.create({ index, congruent, incongruent });
}

describe("SamplingRun", () => {
  it("exposes a column of labels across blocks", () => {
    const run = SamplingRun.of([block(0, "1_2"), block(1, "3_4")]);

    expect(run.iterationCount).toBe(2);
    expect(run.column(Distance.of(1), Compatibility.Congruent)).toEqual(["1_2", "3_4"]);
  });

  it("rejects an empty run and non-sequential indices", () => {
    expect(() => SamplingRun.of([])).toThrow(DomainError);
    expect(() => SamplingRun.of([block(1, "1_2")])).toThrow(/sequential/);
  });
});
