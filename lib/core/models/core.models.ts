import type {
	AssetModels,
	ContentItemModels,
	ContentTypeElements,
	LanguageVariantModels,
	WorkflowModels,
} from "@kontent-ai/management-sdk";
import type { MigrationElementType } from "./migration.models.js";

export type LiteralUnion<T extends string> = T | (string & {});
export type TargetItemState = "exists" | "doesNotExists";
export type CliAction = "export" | "import" | "migrate";
export type EnvContext = "browser" | "node";

export type MapiAction =
	| "list"
	| "view"
	| "archive"
	| "unpublish"
	| "changeWorkflowStep"
	| "publish"
	| "upload"
	| "create"
	| "upsert"
	| "schedulePublish"
	| "scheduleUnpublish"
	| "cancelScheduledPublish"
	| "cancelScheduledUnpublish"
	| "createNewVersion";

export type MigrationItemType = "exportItem";

export type MapiType =
	| "contentType"
	| "assetFolder"
	| "asset"
	| "contentTypeSnippet"
	| "contentItem"
	| "languageVariant"
	| "language"
	| "collection"
	| "taxonomy"
	| "binaryFile"
	| "workflow";

export type LanguageVariantWorkflowStateValues = "published" | "archived" | "draft" | "scheduled";
export type LanguageVariantSchedulesStateValues = "scheduledPublish" | "scheduledUnpublish" | "n/a";
export type LanguageVariantWorkflowState =
	| {
			readonly workflowState: LanguageVariantWorkflowStateValues;
			readonly scheduledState: LanguageVariantSchedulesStateValues;
	  }
	| undefined;

export type ItemInfo = {
	readonly title: string;
	readonly itemType: MapiType | MigrationItemType;
};

export type ErrorData = {
	readonly message: string;
	readonly requestData: string | undefined;
	readonly requestUrl: string | undefined;
	readonly isUnknownError: boolean;
	readonly error: unknown;
};

export type ReferencedDataInMigrationItems = {
	readonly itemCodenames: ReadonlySet<string>;
	readonly assetCodenames: ReadonlySet<string>;
};

export type ReferencedDataInLanguageVariants = {
	readonly itemIds: ReadonlySet<string>;
	readonly assetIds: ReadonlySet<string>;
};

type DataStateInSourceEnvironmentById<T extends Readonly<ContentItemModels.ContentItem> | Readonly<AssetModels.Asset>> = {
	readonly id: string;
} & (
	| {
			readonly state: "exists";
			readonly data: T;
	  }
	| {
			readonly state: "doesNotExists";
			readonly data?: never;
	  }
	| {
			readonly state: "skip";
			readonly data?: never;
	  }
);

export type ItemStateInSourceEnvironmentById = DataStateInSourceEnvironmentById<Readonly<ContentItemModels.ContentItem>>;

export type AssetStateInSourceEnvironmentById = DataStateInSourceEnvironmentById<Readonly<AssetModels.Asset>>;

export type ItemStateInTargetEnvironmentByCodename = {
	readonly state: TargetItemState;
	readonly itemCodename: string;
	readonly item: Readonly<ContentItemModels.ContentItem> | undefined;
	readonly externalIdToUse: string;
};

export type LanguageVariantStateData = {
	readonly languageVariant: Readonly<LanguageVariantModels.ContentItemLanguageVariant> | undefined;
	readonly workflow: Readonly<WorkflowModels.Workflow> | undefined;
	readonly workflowState: LanguageVariantWorkflowState;
};

export type LanguageVariantStateInTargetEnvironmentByCodename = {
	readonly state: TargetItemState;
	readonly itemCodename: string;
	readonly languageCodename: string;
	readonly publishedLanguageVariant: LanguageVariantStateData | undefined;
	readonly draftLanguageVariant: LanguageVariantStateData | undefined;
};

export type AssetStateInTargetEnvironmentByCodename = {
	readonly state: TargetItemState;
	readonly assetCodename: string;
	readonly asset: Readonly<AssetModels.Asset> | undefined;
	readonly externalIdToUse: string;
};

export type PackageMetadata = {
	readonly created: Date;
	readonly environmentId: string;
	readonly dataOverview: PackageDataOverview;
};

export type PackageDataOverview = {
	readonly contentItemsCount: number;
	readonly assetsCount: number;
};

export type FlattenedContentTypeElement = {
	readonly codename: string;
	readonly name: string | undefined;
	readonly id: string;
	readonly type: MigrationElementType;
	readonly element: Readonly<ContentTypeElements.ContentTypeElementModel>;
};

export type FlattenedContentType = {
	readonly contentTypeCodename: string;
	readonly name: string;
	readonly contentTypeId: string;
	readonly elements: readonly FlattenedContentTypeElement[];
};

export type OriginalManagementError = {
	readonly response?: {
		readonly status?: number;
		readonly config?: {
			readonly url?: string;
			readonly data?: string;
		};
		readonly data?: {
			readonly error_code?: number;
		};
	};
};

export type ItemProcessingResult<InputItem, OutputItem> =
	| {
			readonly state: "valid";
			readonly inputItem: InputItem;
			readonly outputItem: OutputItem;
	  }
	| {
			readonly state: "error";
			readonly inputItem: InputItem;
			readonly error: unknown;
	  }
	| {
			readonly state: "404";
			readonly inputItem: InputItem;
	  };
