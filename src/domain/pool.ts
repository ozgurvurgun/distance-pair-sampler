import {
  ALL_COMPATIBILITIES,
  Compatibility,
  Digit,
  Distance,
  DomainError,
  Stimulus,
} from "./values.js";

type Bucket = {
  readonly congruent: readonly Stimulus[];
  readonly incongruent: readonly Stimulus[];
};

export class StimulusPool {
  private constructor(private readonly buckets: ReadonlyMap<number, Bucket>) {}

  static canonical(): StimulusPool {
    const stimuli: Stimulus[] = [];

    for (const left of Digit.all()) {
      for (const right of Digit.all()) {
        if (left.equals(right)) {
          continue;
        }

        stimuli.push(Stimulus.of(left.value, right.value));
      }
    }

    return StimulusPool.fromStimuli(stimuli);
  }

  static fromStimuli(stimuli: readonly Stimulus[]): StimulusPool {
    const mutable = new Map<number, { congruent: Stimulus[]; incongruent: Stimulus[] }>();

    for (const distance of Distance.all()) {
      mutable.set(distance.value, { congruent: [], incongruent: [] });
    }

    for (const stimulus of stimuli) {
      const bucket = mutable.get(stimulus.distance.value);

      if (bucket === undefined) {
        throw new DomainError(`Stimulus ${stimulus.toLabel()} has no distance bucket`);
      }

      if (stimulus.compatibility === Compatibility.Congruent) {
        bucket.congruent.push(stimulus);
      } else {
        bucket.incongruent.push(stimulus);
      }
    }

    for (const distance of Distance.all()) {
      const bucket = mutable.get(distance.value)!;

      if (bucket.congruent.length === 0 || bucket.incongruent.length === 0) {
        throw new DomainError(
          `Stimulus pool must contain both compatibilities for distance ${distance.value}`
        );
      }
    }

    return new StimulusPool(mutable);
  }

  candidates(distance: Distance, compatibility: Compatibility): readonly Stimulus[] {
    const bucket = this.buckets.get(distance.value);

    if (bucket === undefined) {
      throw new DomainError(`No candidates for distance ${distance.value}`);
    }

    return compatibility === Compatibility.Congruent
      ? bucket.congruent
      : bucket.incongruent;
  }

  size(): number {
    return Distance.all().reduce((total, distance) => {
      return (
        total +
        ALL_COMPATIBILITIES.reduce(
          (count, compatibility) => count + this.candidates(distance, compatibility).length,
          0
        )
      );
    }, 0);
  }

  all(): readonly Stimulus[] {
    return Distance.all().flatMap((distance) =>
      ALL_COMPATIBILITIES.flatMap((compatibility) => this.candidates(distance, compatibility))
    );
  }
}
