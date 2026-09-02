import { randomInt } from "node:crypto";
import type { RandomSource } from "../domain/sampling.js";

export class CryptoRandomSource implements RandomSource {
  nextInt(maxExclusive: number): number {
    if (!Number.isInteger(maxExclusive) || maxExclusive <= 0) {
      throw new RangeError(`maxExclusive must be a positive integer, got ${maxExclusive}`);
    }

    return randomInt(0, maxExclusive);
  }
}
