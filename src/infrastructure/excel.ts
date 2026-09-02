import { mkdirSync } from "node:fs";
import path from "node:path";
import ExcelJS from "exceljs";
import type { ExportDestination, ExportResult, TrialRunExporter } from "../application.js";
import type { SamplingRun } from "../domain/sampling.js";
import { ALL_COMPATIBILITIES, type Compatibility, Distance } from "../domain/values.js";

export class ExcelExporter implements TrialRunExporter {
  async export(run: SamplingRun, destination: ExportDestination): Promise<ExportResult> {
    mkdirSync(destination.directory, { recursive: true });

    const files = {} as Record<Compatibility, string>;

    for (const compatibility of ALL_COMPATIBILITIES) {
      const filePath = path.join(destination.directory, destination.fileName(compatibility));
      await this.writeWorkbook(run, compatibility, filePath);
      files[compatibility] = filePath;
    }

    return { files };
  }

  private async writeWorkbook(
    run: SamplingRun,
    compatibility: Compatibility,
    filePath: string
  ): Promise<void> {
    const workbook = new ExcelJS.Workbook();

    for (const distance of Distance.all()) {
      const sheet = workbook.addWorksheet(`${distance.value}-${compatibility}`);
      sheet.getCell("A1").value = String(distance.value);

      run.column(distance, compatibility).forEach((label, index) => {
        sheet.getCell(index + 2, 1).value = label;
      });
    }

    await workbook.xlsx.writeFile(filePath);
  }
}
