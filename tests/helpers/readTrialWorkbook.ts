import ExcelJS from "exceljs";
import type { Compatibility } from "../../src/domain/values.js";
import { Distance } from "../../src/domain/values.js";

export type SheetColumn = {
  readonly name: string;
  readonly header: string;
  readonly trials: readonly string[];
};

export async function readConditionColumns(
  filePath: string,
  compatibility: Compatibility
): Promise<readonly SheetColumn[]> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);

  return Distance.all().map((distance) => {
    const name = `${distance.value}-${compatibility}`;
    const sheet = workbook.getWorksheet(name);

    if (sheet === undefined) {
      throw new Error(`Missing sheet ${name} in ${filePath}`);
    }

    const trials: string[] = [];

    for (let row = 2; row <= sheet.rowCount; row += 1) {
      const value = sheet.getCell(row, 1).value;

      if (value !== null && value !== undefined && value !== "") {
        trials.push(String(value));
      }
    }

    return {
      name,
      header: String(sheet.getCell("A1").value),
      trials,
    };
  });
}
