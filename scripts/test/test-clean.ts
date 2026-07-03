import { cleanEnvironment } from "@kontent-ai/data-ops";
import * as dotenv from "dotenv";
import { getDefaultLogger } from "../../lib/core/logs/loggers.js";
import { confirmCleanAsync } from "../../lib/core/utils/confirm.utils.js";
import { handleError } from "../../lib/core/utils/error.utils.js";
import { getEnvironmentRequiredValue } from "./utils/test.utils.js";

const run = async () => {
	dotenv.config({
		path: "../../.env.local",
	});

	const environmentId = getEnvironmentRequiredValue("targetEnvironmentId");
	const apiKey = getEnvironmentRequiredValue("targetApiKey");
	const logger = getDefaultLogger();
	const entitiesToClean: Parameters<typeof cleanEnvironment>[0]["include"] = ["assets", "contentItems"];

	await confirmCleanAsync({
		force: false,
		apiKey: apiKey,
		environmentId: environmentId,
		logger: logger,
		dataToClean: {
			include: entitiesToClean,
		},
	});

	await cleanEnvironment({
		environmentId: environmentId,
		apiKey: apiKey,
		include: entitiesToClean,
		verbose: true,
	});
};

run().catch((error) => {
	handleError(error);
});
