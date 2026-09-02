import { StimulusPool } from "./pool.js";
import {
  Compatibility,
  Distance,
  DomainError,
  type IterationCount,
  Stimulus,
} from "./values.js";

export interface RandomSource {
  nextInt(maxExclusive: number): number;
}

export class TrialBlock {
  private constructor(
    readonly index: number,
    private readonly congruent: ReadonlyMap<number, Stimulus>,
    private readonly incongruent: ReadonlyMap<number, Stimulus>
  ) {}

  static create(params: {
    index: number;
    congruent: ReadonlyMap<Distance, Stimulus>;
    incongruent: ReadonlyMap<Distance, Stimulus>;
  }): TrialBlock {
    if (!Number.isInteger(params.index) || params.index < 0) {
      throw new DomainError(`Trial block index must be a non-negative integer, got ${params.index}`);
    }

    return new TrialBlock(
      params.index,
      TrialBlock.requireCompleteSelection(params.congruent, Compatibility.Congruent),
      TrialBlock.requireCompleteSelection(params.incongruent, Compatibility.Incongruent)
    );
  }

  stimulusAt(distance: Distance, compatibility: Compatibility): Stimulus {
    const table =
      compatibility === Compatibility.Congruent ? this.congruent : this.incongruent;
    const stimulus = table.get(distance.value);

    if (stimulus === undefined) {
      throw new DomainError(`Missing ${compatibility} stimulus at distance ${distance.value}`);
    }

    return stimulus;
  }

  labels(compatibility: Compatibility): readonly string[] {
    return Distance.all().map((distance) => this.stimulusAt(distance, compatibility).toLabel());
  }

  private static requireCompleteSelection(
    selection: ReadonlyMap<Distance, Stimulus>,
    compatibility: Compatibility
  ): ReadonlyMap<number, Stimulus> {
    if (selection.size !== Distance.all().length) {
      throw new DomainError(
        `${compatibility} selection must contain exactly one stimulus per distance`
      );
    }

    const normalized = new Map<number, Stimulus>();

    for (const distance of Distance.all()) {
      const match = [...selection.entries()].find(([key]) => key.equals(distance));

      if (match === undefined) {
        throw new DomainError(`Missing ${compatibility} stimulus for distance ${distance.value}`);
      }

      const stimulus = match[1];

      if (!stimulus.distance.equals(distance)) {
        throw new DomainError(
          `${compatibility} stimulus ${stimulus.toLabel()} does not belong to distance ${distance.value}`
        );
      }

      if (stimulus.compatibility !== compatibility) {
        throw new DomainError(
          `Stimulus ${stimulus.toLabel()} is ${stimulus.compatibility}, expected ${compatibility}`
        );
      }

      normalized.set(distance.value, stimulus);
    }

    return normalized;
  }
}

export class SamplingRun {
  private constructor(readonly blocks: readonly TrialBlock[]) {}

  static of(blocks: readonly TrialBlock[]): SamplingRun {
    if (blocks.length === 0) {
      throw new DomainError("Sampling run must contain at least one trial block");
    }

    blocks.forEach((block, index) => {
      if (block.index !== index) {
        throw new DomainError("Trial block indices must be sequential starting at 0");
      }
    });

    return new SamplingRun(blocks);
  }

  get iterationCount(): number {
    return this.blocks.length;
  }

  column(distance: Distance, compatibility: Compatibility): readonly string[] {
    return this.blocks.map((block) => block.stimulusAt(distance, compatibility).toLabel());
  }
}

export class TrialSampler {
  constructor(private readonly random: RandomSource) {}

  sample(pool: StimulusPool, iterations: IterationCount): SamplingRun {
    const blocks = Array.from({ length: iterations.value }, (_, index) =>
      this.sampleBlock(pool, index)
    );

    return SamplingRun.of(blocks);
  }

  private sampleBlock(pool: StimulusPool, index: number): TrialBlock {
    const congruent = new Map<Distance, Stimulus>();
    const incongruent = new Map<Distance, Stimulus>();

    for (const distance of Distance.all()) {
      congruent.set(distance, this.pick(pool, distance, Compatibility.Congruent));
      incongruent.set(distance, this.pick(pool, distance, Compatibility.Incongruent));
    }

    return TrialBlock.create({ index, congruent, incongruent });
  }

  private pick(
    pool: StimulusPool,
    distance: Distance,
    compatibility: Compatibility
  ): Stimulus {
    const candidates = pool.candidates(distance, compatibility);

    if (candidates.length === 0) {
      throw new DomainError(
        `Cannot sample ${compatibility} stimuli at distance ${distance.value}`
      );
    }

    const index = this.random.nextInt(candidates.length);

    if (!Number.isInteger(index) || index < 0 || index >= candidates.length) {
      throw new DomainError(
        `Random source produced index ${index} outside [0, ${candidates.length})`
      );
    }

    const stimulus = candidates[index];

    if (stimulus === undefined) {
      throw new DomainError("Random source selected a missing candidate");
    }

    return stimulus;
  }
}
