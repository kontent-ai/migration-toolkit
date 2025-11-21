import { confirmExportAsync, defaultZipFilename, getDefaultLogger } from '../../../core/index.js';
import { exportAsync, storeAsync } from '../../../toolkit/index.js';
import type { CliArgumentsFetcher } from '../cli.models.js';

export async function exportActionAsync(cliFetcher: CliArgumentsFetcher): Promise<void> {
    const logger = getDefaultLogger();
    const language = cliFetcher.getRequiredArgumentValue('language');
    const environmentId = cliFetcher.getRequiredArgumentValue('sourceEnvironmentId');
    const apiKey = cliFetcher.getRequiredArgumentValue('sourceApiKey');
    const items = cliFetcher.getRequiredArgumentValue('items').split(',');
    const baseUrl = cliFetcher.getOptionalArgumentValue('baseUrl');
    const force = cliFetcher.getBooleanArgumentValue('force', false);
    const skipMissingReferences = cliFetcher.getBooleanArgumentValue('skipMissingReferences', false);
    const filename = cliFetcher.getOptionalArgumentValue('filename') ?? defaultZipFilename;

    await confirmExportAsync({
        force,
        apiKey,
        environmentId,
        logger,
        dataToExport: {
            itemsCount: items.length
        }
    });

    const exportedData = await exportAsync({
        logger,
        environmentId,
        apiKey,
        baseUrl,
        exportItems: items.map((m) => {
            return {
                itemCodename: m,
                languageCodename: language
            };
        }),
        skipMissingReferences
    });

    await storeAsync({
        data: exportedData,
        filename: filename,
        logger: logger
    });

    logger.log({ type: 'completed', message: `Export has been successful` });
}
