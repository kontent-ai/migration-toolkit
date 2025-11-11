import chalk from 'chalk';
import { writeFile } from 'fs/promises';
import type { ImportConfig, ImportResult } from '../import/index.js';
import { importManager as _importManager } from '../import/index.js';

export async function importAsync(config: ImportConfig): Promise<ImportResult> {
    const importManager = _importManager(config);
    const importResult = await importManager.importAsync();

    if (config.createReportFile) {
        const reportFile = importManager.getReportFile(importResult);
        await writeFile(reportFile.filename, reportFile.content);
        config.logger?.log({
            type: 'writeFs',
            message: `Report '${chalk.yellow(reportFile.filename)}' was created`
        });
    }

    return importResult;
}
