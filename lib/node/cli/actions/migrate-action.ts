import { confirmMigrateAsync, getDefaultLogger } from '../../../core/index.js';
import type { SourceExportItem } from '../../../export/index.js';
import { migrateAsync } from '../../../toolkit/index.js';
import type { CliArgumentsFetcher } from '../cli.models.js';

export async function migrateActionAsync(argsFetcher: CliArgumentsFetcher): Promise<void> {
    const logger = getDefaultLogger();
    const sourceEnvironmentId = argsFetcher.getRequiredArgumentValue('sourceEnvironmentId');
    const sourceApiKey = argsFetcher.getRequiredArgumentValue('sourceApiKey');
    const targetEnvironmentId = argsFetcher.getRequiredArgumentValue('targetEnvironmentId');
    const targetApiKey = argsFetcher.getRequiredArgumentValue('targetApiKey');
    const force = argsFetcher.getBooleanArgumentValue('force', false);
    const skipMissingReferences = argsFetcher.getBooleanArgumentValue('skipMissingReferences', false);
    const items = argsFetcher.getRequiredArgumentValue('items')?.split(',');
    const language = argsFetcher.getRequiredArgumentValue('language');
    const migrateItems: readonly SourceExportItem[] = items.map((m) => {
        return {
            itemCodename: m,
            languageCodename: language
        };
    });

    await confirmMigrateAsync({
        force,
        sourceEnvironment: {
            apiKey: sourceApiKey,
            environmentId: sourceEnvironmentId
        },
        targetEnvironment: {
            apiKey: targetApiKey,
            environmentId: targetEnvironmentId
        },
        logger,
        dataToMigrate: {
            itemsCount: migrateItems.length
        }
    });

    await migrateAsync({
        logger,
        sourceEnvironment: {
            environmentId: sourceEnvironmentId,
            apiKey: sourceApiKey,
            items: migrateItems,
            skipMissingReferences
        },
        targetEnvironment: {
            environmentId: targetEnvironmentId,
            apiKey: targetApiKey
        }
    });

    logger.log({ type: 'completed', message: `Migration has been successful` });
}
