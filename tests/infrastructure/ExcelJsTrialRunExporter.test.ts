import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { ExportDestination } from "../../src/application.js";
import { StimulusPool } from "../../src/domain/pool.js";
import { TrialSampler } from "../../src/domain/sampling.js";
import { Compatibility, Distance, IterationCount } from "../../src/domain/values.js";
import { ExcelExporter } from "../../src/infrastructure/excel.js";
import { SequenceRandomSource } from "../helpers/SequenceRandomSource.js";
import { readConditionColumns } from "../helpers/readTrialWorkbook.js";

describe("ExcelExporter", () => {
  const directories: string[] = [];

  afterEach(() => {
    for (const directory of directories.splice(0)) {
      rmSync(directory, { recursive: true, force: true });
    }
  });

  it("writes 8 sheets of 70 labels", async () => {
    const directory = mkdtempSync(path.join(tmpdir(), "distance-pair-export-"));
    directories.push(directory);

    const sampler = new TrialSampler(new SequenceRandomSource([]));
    const run = sampler.sample(StimulusPool.canonical(), IterationCount.default());
    const exporter = new ExcelExporter();
    const result = await exporter.export(run, new ExportDestination(directory, "smartlab_"));

    const congruentSheets = await readConditionColumns(
      result.files[Compatibility.Congruent],
      Compatibility.Congruent
    );
    const incongruentSheets = await readConditionColumns(
      result.files[Compatibility.Incongruent],
      Compatibility.Incongruent
    );

    expect(congruentSheets).toHaveLength(8);
    expect(incongruentSheets).toHaveLength(8);

    Distance.all().forEach((distance, index) => {
      const congruent = congruentSheets[index];
      const incongruent = incongruentSheets[index];

      expect(congruent?.name).toBe(`${distance.value}-congruent`);
      expect(congruent?.header).toBe(String(distance.value));
      expect(congruent?.trials).toHaveLength(70);
      expect(congruent?.trials).toEqual([...run.column(distance, Compatibility.Congruent)]);
      expect(incongruent?.trials).toEqual([...run.column(distance, Compatibility.Incongruent)]);
    });

    expect(congruentSheets[7]?.trials.every((label) => label === "1_9")).toBe(true);
    expect(incongruentSheets[7]?.trials.every((label) => label === "9_1")).toBe(true);
  });
});
