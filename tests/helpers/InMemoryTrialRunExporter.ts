import path from "node:path";
import type { ExportDestination, ExportResult, TrialRunExporter } from "../../src/application.js";
import type { SamplingRun } from "../../src/domain/sampling.js";
import { Compatibility } from "../../src/domain/values.js";

export class InMemoryTrialRunExporter implements TrialRunExporter {
  lastRun: SamplingRun | undefined;
  lastDestination: ExportDestination | undefined;

  async export(run: SamplingRun, destination: ExportDestination): Promise<ExportResult> {
    this.lastRun = run;
    this.lastDestination = destination;

    return {
      files: {
        [Compatibility.Congruent]: path.join(
          destination.directory,
          destination.fileName(Compatibility.Congruent)
        ),
        [Compatibility.Incongruent]: path.join(
          destination.directory,
          destination.fileName(Compatibility.Incongruent)
        ),
      },
    };
  }
}
