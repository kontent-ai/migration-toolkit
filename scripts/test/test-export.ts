import * as dotenv from "dotenv";
import { getDefaultLogger } from "../../lib/core/logs/loggers.js";
import { confirmExportAsync } from "../../lib/core/utils/confirm.utils.js";
import { handleError } from "../../lib/core/utils/error.utils.js";
import type { SourceExportItem } from "../../lib/export/export.models.js";
import { exportAsync, storeAsync } from "../../lib/index.js";
import { getEnvironmentRequiredValue } from "./utils/test.utils.js";

const run = async () => {
	dotenv.config({
		path: "../../.env.local",
	});

	const environmentId = getEnvironmentRequiredValue("sourceEnvironmentId");
	const apiKey = getEnvironmentRequiredValue("sourceApiKey");
	const logger = getDefaultLogger();
	const exportItem: readonly SourceExportItem[] = [
		{
			itemCodename: getEnvironmentRequiredValue("item"),
			languageCodename: getEnvironmentRequiredValue("language"),
		},
		{
			itemCodename: getEnvironmentRequiredValue("item"),
			languageCodename: getEnvironmentRequiredValue("languageSecondary"),
		},
	];

	await confirmExportAsync({
		force: false,
		apiKey: apiKey,
		environmentId: environmentId,
		skipMissingReferences: true,
		logger: logger,
		dataToExport: {
			itemsCount: exportItem.length,
		},
	});

	const exportData = await exportAsync({
		logger: logger,
		environmentId: environmentId,
		apiKey: apiKey,
		exportItems: exportItem,
		skipMissingReferences: true,
	});

	await storeAsync({
		data: exportData,
		filename: "data.zip",
	});
};

run().catch((error) => {
	handleError(error);
});
