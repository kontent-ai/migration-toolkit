import { getDefaultLogger } from "../../../core/logs/loggers.js";
import { confirmImportAsync, type ItemPreview } from "../../../core/utils/confirm.utils.js";
import { defaultZipFilename } from "../../../core/utils/global.utils.js";
import { extractAsync } from "../../../toolkit/file.js";
import { importAsync } from "../../../toolkit/import.js";
import type { CliArgumentsFetcher } from "../cli.models.js";

export async function importActionAsync(argsFetcher: CliArgumentsFetcher): Promise<void> {
	const log = getDefaultLogger();
	const environmentId = argsFetcher.getRequiredArgumentValue("targetEnvironmentId");
	const apiKey = argsFetcher.getRequiredArgumentValue("targetApiKey");
	const baseUrl = argsFetcher.getOptionalArgumentValue("baseUrl");
	const createReportFile = argsFetcher.getBooleanArgumentValue("createReportFile", false);
	const force = argsFetcher.getBooleanArgumentValue("force", false);
	const filename = argsFetcher.getOptionalArgumentValue("filename") ?? defaultZipFilename;

	const importData = await extractAsync({
		logger: log,
		filename: filename,
	});
	const importItems: readonly ItemPreview[] = importData.items.map((item) => {
		return {
			itemCodename: item.system.codename,
			languageCodename: item.system.language.codename,
		};
	});

	await confirmImportAsync({
		force: force,
		apiKey: apiKey,
		environmentId: environmentId,
		logger: log,
		dataToImport: {
			importItems: importItems,
		},
	});

	await importAsync({
		logger: log,
		data: importData,
		baseUrl: baseUrl,
		environmentId: environmentId,
		apiKey: apiKey,
		createReportFile: createReportFile,
	});

	log.log({ type: "completed", message: `Import has been successful` });
}
