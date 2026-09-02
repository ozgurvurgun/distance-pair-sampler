export class DomainError extends Error {
  override readonly name = "DomainError";

  constructor(message: string) {
    super(message);
  }
}

export const Compatibility = {
  Congruent: "congruent",
  Incongruent: "incongruent",
} as const;

export type Compatibility = (typeof Compatibility)[keyof typeof Compatibility];

export const ALL_COMPATIBILITIES = [
  Compatibility.Congruent,
  Compatibility.Incongruent,
] as const;

export function oppositeCompatibility(compatibility: Compatibility): Compatibility {
  return compatibility === Compatibility.Congruent
    ? Compatibility.Incongruent
    : Compatibility.Congruent;
}

export class Digit {
  static readonly MIN = 1;
  static readonly MAX = 9;

  private constructor(readonly value: number) {}

  static of(value: number): Digit {
    if (!Number.isInteger(value) || value < Digit.MIN || value > Digit.MAX) {
      throw new DomainError(
        `Digit must be an integer from ${Digit.MIN} to ${Digit.MAX}, got ${value}`
      );
    }

    return new Digit(value);
  }

  static all(): readonly Digit[] {
    return Array.from({ length: Digit.MAX - Digit.MIN + 1 }, (_, index) =>
      Digit.of(Digit.MIN + index)
    );
  }

  equals(other: Digit): boolean {
    return this.value === other.value;
  }
}

export class Distance {
  static readonly MIN = 1;
  static readonly MAX = 8;

  private constructor(readonly value: number) {}

  static of(value: number): Distance {
    if (!Number.isInteger(value) || value < Distance.MIN || value > Distance.MAX) {
      throw new DomainError(
        `Distance must be an integer from ${Distance.MIN} to ${Distance.MAX}, got ${value}`
      );
    }

    return new Distance(value);
  }

  static all(): readonly Distance[] {
    return Array.from({ length: Distance.MAX - Distance.MIN + 1 }, (_, index) =>
      Distance.of(Distance.MIN + index)
    );
  }

  equals(other: Distance): boolean {
    return this.value === other.value;
  }
}

export class IterationCount {
  static readonly DEFAULT = 70;

  private constructor(readonly value: number) {}

  static of(value: number): IterationCount {
    if (!Number.isInteger(value) || value < 1) {
      throw new DomainError(`Iteration count must be a positive integer, got ${value}`);
    }

    return new IterationCount(value);
  }

  static default(): IterationCount {
    return IterationCount.of(IterationCount.DEFAULT);
  }
}

export class Stimulus {
  private constructor(
    readonly left: Digit,
    readonly right: Digit
  ) {}

  static of(left: number, right: number): Stimulus {
    const leftDigit = Digit.of(left);
    const rightDigit = Digit.of(right);

    if (leftDigit.equals(rightDigit)) {
      throw new DomainError("Stimulus digits must be different");
    }

    return new Stimulus(leftDigit, rightDigit);
  }

  static fromLabel(label: string): Stimulus {
    const match = /^([1-9])_([1-9])$/.exec(label);

    if (match?.[1] === undefined || match[2] === undefined) {
      throw new DomainError(`Invalid stimulus label: ${label}`);
    }

    return Stimulus.of(Number(match[1]), Number(match[2]));
  }

  get distance(): Distance {
    return Distance.of(Math.abs(this.left.value - this.right.value));
  }

  get compatibility(): Compatibility {
    return this.left.value < this.right.value
      ? Compatibility.Congruent
      : Compatibility.Incongruent;
  }

  toLabel(): string {
    return `${this.left.value}_${this.right.value}`;
  }

  reverse(): Stimulus {
    return Stimulus.of(this.right.value, this.left.value);
  }

  equals(other: Stimulus): boolean {
    return this.left.equals(other.left) && this.right.equals(other.right);
  }
}
