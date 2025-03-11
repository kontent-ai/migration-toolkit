import * as dotenv from 'dotenv';
import type { SourceExportItem } from '../../lib/index.js';
import { confirmMigrateAsync, getDefaultLogger, handleError, migrateAsync } from '../../lib/index.js';
import { getEnvironmentRequiredValue } from './utils/test.utils.js';

const run = async () => {
    dotenv.config({
        path: '../../.env.local'
    });

    const sourceEnvironmentId = getEnvironmentRequiredValue('sourceEnvironmentId');
    const sourceApiKey = getEnvironmentRequiredValue('sourceApiKey');
    const targetEnvironmentId = getEnvironmentRequiredValue('targetEnvironmentId');
    const targetApiKey = getEnvironmentRequiredValue('targetApiKey');
    const logger = getDefaultLogger();
    const itemsToMigrate: SourceExportItem[] = [
        {
            itemCodename: getEnvironmentRequiredValue('item'),
            languageCodename: getEnvironmentRequiredValue('language')
        }
    ];

    await confirmMigrateAsync({
        force: false,
        sourceEnvironment: {
            apiKey: sourceApiKey,
            environmentId: sourceEnvironmentId
        },
        targetEnvironment: {
            apiKey: targetApiKey,
            environmentId: targetEnvironmentId
        },
        logger: logger,
        dataToMigrate: {
            itemsCount: itemsToMigrate.length
        }
    });

    await migrateAsync({
        logger: logger,
        sourceEnvironment: {
            environmentId: sourceEnvironmentId,
            apiKey: sourceApiKey,
            items: itemsToMigrate
        },
        targetEnvironment: {
            environmentId: targetEnvironmentId,
            apiKey: targetApiKey
        }
    });
};

run().catch((error) => {
    handleError(error);
});
