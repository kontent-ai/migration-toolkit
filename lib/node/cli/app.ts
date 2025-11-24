#!/usr/bin/env node
import chalk from "chalk";
import { match } from "ts-pattern";
import { handleError } from "../../core/utils/error.utils.js";
import { exitProgram } from "../../core/utils/global.utils.js";
import { exportActionAsync } from "./actions/export-action.js";
import { importActionAsync } from "./actions/import-action.js";
import { migrateActionAsync } from "./actions/migrate-action.js";
import { argumentsFetcherAsync } from "./args/args-fetcher.js";
import { cliArgs } from "./commands.js";

// Need to register --help commands
cliArgs.registerCommands();

const run = async () => {
	const argsFetcher = await argumentsFetcherAsync();
	const action = argsFetcher.getCliAction();

	return await match(action)
		.with("export", async () => await exportActionAsync(argsFetcher))
		.with("import", async () => await importActionAsync(argsFetcher))
		.with("migrate", async () => await migrateActionAsync(argsFetcher))
		.otherwise(() =>
			exitProgram({
				message: `Invalid action '${chalk.red(action)}'`,
			}),
		);
};

run().catch((err) => {
	handleError(err);
});
