import type { IRetryStrategyOptions } from "@kontent-ai/core-sdk";
import { getDefaultLogger } from "../core/logs/loggers.js";
import type { Logger } from "../core/models/log.models.js";
import type { MigrationData } from "../core/models/migration.models.js";
import type { ExternalIdGenerator } from "../core/utils/external-id.utils.js";
import type { ManagementClientConfig } from "../core/utils/management-client-utils.js";
import type { SourceExportItem } from "../export/export.models.js";
import type { ImportResult } from "../import/import.models.js";
import { exportAsync } from "./export.js";
import { importAsync } from "./import.js";

export type MigrationSource = ManagementClientConfig & {
	readonly items: readonly SourceExportItem[];
	/**
	 * When enabled, the export process will skip missing items and assets instead of throwing errors.
	 * Missing references will be filtered out from the exported data.
	 * Default: false
	 */
	readonly skipMissingReferences?: boolean;
};

export type MigrationConfig = {
	readonly retryStrategy?: IRetryStrategyOptions;
	readonly externalIdGenerator?: ExternalIdGenerator;
	readonly logger?: Logger;
	readonly sourceEnvironment: MigrationSource;
	readonly targetEnvironment: ManagementClientConfig;
};

export type MigrationResult = {
	readonly migrationData: MigrationData;
	readonly importResult: ImportResult;
};

export async function migrateAsync(config: MigrationConfig): Promise<MigrationResult> {
	const logger = config.logger ?? getDefaultLogger();

	const migrationData = await exportAsync({
		...config.sourceEnvironment,
		logger: logger,
		exportItems: config.sourceEnvironment.items,
		skipMissingReferences: config.sourceEnvironment.skipMissingReferences,
	});

	const importResult = await importAsync({
		...config.targetEnvironment,
		logger: logger,
		data: migrationData,
		externalIdGenerator: config.externalIdGenerator,
	});

	return {
		importResult,
		migrationData,
	};
}
