import { SelectTrials } from "./application.js";
import { StimulusPool } from "./domain/pool.js";
import { TrialSampler } from "./domain/sampling.js";
import { Compatibility, Distance, IterationCount } from "./domain/values.js";
import { ExcelExporter } from "./infrastructure/excel.js";
import { CryptoRandomSource } from "./infrastructure/random.js";

export type AppOptions = {
  readonly iterations: number;
  readonly outputDir: string;
};

export function parseCliOptions(env: NodeJS.ProcessEnv): AppOptions {
  const iterations =
    env.ITERATIONS === undefined ? IterationCount.DEFAULT : Number(env.ITERATIONS);

  return {
    iterations,
    outputDir: env.OUTPUT_DIR ?? "output",
  };
}

export function outputFilePrefix(now: Date = new Date()): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  const stamp = [
    now.getFullYear(),
    pad(now.getMonth() + 1),
    pad(now.getDate()),
    "-",
    pad(now.getHours()),
    pad(now.getMinutes()),
    pad(now.getSeconds()),
  ].join("");

  return `smartlab_${stamp}_`;
}

export function composeApp(
  options: AppOptions,
  now: Date = new Date()
): {
  useCase: SelectTrials;
  iterations: number;
  directory: string;
  filePrefix: string;
} {
  return {
    useCase: new SelectTrials(new TrialSampler(new CryptoRandomSource()), new ExcelExporter()),
    iterations: options.iterations,
    directory: options.outputDir,
    filePrefix: outputFilePrefix(now),
  };
}

export async function runCli(
  env: NodeJS.ProcessEnv = process.env,
  write: (line: string) => void = console.log
): Promise<void> {
  const options = parseCliOptions(env);
  const app = composeApp(options);
  const result = await app.useCase.execute({
    iterations: app.iterations,
    directory: app.directory,
    filePrefix: app.filePrefix,
  });
  const pool = StimulusPool.canonical();

  write(`Stimulus set: ${pool.size()} pairs (digits 1-9, distances 1-${Distance.MAX})`);
  write(`Iterations: ${app.iterations}`);
  write(
    `Each block: ${Distance.all().length} congruent + ${Distance.all().length} incongruent`
  );
  write("RNG: crypto.randomInt");
  write(`Wrote ${result.files[Compatibility.Congruent]}`);
  write(`Wrote ${result.files[Compatibility.Incongruent]}`);

  if (app.iterations !== IterationCount.DEFAULT) {
    write(`Default iteration count is ${IterationCount.DEFAULT}`);
  }
}

/* v8 ignore next 3 */
if (process.argv[1]?.endsWith("cli.ts") === true) {
  await runCli();
}
