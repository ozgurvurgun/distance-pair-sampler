import type { RandomSource } from "../../src/domain/sampling.js";

export class SequenceRandomSource implements RandomSource {
  private cursor = 0;

  constructor(private readonly values: readonly number[]) {}

  nextInt(maxExclusive: number): number {
    const raw = this.values[this.cursor] ?? 0;
    this.cursor += 1;
    return ((raw % maxExclusive) + maxExclusive) % maxExclusive;
  }
}
