import { describe, expect, it } from "vitest";
import { ExportDestination } from "../../src/application.js";
import { Compatibility } from "../../src/domain/values.js";

describe("ExportDestination", () => {
  it("builds the output file names", () => {
    const labDestination = new ExportDestination("output", "smartlab_");
    const plainDestination = new ExportDestination("output", "");

    expect(labDestination.fileName(Compatibility.Congruent)).toBe(
      "smartlab_congruent_trials.xlsx"
    );
    expect(plainDestination.fileName(Compatibility.Incongruent)).toBe("incongruent_trials.xlsx");
  });
});
