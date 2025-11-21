import chalk from 'chalk';
import { MigrationToolkitError } from '../../core/models/error.models.js';
import type { SourceExportItem } from '../export.models.js';

export function throwErrorForItemRequest(itemRequest: SourceExportItem, message: string): never {
    throw new MigrationToolkitError(
        'exportFailedForItem',
        `Export failed for item '${chalk.yellow(itemRequest.itemCodename)}' in language '${chalk.cyan(
            itemRequest.languageCodename
        )}'. Reason: ${message}`
    );
}
