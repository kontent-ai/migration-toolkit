export type ExternalIdGenerator = {
	readonly assetExternalId: (codename: string) => string | undefined;
	readonly contentItemExternalId: (codename: string) => string | undefined;
};

export const defaultExternalIdGenerator: ExternalIdGenerator = {
	assetExternalId: (codename) => `asset_${codename}`,
	contentItemExternalId: (codename) => `item_${codename}`,
};
