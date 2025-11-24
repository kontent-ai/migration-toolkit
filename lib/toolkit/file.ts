import { Buffer as BufferProxy } from "buffer";
import { getDefaultLogger } from "../core/logs/loggers.js";
import { MigrationToolkitError } from "../core/models/error.models.js";
import type { Logger } from "../core/models/log.models.js";
import type { MigrationData } from "../core/models/migration.models.js";
import { defaultZipFilename, executeWithTrackingAsync } from "../core/utils/global.utils.js";
import { fileManager } from "../file/file-manager.js";
import { libMetadata } from "../metadata.js";
import { zipManager } from "../zip/zip-manager.js";

export interface StoreConfig {
	readonly data: MigrationData;
	readonly filename?: string;
	readonly logger?: Logger;
}

export interface ExtractConfig {
	readonly filename?: string;
	readonly logger?: Logger;
}

export async function storeAsync(config: StoreConfig): Promise<void> {
	const logger = config.logger ?? getDefaultLogger();
	const filename = config.filename ?? defaultZipFilename;

	await executeWithTrackingAsync<void>({
		event: {
			tool: "migrationToolkit",
			package: {
				name: libMetadata.name,
				version: libMetadata.version,
			},
			action: "store",
			relatedEnvironmentId: undefined,
			details: {},
		},
		func: async () => {
			const zipData = await zipManager(logger).createZipAsync(config.data);

			if (zipData instanceof BufferProxy) {
				await fileManager(logger).writeFileAsync(filename, zipData);
			} else {
				throw new MigrationToolkitError(
					"invalidZip",
					`Cannot store '${filename}' on File system because the provided zip is not a Buffer`,
				);
			}
		},
		logger: config.logger,
	});
}

export async function extractAsync(config: ExtractConfig): Promise<MigrationData> {
	const logger = config.logger ?? getDefaultLogger();
	const filename = config.filename ?? defaultZipFilename;

	return await executeWithTrackingAsync({
		event: {
			tool: "migrationToolkit",
			package: {
				name: libMetadata.name,
				version: libMetadata.version,
			},
			action: "extract",
			relatedEnvironmentId: undefined,
			details: {},
		},
		func: async () => {
			const fileData = await fileManager(logger).loadFileAsync(filename);
			return await zipManager(logger).parseZipAsync(fileData);
		},
		logger: config.logger,
	});
}
