import chalk from "chalk";
import { match, P } from "ts-pattern";
import type { ExportItem, ExportItemVersion } from "../../export/export.models.js";
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
		exportItem,
		exportItemVersion,
	}: {
		readonly exportItem: ExportItem;
		readonly exportItemVersion: ExportItemVersion;
		readonly element: FlattenedContentTypeElement;
		readonly contentType: FlattenedContentType;
		readonly value: unknown;
		readonly errorData: ErrorData;
	}) {
		const { missingReferenceId, isMissingReference } = match(errorData.error)
			.returnType<{ readonly missingReferenceId: string | undefined; readonly isMissingReference: boolean }>()
			.when(
				(m) => m instanceof MissingAssetError || m instanceof MissingItemError,
				(m) => {
					return {
						missingReferenceId: m.id,
						isMissingReference: true,
					};
				},
			)
			.otherwise(() => {
				return {
					missingReferenceId: undefined,
					isMissingReference: false,
				};
			});

		const getValueToDisplay = () => {
			let jsonValue: string | undefined;

			try {
				jsonValue = JSON.stringify(value, null, 2);
			} catch {
				jsonValue = undefined;
			}

			const baseValue = match(jsonValue)
				.returnType<string>()
				.with(P.string, (jsonValue) =>
					jsonValue
						.split("\n")
						.map((line) => `  ${line}`)
						.join("\n"),
				)
				.otherwise(() => value?.toString() ?? "");

			// Highlight missing reference ID in red if present
			return missingReferenceId ? baseValue.replaceAll(missingReferenceId, chalk.red(missingReferenceId)) : baseValue;
		};

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
			`  ${chalk.gray("├─")} Name:     ${chalk.yellow.bold(element.name ?? "n/a")}`,
			`  ${chalk.gray("├─")} Codename: ${chalk.yellow.bold(element.codename)}`,
			`  ${chalk.gray("├─")} Type:     ${chalk.green.bold(element.type)}`,
			`  ${chalk.gray("└─")} ID:       ${chalk.dim(element.id)}`,
			"",
			`${chalk.cyan("📦 Item:")}`,
			`  ${chalk.gray("├─")} Item codename: ${chalk.yellow.bold(exportItem.requestItem.itemCodename)}`,
			`  ${chalk.gray("├─")} Language codename: ${chalk.yellow.bold(exportItem.requestItem.languageCodename)}`,
			`  ${chalk.gray("└─")} Version codename: ${chalk.yellow.bold(exportItemVersion.workflowStepCodename)}`,
			"",
			`${chalk.cyan("📦 Item version:")}`,
			`  ${chalk.gray("├─")} Workflow step codename: ${chalk.yellow.bold(exportItemVersion.workflowStepCodename)}`,
			`  ${chalk.gray("└─")} Language variant: ${chalk.yellow.bold(exportItemVersion.languageVariant.language.codename ?? "n/a")}`,
			"",
			chalk.cyan("Invalid Value:"),
			chalk.dim(getValueToDisplay()),
			"",
			...match(errorData.message)
				.returnType<readonly string[]>()
				.with(P.string, (message) => [chalk.cyan("Error Details:"), chalk.gray(`  ${message}`), ""])
				.otherwise(() => []),
			...match(errorData.requestUrl)
				.returnType<readonly string[]>()
				.with(P.string, (requestUrl) => [chalk.cyan("Request URL:"), chalk.gray(`  ${requestUrl}`), ""])
				.otherwise(() => []),
			...match(isMissingReference)
				.returnType<readonly string[]>()
				.with(true, () => [chalk.cyan("💡 Tip:"), chalk.gray(`  ${missingReferencesMessage}`), ""])
				.otherwise(() => []),
		];

		super("invalidValue", lines.join("\n"));
	}
}
