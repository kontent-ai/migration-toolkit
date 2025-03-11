import chalk from 'chalk';
import type { MigrationItem } from '../../core/index.js';

export function throwErrorForMigrationItem(migrationItem: MigrationItem, message: string): never {
    throw Error(
        `Impot failed for item '${chalk.yellow(migrationItem.system.codename)}' in language '${chalk.cyan(
            migrationItem.system.language
        )}'. Reason: ${message}`
    );
}
