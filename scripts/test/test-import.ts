import * as dotenv from "dotenv";
import { getDefaultLogger } from "../../lib/core/logs/loggers.js";
import { confirmImportAsync } from "../../lib/core/utils/confirm.utils.js";
import { handleError } from "../../lib/core/utils/error.utils.js";
import { extractAsync, importAsync } from "../../lib/index.js";
import { getEnvironmentRequiredValue } from "./utils/test.utils.js";

const run = async () => {
	dotenv.config({
		path: "../../.env.local",
	});

	const environmentId = getEnvironmentRequiredValue("targetEnvironmentId");
	const apiKey = getEnvironmentRequiredValue("targetApiKey");
	const log = getDefaultLogger();

	await confirmImportAsync({
		force: false,
		apiKey: apiKey,
		environmentId: environmentId,
		logger: log,
	});

	const data = await extractAsync({
		filename: "data.zip",
	});

	await importAsync({
		logger: log,
		data: data,
		environmentId: environmentId,
		apiKey: apiKey,
		createReportFile: true,
	});
};

run().catch((error) => {
	handleError(error);
});
