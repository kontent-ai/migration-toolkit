import type { IRetryStrategyOptions } from '@kontent-ai/core-sdk';
import type { ExternalIdGenerator, Logger, ManagementClientConfig, MigrationData } from '../core/index.js';
import { getDefaultLogger } from '../core/index.js';
import type { SourceExportItem } from '../export/index.js';
import type { ImportResult } from '../import/index.js';
import { exportAsync } from './export.js';
import { importAsync } from './import.js';

export interface MigrationSource extends ManagementClientConfig {
    readonly items: readonly SourceExportItem[];
}

export interface MigrationConfig {
    readonly retryStrategy?: IRetryStrategyOptions;
    readonly externalIdGenerator?: ExternalIdGenerator;
    readonly logger?: Logger;
    readonly sourceEnvironment: MigrationSource;
    readonly targetEnvironment: ManagementClientConfig;
}

export interface MigrationResult {
    readonly migrationData: MigrationData;
    readonly importResult: ImportResult;
}

export async function migrateAsync(config: MigrationConfig): Promise<MigrationResult> {
    const logger = config.logger ?? getDefaultLogger();

    const migrationData = await exportAsync({
        ...config.sourceEnvironment,
        logger: logger,
        exportItems: config.sourceEnvironment.items
    });

    const importResult = await importAsync({
        ...config.targetEnvironment,
        logger: logger,
        data: migrationData,
        externalIdGenerator: config.externalIdGenerator
    });

    return {
        importResult,
        migrationData
    };
}
