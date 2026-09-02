import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { StimulusPool } from "../../src/domain/pool.js";
import { Compatibility, Distance, Stimulus } from "../../src/domain/values.js";
import { readConditionColumns } from "../helpers/readTrialWorkbook.js";

const ORIGINAL = {
  congruent: "(crypto)congruent_trials.xlsx",
  incongruent: "(crypto)incongruent_trials.xlsx",
} as const;

const available = existsSync(ORIGINAL.congruent) && existsSync(ORIGINAL.incongruent);

describe.skipIf(!available)("original (crypto) workbooks", () => {
  const pool = StimulusPool.canonical();

  it("matches the 72-pair distance rules", async () => {
    const congruent = await readConditionColumns(ORIGINAL.congruent, Compatibility.Congruent);
    const incongruent = await readConditionColumns(
      ORIGINAL.incongruent,
      Compatibility.Incongruent
    );

    expect(congruent).toHaveLength(8);
    expect(incongruent).toHaveLength(8);

    Distance.all().forEach((distance, index) => {
      const allowedCongruent = new Set(
        pool.candidates(distance, Compatibility.Congruent).map((stimulus) => stimulus.toLabel())
      );
      const allowedIncongruent = new Set(
        pool.candidates(distance, Compatibility.Incongruent).map((stimulus) => stimulus.toLabel())
      );

      const congruentSheet = congruent[index];
      const incongruentSheet = incongruent[index];

      expect(congruentSheet?.header).toBe(String(distance.value));
      expect(congruentSheet?.trials).toHaveLength(70);
      expect(incongruentSheet?.trials).toHaveLength(70);

      for (const label of congruentSheet?.trials ?? []) {
        expect(allowedCongruent.has(label)).toBe(true);
        expect(Stimulus.fromLabel(label).compatibility).toBe(Compatibility.Congruent);
      }

      for (const label of incongruentSheet?.trials ?? []) {
        expect(allowedIncongruent.has(label)).toBe(true);
      }
    });
  });

  it("does not pair congruent with its reverse", async () => {
    const congruent = await readConditionColumns(ORIGINAL.congruent, Compatibility.Congruent);
    const incongruent = await readConditionColumns(
      ORIGINAL.incongruent,
      Compatibility.Incongruent
    );

    let matchedReverses = 0;

    for (let row = 0; row < 70; row += 1) {
      Distance.all().forEach((_, index) => {
        const pair = congruent[index]?.trials[row];
        const other = incongruent[index]?.trials[row];

        if (pair !== undefined && other === Stimulus.fromLabel(pair).reverse().toLabel()) {
          matchedReverses += 1;
        }
      });
    }

    expect(matchedReverses).toBeGreaterThan(0);
    expect(matchedReverses).toBeLessThan(70 * 8);
  });
});
