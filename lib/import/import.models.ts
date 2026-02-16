import type {
	AssetFolderModels,
	AssetModels,
	CollectionModels,
	ContentItemModels,
	LanguageModels,
	LanguageVariantElements,
	LanguageVariantModels,
	ManagementClient,
	WorkflowModels,
} from "@kontent-ai/management-sdk";
import type {
	AssetStateInTargetEnvironmentByCodename,
	FlattenedContentType,
	FlattenedContentTypeElement,
	ItemProcessingResult,
	ItemStateInTargetEnvironmentByCodename,
	LanguageVariantStateInTargetEnvironmentByCodename,
	ReferencedDataInMigrationItems,
} from "../core/models/core.models.js";
import type { Logger } from "../core/models/log.models.js";
import type {
	MigrationAsset,
	MigrationData,
	MigrationElementTransformData,
	MigrationElementType,
	MigrationItem,
} from "../core/models/migration.models.js";
import type { ExternalIdGenerator } from "../core/utils/external-id.utils.js";
import type { ManagementClientConfig } from "../core/utils/management-client-utils.js";

export type ImportContextConfig = {
	readonly logger: Logger;
	readonly managementClient: Readonly<ManagementClient>;
	readonly externalIdGenerator: ExternalIdGenerator;
	readonly migrationData: MigrationData;
};

export type ImportContextEnvironmentData = {
	readonly languages: readonly Readonly<LanguageModels.LanguageModel>[];
	readonly assetFolders: readonly Readonly<AssetFolderModels.AssetFolder>[];
	readonly collections: readonly Readonly<CollectionModels.Collection>[];
	readonly workflows: readonly Readonly<WorkflowModels.Workflow>[];
	readonly types: readonly Readonly<FlattenedContentType>[];
};

export type GetFlattenedElementByCodenames = (
	contentTypeCodename: string,
	elementCodename: string,
	expectedElementType: MigrationElementType,
) => FlattenedContentTypeElement;

export type CategorizedImportData = {
	readonly assets: readonly MigrationAsset[];
	readonly contentItems: readonly MigrationItem[];
};

export type ImportContext = {
	readonly categorizedImportData: CategorizedImportData;
	readonly referencedData: ReferencedDataInMigrationItems;
	readonly environmentData: ImportContextEnvironmentData;
	readonly getItemStateInTargetEnvironment: (itemCodename: string) => ItemStateInTargetEnvironmentByCodename;
	readonly getLanguageVariantStateInTargetEnvironment: (
		itemCodename: string,
		languageCodename: string,
	) => LanguageVariantStateInTargetEnvironmentByCodename;
	readonly getAssetStateInTargetEnvironment: (assetCodename: string) => AssetStateInTargetEnvironmentByCodename;
	readonly getElement: GetFlattenedElementByCodenames;
};

export type ImportTransformFunc = (data: {
	readonly elementData: MigrationElementTransformData;
	readonly elementCodename: string;
	readonly importContext: ImportContext;
	readonly migrationItems: readonly MigrationItem[];
}) => LanguageVariantElements.ILanguageVariantElementBase;

export type ImportConfig = ManagementClientConfig & {
	readonly data: MigrationData;
	readonly externalIdGenerator?: ExternalIdGenerator;
	readonly createReportFile?: boolean;
	readonly logger?: Logger;
};

export type AssetToEdit = {
	readonly migrationAsset: MigrationAsset;
	readonly targetAsset: Readonly<AssetModels.Asset>;
	readonly replaceBinaryFile: boolean;
};

export type ImportedItem = ItemProcessingResult<MigrationItem, Readonly<ContentItemModels.ContentItem>>;
export type ImportedLanguageVariant = ItemProcessingResult<
	MigrationItem,
	readonly Readonly<LanguageVariantModels.ContentItemLanguageVariant>[]
>;
export type EditedAsset = ItemProcessingResult<AssetToEdit, Readonly<AssetModels.Asset>>;
export type ImportedAsset = ItemProcessingResult<MigrationAsset, Readonly<AssetModels.Asset>>;

export type ImportResult = {
	readonly uploadedAssets: readonly ImportedAsset[];
	readonly editedAssets: readonly EditedAsset[];
	readonly contentItems: readonly ImportedItem[];
	readonly languageVariants: readonly ImportedLanguageVariant[];
};
