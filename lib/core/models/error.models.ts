import chalk from "chalk";
import { match, P } from "ts-pattern";
import type { ErrorData, FlattenedContentType, FlattenedContentTypeElement } from "./core.models.js";

const missingReferencesMessage = `You can skip missing references using the '${chalk.green("skipMissingReferences")}' option.`;

export type MigrationToolkitErrorType =
	| "confirmationRefused"
	| "invalidZip"
	| "invalidFolder"
	| "unsupportedCommand"
	| "importFailedForItem"
	| "invalidElement"
	| "exportFailedForItem"
	| "missingContentType"
	| "invalidEnvironment"
	| "exitProgram"
	| "missingItem"
	| "findRequiredError"
	| "missingWorkflowStep"
	| "missingAsset"
	| "missingTaxonomyTerm"
	| "invalidValue"
	| "invalidMultipleChoiceOption";

export class MigrationToolkitError extends Error {
	constructor(
		public readonly type: MigrationToolkitErrorType,
		readonly message: string,
	) {
		super(message);
	}
}

export class MissingItemError extends MigrationToolkitError {
	constructor(public readonly id: string) {
		super("missingItem", `Missing item with id '${chalk.red(id)}'`);
	}
}

export class MissingAssetError extends MigrationToolkitError {
	constructor(public readonly id: string) {
		super("missingAsset", `Missing asset with id '${chalk.red(id)}'`);
	}
}

export class InvalidValueError extends MigrationToolkitError {
	constructor({
		element,
		value,
		contentType,
		errorData,
	}: {
		readonly element: FlattenedContentTypeElement;
		readonly contentType: FlattenedContentType;
		readonly value: unknown;
		readonly errorData: ErrorData;
	}) {
		let jsonValue: string | undefined;

		try {
			jsonValue = JSON.stringify(value, null, 2);
		} catch {
			jsonValue = undefined;
		}

		const lines: readonly string[] = [
			"",
			chalk.red("❌ Invalid value error"),
			"",
			`${chalk.cyan("📝 Content type:")}`,
			`  ${chalk.gray("├─")} Name:     ${chalk.yellow.bold(contentType.name)}`,
			`  ${chalk.gray("├─")} Codename: ${chalk.yellow.bold(contentType.contentTypeCodename)}`,
			`  ${chalk.gray("└─")} ID:       ${chalk.dim(contentType.contentTypeId)}`,
			"",
			`${chalk.cyan("🔧 Element:")}`,
			`  ${chalk.gray("├─")} Name:     ${chalk.yellow.bold(element.name)}`,
			`  ${chalk.gray("├─")} Codename: ${chalk.yellow.bold(element.codename)}`,
			`  ${chalk.gray("├─")} Type:     ${chalk.green.bold(element.type)}`,
			`  ${chalk.gray("└─")} ID:       ${chalk.dim(element.id)}`,
			"",
			chalk.cyan("Invalid Value:"),
			chalk.dim(
				match(jsonValue)
					.returnType<unknown>()
					.with(P.string, (jsonValue) =>
						jsonValue
							.split("\n")
							.map((line) => `  ${line}`)
							.join("\n"),
					)
					.otherwise(() => value),
			),
			"",
			...match(errorData.message)
				.returnType<readonly string[]>()
				.with(P.string, (message) => [chalk.cyan("Error Details:"), chalk.gray(`  ${message}`), ""])
				.otherwise(() => []),
			...match(errorData.requestUrl)
				.returnType<readonly string[]>()
				.with(P.string, (requestUrl) => [chalk.cyan("Request URL:"), chalk.gray(`  ${requestUrl}`), ""])
				.otherwise(() => []),
			...match(errorData.error)
				.returnType<readonly string[]>()
				.when(
					(m) => m instanceof MissingAssetError || m instanceof MissingItemError,
					() => [chalk.cyan("💡 Tip:"), chalk.gray(`  ${missingReferencesMessage}`), ""],
				)
				.otherwise(() => []),
		];

		super("invalidValue", lines.join("\n"));
	}
}
