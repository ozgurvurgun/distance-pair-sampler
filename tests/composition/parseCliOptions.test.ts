import { describe, expect, it } from "vitest";
import { parseCliOptions } from "../../src/cli.js";
import { IterationCount } from "../../src/domain/values.js";

describe("parseCliOptions", () => {
  it("defaults to 70 crypto iterations into output/", () => {
    expect(parseCliOptions({})).toEqual({
      iterations: IterationCount.DEFAULT,
      outputDir: "output",
    });
  });

  it("reads overrides from the environment", () => {
    expect(
      parseCliOptions({
        ITERATIONS: "12",
        OUTPUT_DIR: "tmp-out",
      })
    ).toEqual({
      iterations: 12,
      outputDir: "tmp-out",
    });
  });
});
