import { describe, expect, it } from "vitest";
import { DomainError } from "../../src/domain/values.js";

describe("DomainError", () => {
  it("sets error names", () => {
    expect(new DomainError("x").name).toBe("DomainError");
  });
});
