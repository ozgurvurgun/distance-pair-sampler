import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { runCli } from "../../src/cli.js";

describe("runCli", () => {
  const directories: string[] = [];

  afterEach(() => {
    for (const directory of directories.splice(0)) {
      rmSync(directory, { recursive: true, force: true });
    }
  });

  it("prints the default 70-iteration crypto run", async () => {
    const directory = mkdtempSync(path.join(tmpdir(), "distance-pair-cli-default-"));
    directories.push(directory);
    const lines: string[] = [];

    await runCli({ OUTPUT_DIR: directory }, (line) => lines.push(line));

    expect(lines[0]).toContain("72 pairs");
    expect(lines.join("\n")).toContain("Iterations: 70");
    expect(lines.join("\n")).toContain("crypto.randomInt");
    expect(lines.join("\n")).toMatch(/smartlab_\d{8}-\d{6}_congruent_trials\.xlsx/);
    expect(lines.join("\n")).not.toContain("Default iteration count is");
  });

  it("writes to console.log when no writer is provided", async () => {
    const directory = mkdtempSync(path.join(tmpdir(), "distance-pair-cli-console-"));
    directories.push(directory);
    const spy = vi.spyOn(console, "log").mockImplementation(() => undefined);

    await runCli({ ITERATIONS: "1", OUTPUT_DIR: directory });

    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it("mentions the default when a custom iteration count is used", async () => {
    const directory = mkdtempSync(path.join(tmpdir(), "distance-pair-cli-custom-"));
    directories.push(directory);
    const lines: string[] = [];

    await runCli({ ITERATIONS: "1", OUTPUT_DIR: directory }, (line) => lines.push(line));

    expect(lines.join("\n")).toContain("crypto.randomInt");
    expect(lines.join("\n")).toContain("Iterations: 1");
    expect(lines.join("\n")).toContain("Default iteration count is 70");
  });
});
