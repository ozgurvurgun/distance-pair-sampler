import { StimulusPool } from "./domain/pool.js";
import type { SamplingRun } from "./domain/sampling.js";
import { TrialSampler } from "./domain/sampling.js";
import {
  Compatibility,
  DomainError,
  IterationCount,
} from "./domain/values.js";

export class ExportDestination {
  constructor(
    readonly directory: string,
    readonly filePrefix: string
  ) {
    if (directory.trim() === "") {
      throw new DomainError("Export directory cannot be empty");
    }
  }

  fileName(compatibility: Compatibility): string {
    return `${this.filePrefix}${compatibility}_trials.xlsx`;
  }
}

export type ExportResult = {
  readonly files: Readonly<Record<Compatibility, string>>;
};

export interface TrialRunExporter {
  export(run: SamplingRun, destination: ExportDestination): Promise<ExportResult>;
}

export class SelectTrials {
  constructor(
    private readonly sampler: TrialSampler,
    private readonly exporter: TrialRunExporter
  ) {}

  async execute(params: {
    iterations: number;
    directory: string;
    filePrefix: string;
  }): Promise<ExportResult> {
    const destination = new ExportDestination(params.directory, params.filePrefix);
    const run = this.sampler.sample(
      StimulusPool.canonical(),
      IterationCount.of(params.iterations)
    );

    return this.exporter.export(run, destination);
  }
}
