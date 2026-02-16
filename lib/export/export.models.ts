import type {
	AssetFolderModels,
	CollectionModels,
	ContentItemModels,
	LanguageModels,
	LanguageVariantModels,
	ManagementClient,
	SharedModels,
	TaxonomyModels,
	WorkflowModels,
} from "@kontent-ai/management-sdk";
import type {
	AssetStateInSourceEnvironmentById,
	FlattenedContentType,
	FlattenedContentTypeElement,
	ItemStateInSourceEnvironmentById,
	ReferencedDataInLanguageVariants,
} from "../core/models/core.models.js";
import type { Logger } from "../core/models/log.models.js";
import type { MigrationComponent, MigrationElementTransformData, MigrationUrlSlugMode } from "../core/models/migration.models.js";
import type { ManagementClientConfig } from "../core/utils/management-client-utils.js";

export type ExportContextEnvironmentData = {
	readonly languages: readonly Readonly<LanguageModels.LanguageModel>[];
	readonly contentTypes: readonly Readonly<FlattenedContentType>[];
	readonly collections: readonly Readonly<CollectionModels.Collection>[];
	readonly assetFolders: readonly Readonly<AssetFolderModels.AssetFolder>[];
	readonly workflows: readonly Readonly<WorkflowModels.Workflow>[];
	readonly taxonomies: readonly Readonly<TaxonomyModels.Taxonomy>[];
};

export type ExportElementValue = string | number | SharedModels.ReferenceObject[] | undefined;

export type ExportElement = {
	readonly value: ExportElementValue;
	readonly components: readonly MigrationComponent[];
	readonly urlSlugMode: MigrationUrlSlugMode | undefined;
	readonly displayTimezone: string | undefined;
};

export type ExportTransformFunc = (data: {
	readonly typeElement: FlattenedContentTypeElement;
	readonly exportElement: ExportElement;
	readonly context: ExportContext;
}) => MigrationElementTransformData;

export type ExportContext = {
	readonly environmentData: ExportContextEnvironmentData;
	readonly referencedData: ReferencedDataInLanguageVariants;
	readonly getItemStateInSourceEnvironment: (id: string) => ItemStateInSourceEnvironmentById;
	readonly getAssetStateInSourceEnvironment: (id: string) => AssetStateInSourceEnvironmentById;
	readonly exportItems: readonly ExportItem[];
	readonly getElement: GetFlattenedElementByIds;
	readonly exportContextOptions: ExportContextOptions;
};

export type SourceExportItem = {
	readonly itemCodename: string;
	readonly languageCodename: string;
};

export type ExportContextOptions = {
	/**
	 * When enabled, the export process will skip missing items and assets instead of throwing errors.
	 * Missing references will be filtered out from the exported data.
	 * Default: false
	 */
	readonly skipMissingReferences?: boolean;
};

export type ExportConfig = ManagementClientConfig & {
	readonly exportItems: readonly SourceExportItem[];
	readonly logger?: Logger;
	/**
	 * When enabled, the export process will skip missing items and assets instead of throwing errors.
	 * Missing references will be filtered out from the exported data.
	 * Default: false
	 */
	readonly skipMissingReferences?: boolean;
};

export type DefaultExportContextConfig = {
	readonly logger: Logger;
	readonly exportItems: readonly SourceExportItem[];
	readonly managementClient: Readonly<ManagementClient>;
	readonly skipMissingReferences: boolean;
};

export type GetFlattenedElementByIds = (contentTypeId: string, elementId: string) => FlattenedContentTypeElement;

export type ExportItemVersion = {
	readonly workflowStepCodename: string;
	readonly languageVariant: Readonly<LanguageVariantModels.ContentItemLanguageVariant>;
};

export type ExportItem = {
	readonly requestItem: SourceExportItem;
	readonly versions: readonly ExportItemVersion[];
	readonly contentItem: Readonly<ContentItemModels.ContentItem>;

	readonly collection: Readonly<CollectionModels.Collection>;
	readonly language: Readonly<LanguageModels.LanguageModel>;
	readonly workflow: Readonly<WorkflowModels.Workflow>;
	readonly contentType: Readonly<FlattenedContentType>;
};
