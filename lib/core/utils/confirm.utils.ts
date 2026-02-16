import type { EnvironmentModels } from "@kontent-ai/management-sdk";
import chalk from "chalk";
import { match, P } from "ts-pattern";
import { MigrationToolkitError } from "../models/error.models.js";
import type { Logger } from "../models/log.models.js";
import { getMigrationManagementClient, managementClientUtils } from "./management-client-utils.js";

export async function confirmExportAsync(data: {
	readonly force: boolean;
	readonly environmentId: string;
	readonly apiKey: string;
	readonly logger: Logger;
	readonly skipMissingReferences: boolean;
	readonly dataToExport: {
		readonly itemsCount: number;
	};
}): Promise<void> {
	const environment = await managementClientUtils(
		getMigrationManagementClient({
			environmentId: data.environmentId,
			apiKey: data.apiKey,
		}),
		data.logger,
	).getEnvironmentAsync();

	const text = getConfirmText({
		action: "export",
		itemsCount: data.dataToExport.itemsCount,
		sourceEnvironment: environment,
		skipMissingReferences: data.skipMissingReferences,
	});

	await confirmAsync({
		force: data.force,
		logger: data.logger,
		action: "Export",
		message: text,
	});
}

export async function confirmMigrateAsync(data: {
	readonly force: boolean;
	readonly sourceEnvironment: {
		readonly environmentId: string;
		readonly apiKey: string;
	};
	readonly targetEnvironment: {
		readonly environmentId: string;
		readonly apiKey: string;
	};
	readonly skipMissingReferences: boolean;
	readonly logger: Logger;
	readonly dataToMigrate: {
		readonly itemsCount: number;
	};
}): Promise<void> {
	const sourceEnvironment = await managementClientUtils(
		getMigrationManagementClient({
			environmentId: data.sourceEnvironment.environmentId,
			apiKey: data.sourceEnvironment.apiKey,
		}),
		data.logger,
	).getEnvironmentAsync();
	const targetEnvironment = await managementClientUtils(
		getMigrationManagementClient({
			environmentId: data.targetEnvironment.environmentId,
			apiKey: data.targetEnvironment.apiKey,
		}),
		data.logger,
	).getEnvironmentAsync();

	const text = getConfirmText({
		action: "migrate",
		itemsCount: data.dataToMigrate.itemsCount,
		sourceEnvironment,
		targetEnvironment,
		skipMissingReferences: data.skipMissingReferences,
	});

	await confirmAsync({
		force: data.force,
		logger: data.logger,
		action: "Migrate",
		message: text,
	});
}

export async function confirmImportAsync(data: {
	readonly force: boolean;
	readonly environmentId: string;
	readonly apiKey: string;
	readonly logger: Logger;
	readonly dataToMigrate: {
		readonly itemsCount: number;
	};
}): Promise<void> {
	const environment = await managementClientUtils(
		getMigrationManagementClient({
			environmentId: data.environmentId,
			apiKey: data.apiKey,
		}),
		data.logger,
	).getEnvironmentAsync();

	const text = getConfirmText({
		action: "import",
		targetEnvironment: environment,
		itemsCount: data.dataToMigrate.itemsCount,
	});

	await confirmAsync({
		force: data.force,
		logger: data.logger,
		action: "Import",
		message: text,
	});
}

async function confirmAsync(data: {
	readonly action: string;
	readonly message: string;
	readonly force: boolean;
	readonly logger: Logger;
}): Promise<void> {
	// Prompts is imported dynamically because it's a node.js only module and would not work if user
	// tried using this library in a browser
	const prompts = await import("prompts");

	if (data.force) {
		data.logger.log({
			type: "info",
			message: `Skipping confirmation`,
		});
		return;
	}

	const confirmed = await prompts.default({
		type: "confirm",
		name: "confirm",
		message: `${chalk.cyan(data.action)}: ${data.message}`,
	});

	if (!confirmed.confirm) {
		throw new MigrationToolkitError("confirmationRefused", `Confirmation refused.`);
	}
}

function getConfirmText({
	action,
	itemsCount,
	sourceEnvironment,
	targetEnvironment,
	skipMissingReferences,
}: {
	readonly action: "export" | "import" | "migrate";
	readonly skipMissingReferences?: boolean;
	readonly itemsCount?: number;
	readonly sourceEnvironment?: EnvironmentModels.EnvironmentInformationModel;
	readonly targetEnvironment?: EnvironmentModels.EnvironmentInformationModel;
}): string {
	const lines: readonly string[] = [
		`\n${"=".repeat(70)}`,
		...match(action)
			.returnType<readonly string[]>()
			.with("export", () => [
				`${chalk.cyan("📤 Source environment:")}`,
				`  ${chalk.gray("├─")} Name:        ${chalk.yellow.bold(sourceEnvironment?.name)}`,
				`  ${chalk.gray("├─")} Environment: ${chalk.green.bold(sourceEnvironment?.environment)}`,
				`  ${chalk.gray("└─")} ID:          ${chalk.dim(sourceEnvironment?.id)}`,
			])
			.with("import", () => [
				`${chalk.cyan("📥 Target environment:")}`,
				`  ${chalk.gray("├─")} Name:        ${chalk.yellow.bold(targetEnvironment?.name)}`,
				`  ${chalk.gray("├─")} Environment: ${chalk.green.bold(targetEnvironment?.environment)}`,
				`  ${chalk.gray("└─")} ID:          ${chalk.dim(targetEnvironment?.id)}`,
			])
			.with("migrate", () => [
				`${chalk.cyan("📤 Source environment:")}`,
				`  ${chalk.gray("├─")} Name:        ${chalk.yellow.bold(sourceEnvironment?.name)}`,
				`  ${chalk.gray("├─")} Environment: ${chalk.green.bold(sourceEnvironment?.environment)}`,
				`  ${chalk.gray("└─")} ID:          ${chalk.dim(sourceEnvironment?.id)}`,
				`${chalk.cyan("📥 Target environment:")}`,
				`  ${chalk.gray("├─")} Name:        ${chalk.yellow.bold(targetEnvironment?.name)}`,
				`  ${chalk.gray("├─")} Environment: ${chalk.green.bold(targetEnvironment?.environment)}`,
				`  ${chalk.gray("└─")} ID:          ${chalk.dim(targetEnvironment?.id)}`,
			])
			.exhaustive(),
		"\n",
		...match(itemsCount)
			.returnType<readonly string[]>()
			.with(P.nonNullable, (itemsCount) => [
				`${chalk.cyan("📦 Items to process:")}`,
				`  ${chalk.gray("├─")} Count: ${chalk.green.bold(itemsCount)}`,
				"",
			])
			.otherwise(() => []),
		...match(action)
			.returnType<readonly string[]>()
			.with(P.union("export", "migrate"), () => [
				`${chalk.cyan("⚙️  Configuration:")}`,
				`  ${chalk.gray("└─")} Skip missing references: ${chalk.green.bold(skipMissingReferences ? "Yes" : "No")}`,
				"",
			])
			.otherwise(() => []),
		`${chalk.yellow("⚠")}  ${match(action)
			.returnType<string>()
			.with("export", () => "Are you sure you want to export the data?")
			.with("import", () => "Are you sure you want to import the data?")
			.with("migrate", () => "Are you sure you want to migrate the data?")
			.exhaustive()}`,
	];

	return lines.join("\n");
}
