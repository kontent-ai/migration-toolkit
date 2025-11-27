import { getDefaultLogger } from "../../../core/logs/loggers.js";
import { confirmExportAsync } from "../../../core/utils/confirm.utils.js";
import { defaultZipFilename } from "../../../core/utils/global.utils.js";
import { exportAsync } from "../../../toolkit/export.js";
import { storeAsync } from "../../../toolkit/file.js";
import type { CliArgumentsFetcher } from "../cli.models.js";

export async function exportActionAsync(cliFetcher: CliArgumentsFetcher): Promise<void> {
	const logger = getDefaultLogger();
	const language = cliFetcher.getRequiredArgumentValue("language");
	const environmentId = cliFetcher.getRequiredArgumentValue("sourceEnvironmentId");
	const apiKey = cliFetcher.getRequiredArgumentValue("sourceApiKey");
	const items = cliFetcher.getRequiredArgumentValue("items").split(",");
	const baseUrl = cliFetcher.getOptionalArgumentValue("baseUrl");
	const force = cliFetcher.getBooleanArgumentValue("force", false);
	const skipMissingReferences = cliFetcher.getBooleanArgumentValue("skipMissingReferences", false);
	const filename = cliFetcher.getOptionalArgumentValue("filename") ?? defaultZipFilename;

	await confirmExportAsync({
		force,
		apiKey,
		environmentId,
		logger,
		dataToExport: {
			itemsCount: items.length,
		},
		skipMissingReferences,
	});

	const exportedData = await exportAsync({
		logger,
		environmentId,
		apiKey,
		baseUrl,
		exportItems: items.map((m) => {
			return {
				itemCodename: m,
				languageCodename: language,
			};
		}),
		skipMissingReferences,
	});

	await storeAsync({
		data: exportedData,
		filename: filename,
		logger: logger,
	});

	logger.log({ type: "completed", message: `Export has been successful` });
}
