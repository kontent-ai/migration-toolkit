import chalk from "chalk";

const missingReferencesMessage = `You can skip missing references using the '${chalk.green('skipMissingReferences')}' option.`;

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
		super("missingItem", `Missing item with id '${chalk.red(id)}'. ${missingReferencesMessage}`);
	}
}

export class MissingAssetError extends MigrationToolkitError {
	constructor(public readonly id: string) {
		super("missingAsset", `Missing asset with id '${chalk.red(id)}'. ${missingReferencesMessage}`);
	}
}
