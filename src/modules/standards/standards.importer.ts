import fs from 'fs';
import { parse } from 'csv-parse';
import { StandardsRepository } from './standards.repository';
import { CSVRow, CleanedCSVData, ImportSummary } from './standards.types';
import { logger } from '../../utils/logger';

export class StandardsImporter {
  private repository: StandardsRepository;

  constructor() {
    this.repository = new StandardsRepository();
  }

  private isValidNumber(value: string | undefined): boolean {
    if (!value || value.trim() === '') return false;
    // Remove dots (thousand separators in European format) before parsing
    const cleanValue = value.replace(/\./g, '');
    const num = parseInt(cleanValue, 10);
    return !isNaN(num) && isFinite(num);
  }

  private parseNumber(value: string | undefined): number {
    if (!value || value.trim() === '') return 0;
    // Remove dots (thousand separators in European format) - values are integers in grams
    const cleanValue = value.replace(/\./g, '');
    return parseInt(cleanValue, 10);
  }

  private isValidInteger(value: string | undefined): boolean {
    if (!value || value.trim() === '') return false;
    const num = parseInt(value, 10);
    return !isNaN(num) && isFinite(num) && num >= 0;
  }

  private parseInteger(value: string | undefined): number {
    if (!value || value.trim() === '') return 0;
    return parseInt(value, 10);
  }

  private cleanRow(row: CSVRow): CleanedCSVData | null {
    const breed = row.Breed?.trim();
    const color = row.Color?.trim();
    const ageWeeks = row['Age in \nWeeks']?.trim();

    if (!breed || breed === '' || !color || color === '' || !ageWeeks) {
      return null;
    }

    if (!this.isValidInteger(ageWeeks)) {
      return null;
    }

    const minFemaleStr = row['Min BW Female'];
    const avgFemaleStr = row['Avg BW Female'];
    const maxFemaleStr = row['Max BW Female'];
    const minMaleStr = row['Min BW Male'];
    const avgMaleStr = row['Avg BW Male'];
    const maxMaleStr = row['Max BW Male'];

    if (
      !this.isValidNumber(minFemaleStr) ||
      !this.isValidNumber(avgFemaleStr) ||
      !this.isValidNumber(maxFemaleStr) ||
      !this.isValidNumber(minMaleStr) ||
      !this.isValidNumber(avgMaleStr) ||
      !this.isValidNumber(maxMaleStr)
    ) {
      return null;
    }

    return {
      breed,
      color,
      week: this.parseInteger(ageWeeks),
      minFemale: this.parseNumber(minFemaleStr),
      avgFemale: this.parseNumber(avgFemaleStr),
      maxFemale: this.parseNumber(maxFemaleStr),
      minMale: this.parseNumber(minMaleStr),
      avgMale: this.parseNumber(avgMaleStr),
      maxMale: this.parseNumber(maxMaleStr)
    };
  }

  async importFromCSV(filePath: string): Promise<ImportSummary> {
    return new Promise((resolve, reject) => {
      const cleanedData: CleanedCSVData[] = [];
      let rowsSkipped = 0;
      let totalRows = 0;

      const parser = parse({
        delimiter: ';',
        columns: true,
        skip_empty_lines: true,
        trim: true,
        relax_column_count: true
      });

      fs.createReadStream(filePath)
        .pipe(parser)
        .on('data', (row: CSVRow) => {
          totalRows++;
          const cleaned = this.cleanRow(row);
          if (cleaned) {
            cleanedData.push(cleaned);
          } else {
            rowsSkipped++;
          }
        })
        .on('end', async () => {
          try {
            logger.info(`CSV parsing completed. Total rows: ${totalRows}, Valid rows: ${cleanedData.length}, Skipped: ${rowsSkipped}`);

            if (cleanedData.length === 0) {
              resolve({
                productsInserted: 0,
                growthRowsInserted: 0,
                rowsSkipped
              });
              return;
            }

            const { productsInserted, growthRowsInserted } = await this.repository.bulkImportData(cleanedData);

            logger.info(`Import completed. Products: ${productsInserted}, Growth rows: ${growthRowsInserted}`);

            resolve({
              productsInserted,
              growthRowsInserted,
              rowsSkipped
            });
          } catch (error) {
            logger.error('Error during import:', error);
            reject(error);
          }
        })
        .on('error', (error) => {
          logger.error('Error reading CSV file:', error);
          reject(error);
        });
    });
  }
}
