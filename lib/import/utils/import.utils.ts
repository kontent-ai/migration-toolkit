import chalk from "chalk";
import { MigrationToolkitError } from "../../core/models/error.models.js";
import type { MigrationItem } from "../../core/models/migration.models.js";

export function throwErrorForMigrationItem(migrationItem: MigrationItem, message: string): never {
	throw new MigrationToolkitError(
		"importFailedForItem",
		`Import failed for item '${chalk.yellow(migrationItem.system.codename)}' in language '${chalk.cyan(
			migrationItem.system.language,
		)}'. Reason: ${message}`,
	);
}
