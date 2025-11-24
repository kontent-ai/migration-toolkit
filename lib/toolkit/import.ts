import { writeFile } from "node:fs/promises";
import chalk from "chalk";
import { executeWithTrackingAsync } from "../core/utils/global.utils.js";
import type { ImportConfig, ImportResult } from "../import/import.models.js";
import { importManager as _importManager } from "../import/import-manager.js";
import { libMetadata } from "../metadata.js";

export async function importAsync(config: ImportConfig): Promise<ImportResult> {
	return await executeWithTrackingAsync({
		event: {
			tool: "migrationToolkit",
			package: {
				name: libMetadata.name,
				version: libMetadata.version,
			},
			action: "import",
			relatedEnvironmentId: undefined,
			details: {},
		},
		func: async () => {
			const importManager = _importManager(config);
			const importResult = await importManager.importAsync();

			if (config.createReportFile) {
				const reportFile = importManager.getReportFile(importResult);
				await writeFile(reportFile.filename, reportFile.content);
				config.logger?.log({
					type: "writeFs",
					message: `Report '${chalk.yellow(reportFile.filename)}' was created`,
				});
			}

			return importResult;
		},
		logger: config.logger,
	});
}
