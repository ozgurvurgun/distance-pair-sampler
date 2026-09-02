import { describe, expect, it } from "vitest";
import { SelectTrials } from "../../src/application.js";
import { TrialSampler } from "../../src/domain/sampling.js";
import { Compatibility, DomainError } from "../../src/domain/values.js";
import { InMemoryTrialRunExporter } from "../helpers/InMemoryTrialRunExporter.js";
import { SequenceRandomSource } from "../helpers/SequenceRandomSource.js";

describe("SelectTrials", () => {
  it("exports a run with the requested iteration count", async () => {
    const exporter = new InMemoryTrialRunExporter();
    const useCase = new SelectTrials(new TrialSampler(new SequenceRandomSource([])), exporter);

    const result = await useCase.execute({
      iterations: 5,
      directory: "output",
      filePrefix: "smartlab_",
    });

    expect(exporter.lastRun?.iterationCount).toBe(5);
    expect(result.files[Compatibility.Congruent]).toBe("output/smartlab_congruent_trials.xlsx");
    expect(result.files[Compatibility.Incongruent]).toBe(
      "output/smartlab_incongruent_trials.xlsx"
    );
    expect(exporter.lastDestination?.filePrefix).toBe("smartlab_");
  });

  it("rejects an empty destination before sampling", async () => {
    const useCase = new SelectTrials(
      new TrialSampler(new SequenceRandomSource([])),
      new InMemoryTrialRunExporter()
    );

    await expect(
      useCase.execute({
        iterations: 1,
        directory: "   ",
        filePrefix: "",
      })
    ).rejects.toBeInstanceOf(DomainError);
  });
});
