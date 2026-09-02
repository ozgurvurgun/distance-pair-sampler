import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { composeApp, outputFilePrefix } from "../../src/cli.js";
import { Compatibility } from "../../src/domain/values.js";

const fixedNow = new Date(2026, 8, 2, 22, 32, 5);
const prefix = "smartlab_20260902-223205_";

describe("composeApp", () => {
  const directories: string[] = [];

  afterEach(() => {
    for (const directory of directories.splice(0)) {
      rmSync(directory, { recursive: true, force: true });
    }
  });

  it("stamps both files with the same run time", async () => {
    const directory = mkdtempSync(path.join(tmpdir(), "distance-pair-compose-crypto-"));
    directories.push(directory);

    const app = composeApp(
      {
        iterations: 1,
        outputDir: directory,
      },
      fixedNow
    );
    const result = await app.useCase.execute({
      iterations: app.iterations,
      directory: app.directory,
      filePrefix: app.filePrefix,
    });

    expect(app.filePrefix).toBe(prefix);
    expect(result.files[Compatibility.Congruent]).toContain(`${prefix}congruent_trials.xlsx`);
  });

});

describe("outputFilePrefix", () => {
  it("uses local time as YYYYMMDD-HHMMSS", () => {
    expect(outputFilePrefix(new Date(2026, 0, 5, 7, 8, 9))).toBe("smartlab_20260105-070809_");
  });

  it("defaults to the current clock", () => {
    expect(outputFilePrefix()).toMatch(/^smartlab_\d{8}-\d{6}_$/);
  });
});
