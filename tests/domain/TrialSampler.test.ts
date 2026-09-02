import { describe, expect, it } from "vitest";
import { StimulusPool } from "../../src/domain/pool.js";
import { TrialSampler } from "../../src/domain/sampling.js";
import { Compatibility, Distance, DomainError, IterationCount, Stimulus } from "../../src/domain/values.js";
import { SequenceRandomSource } from "../helpers/SequenceRandomSource.js";

const pool = StimulusPool.canonical();

describe("TrialSampler", () => {
  it("picks the first candidate of every bucket when the source always returns 0", () => {
    const sampler = new TrialSampler(new SequenceRandomSource(Array.from({ length: 200 }, () => 0)));
    const run = sampler.sample(pool, IterationCount.of(2));

    for (const block of run.blocks) {
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
      expect(block.labels(Compatibility.Incongruent)).toEqual([
        "2_1",
        "3_1",
        "4_1",
        "5_1",
        "6_1",
        "7_1",
        "8_1",
        "9_1",
      ]);
    }
  });

  it("picks the last candidate of every bucket when given length-1 indices", () => {
    const lastIndices = Distance.all().flatMap((distance) => {
      const last = pool.candidates(distance, Compatibility.Congruent).length - 1;
      return [last, last];
    });
    const sampler = new TrialSampler(new SequenceRandomSource(lastIndices));
    const block = sampler.sample(pool, IterationCount.of(1)).blocks[0];

    expect(block?.labels(Compatibility.Congruent)).toEqual([
      "8_9",
      "7_9",
      "6_9",
      "5_9",
      "4_9",
      "3_9",
      "2_9",
      "1_9",
    ]);
    expect(block?.labels(Compatibility.Incongruent)).toEqual([
      "9_8",
      "9_7",
      "9_6",
      "9_5",
      "9_4",
      "9_3",
      "9_2",
      "9_1",
    ]);
  });

  it("samples congruent and incongruent independently", () => {
    const sampler = new TrialSampler(new SequenceRandomSource([0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0]));
    const block = sampler.sample(pool, IterationCount.of(1)).blocks[0];

    expect(block?.stimulusAt(Distance.of(1), Compatibility.Congruent).toLabel()).toBe("1_2");
    expect(block?.stimulusAt(Distance.of(1), Compatibility.Incongruent).toLabel()).toBe("3_2");
    expect(block?.stimulusAt(Distance.of(1), Compatibility.Incongruent).reverse().toLabel()).not.toBe(
      "1_2"
    );
  });

  it("rejects sampling from an empty candidate list", () => {
    const emptyPool = {
      candidates: () => [],
    } as unknown as StimulusPool;
    const sampler = new TrialSampler(new SequenceRandomSource([0]));

    expect(() => sampler.sample(emptyPool, IterationCount.of(1))).toThrow(
      /Cannot sample congruent/
    );
  });

  it("rejects a hole inside a candidate list", () => {
    const hole = [Stimulus.of(1, 2), undefined, Stimulus.of(3, 4)] as Stimulus[];
    const poolWithHole = {
      candidates: () => hole,
    } as unknown as StimulusPool;
    const sampler = new TrialSampler({ nextInt: () => 1 });

    expect(() => sampler.sample(poolWithHole, IterationCount.of(1))).toThrow(
      /missing candidate/
    );
  });

  it.each([99, -1, 1.5])("rejects a random source that returns %s", (value) => {
    const sampler = new TrialSampler({
      nextInt: () => value,
    });

    expect(() => sampler.sample(pool, IterationCount.of(1))).toThrow(DomainError);
  });

  it("builds the requested number of blocks", () => {
    const sampler = new TrialSampler(new SequenceRandomSource([]));
    const run = sampler.sample(pool, IterationCount.of(70));

    expect(run.iterationCount).toBe(70);
    expect(run.column(Distance.of(8), Compatibility.Congruent).every((label) => label === "1_9")).toBe(
      true
    );
    expect(run.column(Distance.of(8), Compatibility.Incongruent).every((label) => label === "9_1")).toBe(
      true
    );
  });
});
