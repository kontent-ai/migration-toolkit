import type { ContentTypeElements } from "@kontent-ai/management-sdk";
import { describe, expect, it } from "vitest";
import type {
	AssetStateInSourceEnvironmentById,
	FlattenedContentTypeElement,
	ItemStateInSourceEnvironmentById,
} from "../lib/core/models/core.models.js";
import { MissingAssetError, MissingItemError } from "../lib/core/models/error.models.js";
import type { ExportContext, ExportElement } from "../lib/export/export.models.js";
import { getMissingReferencePlaceholder } from "../lib/translation/helpers/export-placeholder.utils.js";
import { exportTransforms } from "../lib/translation/transforms/export-transforms.js";

// Mock context factory
function createMockContext({
	skipMissingReferences,
	itemStates,
	assetStates,
}: {
	readonly skipMissingReferences: boolean;
	readonly itemStates: Map<string, { readonly item?: { readonly codename: string } }>;
	readonly assetStates: Map<string, { readonly asset?: { readonly codename: string } }>;
}): ExportContext {
	return {
		exportContextOptions: {
			skipMissingReferences,
		},
		getItemStateInSourceEnvironment: (id: string): ItemStateInSourceEnvironmentById => {
			const state = itemStates.get(id);

			if (state?.item) {
				return {
					id,
					state: "exists",
					data: state.item as NonNullable<ItemStateInSourceEnvironmentById["data"]>,
				};
			}

			if (skipMissingReferences) {
				return {
					id,
					state: "skip",
				};
			}

			return {
				id,
				state: "doesNotExists",
			};
		},
		getAssetStateInSourceEnvironment: (id: string): AssetStateInSourceEnvironmentById => {
			const state = assetStates.get(id);

			if (state?.asset) {
				return {
					id,
					state: "exists",
					data: state.asset as NonNullable<AssetStateInSourceEnvironmentById["data"]>,
				};
			}

			if (skipMissingReferences) {
				return {
					id,
					state: "skip",
				};
			}

			return {
				id,
				state: "doesNotExists",
			};
		},
		environmentData: { assetFolders: [], collections: [], contentTypes: [], languages: [], taxonomies: [], workflows: [] },
		referencedData: { assetIds: new Set(), itemIds: new Set() },
		exportItems: [],
		getElement: (() => ({}) as FlattenedContentTypeElement) as ExportContext["getElement"],
	};
}

describe("Export Transforms - Asset Element", () => {
	const typeElement: FlattenedContentTypeElement = {
		codename: "asset_element",
		id: "element-id",
		type: "asset",
		name: "Asset",
		element: {} as ContentTypeElements.ContentTypeElementModel,
	};

	it("should export assets with valid references", () => {
		const assetStates = new Map([
			["asset-1", { asset: { codename: "my_asset_1" } }],
			["asset-2", { asset: { codename: "my_asset_2" } }],
		]);

		const context = createMockContext({ skipMissingReferences: false, itemStates: new Map(), assetStates });
		const exportElement: ExportElement = {
			value: [{ id: "asset-1" }, { id: "asset-2" }],
			components: [],
			urlSlugMode: undefined,
			displayTimezone: undefined,
		};

		const result = exportTransforms.asset({ context, typeElement, exportElement });

		expect(result.value).toEqual([{ codename: "my_asset_1" }, { codename: "my_asset_2" }]);
	});

	it("should throw error for missing asset when skipMissingReferences is false", () => {
		const assetStates = new Map([["asset-1", { asset: { codename: "my_asset_1" } }]]);

		const context = createMockContext({ skipMissingReferences: false, itemStates: new Map(), assetStates });
		const exportElement: ExportElement = {
			value: [{ id: "asset-1" }, { id: "missing-asset" }],
			components: [],
			urlSlugMode: undefined,
			displayTimezone: undefined,
		};

		expect(() => exportTransforms.asset({ context, typeElement, exportElement })).toThrow(new MissingAssetError("missing-asset"));
	});

	it("should skip missing asset when skipMissingReferences is true", () => {
		const assetStates = new Map([["asset-1", { asset: { codename: "my_asset_1" } }]]);

		const context = createMockContext({ skipMissingReferences: true, itemStates: new Map(), assetStates });
		const exportElement: ExportElement = {
			value: [{ id: "asset-1" }, { id: "missing-asset" }],
			components: [],
			urlSlugMode: undefined,
			displayTimezone: undefined,
		};

		const result = exportTransforms.asset({ context, typeElement, exportElement });

		expect(result.value).toEqual([{ codename: "my_asset_1" }]);
	});

	it("should handle empty asset array", () => {
		const context = createMockContext({ skipMissingReferences: false, itemStates: new Map(), assetStates: new Map() });
		const exportElement: ExportElement = {
			value: [],
			components: [],
			urlSlugMode: undefined,
			displayTimezone: undefined,
		};

		const result = exportTransforms.asset({ context, typeElement, exportElement });

		expect(result.value).toEqual([]);
	});

	it("should skip all assets when all are missing and skipMissingReferences is true", () => {
		const context = createMockContext({ skipMissingReferences: true, itemStates: new Map(), assetStates: new Map() });
		const exportElement: ExportElement = {
			value: [{ id: "missing-1" }, { id: "missing-2" }],
			components: [],
			urlSlugMode: undefined,
			displayTimezone: undefined,
		};

		const result = exportTransforms.asset({ context, typeElement, exportElement });

		expect(result.value).toEqual([]);
	});
});

describe("Export Transforms - Modular Content Element", () => {
	const typeElement: FlattenedContentTypeElement = {
		codename: "modular_content",
		id: "element-id",
		type: "modular_content",
		name: "Modular Content",
		element: {} as ContentTypeElements.ILinkedItemsElement,
	};

	it("should export items with valid references", () => {
		const itemStates = new Map([
			["item-1", { item: { codename: "my_item_1" } }],
			["item-2", { item: { codename: "my_item_2" } }],
		]);

		const context = createMockContext({ skipMissingReferences: false, itemStates, assetStates: new Map() });
		const exportElement: ExportElement = {
			value: [{ id: "item-1" }, { id: "item-2" }],
			components: [],
			urlSlugMode: undefined,
			displayTimezone: undefined,
		};

		const result = exportTransforms.modular_content({ context, typeElement, exportElement });

		expect(result.value).toEqual([{ codename: "my_item_1" }, { codename: "my_item_2" }]);
	});

	it("should throw error for missing item when skipMissingReferences is false", () => {
		const itemStates = new Map([["item-1", { item: { codename: "my_item_1" } }]]);

		const context = createMockContext({ skipMissingReferences: false, itemStates, assetStates: new Map() });
		const exportElement: ExportElement = {
			value: [{ id: "item-1" }, { id: "missing-item" }],
			components: [],
			urlSlugMode: undefined,
			displayTimezone: undefined,
		};

		expect(() => exportTransforms.modular_content({ context, typeElement, exportElement })).toThrow(
			new MissingItemError("missing-item"),
		);
	});

	it("should skip missing item when skipMissingReferences is true", () => {
		const itemStates = new Map([["item-1", { item: { codename: "my_item_1" } }]]);

		const context = createMockContext({ skipMissingReferences: true, itemStates, assetStates: new Map() });
		const exportElement: ExportElement = {
			value: [{ id: "item-1" }, { id: "missing-item" }],
			components: [],
			urlSlugMode: undefined,
			displayTimezone: undefined,
		};

		const result = exportTransforms.modular_content({ context, typeElement, exportElement });

		expect(result.value).toEqual([{ codename: "my_item_1" }]);
	});

	it("should handle empty items array", () => {
		const context = createMockContext({ skipMissingReferences: false, itemStates: new Map(), assetStates: new Map() });
		const exportElement: ExportElement = {
			value: [],
			components: [],
			urlSlugMode: undefined,
			displayTimezone: undefined,
		};

		const result = exportTransforms.modular_content({ context, typeElement, exportElement });

		expect(result.value).toEqual([]);
	});
});

describe("Export Transforms - Subpages Element", () => {
	const typeElement: FlattenedContentTypeElement = {
		codename: "subpages",
		id: "element-id",
		type: "subpages",
		name: "Subpages",
		element: {} as ContentTypeElements.ContentTypeElementModel,
	};

	it("should export subpages with valid references", () => {
		const itemStates = new Map([
			["page-1", { item: { codename: "my_page_1" } }],
			["page-2", { item: { codename: "my_page_2" } }],
		]);

		const context = createMockContext({ skipMissingReferences: false, itemStates, assetStates: new Map() });
		const exportElement: ExportElement = {
			value: [{ id: "page-1" }, { id: "page-2" }],
			components: [],
			urlSlugMode: undefined,
			displayTimezone: undefined,
		};

		const result = exportTransforms.subpages({ context, typeElement, exportElement });

		expect(result.value).toEqual([{ codename: "my_page_1" }, { codename: "my_page_2" }]);
	});

	it("should throw error for missing subpage when skipMissingReferences is false", () => {
		const itemStates = new Map([["page-1", { item: { codename: "my_page_1" } }]]);

		const context = createMockContext({ skipMissingReferences: false, itemStates, assetStates: new Map() });
		const exportElement: ExportElement = {
			value: [{ id: "page-1" }, { id: "missing-page" }],
			components: [],
			urlSlugMode: undefined,
			displayTimezone: undefined,
		};

		expect(() => exportTransforms.subpages({ context, typeElement, exportElement })).toThrow(new MissingItemError("missing-page"));
	});

	it("should skip missing subpage when skipMissingReferences is true", () => {
		const itemStates = new Map([["page-1", { item: { codename: "my_page_1" } }]]);

		const context = createMockContext({ skipMissingReferences: true, itemStates, assetStates: new Map() });
		const exportElement: ExportElement = {
			value: [{ id: "page-1" }, { id: "missing-page" }],
			components: [],
			urlSlugMode: undefined,
			displayTimezone: undefined,
		};

		const result = exportTransforms.subpages({ context, typeElement, exportElement });

		expect(result.value).toEqual([{ codename: "my_page_1" }]);
	});
});

describe("Export Transforms - Rich Text Element", () => {
	const typeElement: FlattenedContentTypeElement = {
		codename: "rich_text",
		id: "element-id",
		type: "rich_text",
		name: "Rich Text",
		element: {} as ContentTypeElements.ContentTypeElementModel,
	};

	it("should export rich text with valid item references", () => {
		const itemStates = new Map([["item-id-123", { item: { codename: "my_item" } }]]);

		const context = createMockContext({ skipMissingReferences: false, itemStates, assetStates: new Map() });
		const exportElement: ExportElement = {
			value: '<object type="application/kenticocloud" data-type="item" data-id="item-id-123"></object>',
			components: [],
			urlSlugMode: undefined,
			displayTimezone: undefined,
		};

		const result = exportTransforms.rich_text({ context, typeElement, exportElement });

		expect(result.value).toContain('data-codename="my_item"');
		expect(result.value).not.toContain("data-id=");
	});

	it("should export rich text with valid asset references", () => {
		const assetStates = new Map([["asset-id-456", { asset: { codename: "my_asset" } }]]);

		const context = createMockContext({ skipMissingReferences: false, itemStates: new Map(), assetStates });
		const exportElement: ExportElement = {
			value: '<figure data-asset-id="asset-id-456"><img src="#" data-asset-id="asset-id-456"></figure>',
			components: [],
			urlSlugMode: undefined,
			displayTimezone: undefined,
		};

		const result = exportTransforms.rich_text({ context, typeElement, exportElement });

		expect(result.value).toContain('data-asset-codename="my_asset"');
		expect(result.value).not.toContain("data-asset-id=");
	});

	it("should throw error for missing item in rich text when skipMissingReferences is false", () => {
		const context = createMockContext({ skipMissingReferences: false, itemStates: new Map(), assetStates: new Map() });
		const exportElement: ExportElement = {
			value: '<object type="application/kenticocloud" data-type="item" data-id="missing-item"></object>',
			components: [],
			urlSlugMode: undefined,
			displayTimezone: undefined,
		};

		expect(() => exportTransforms.rich_text({ context, typeElement, exportElement })).toThrow(new MissingItemError("missing-item"));
	});

	it("should use placeholder for missing item in rich text when skipMissingReferences is true", () => {
		const context = createMockContext({ skipMissingReferences: true, itemStates: new Map(), assetStates: new Map() });
		const exportElement: ExportElement = {
			value: '<object type="application/kenticocloud" data-type="item" data-id="missing-item"></object>',
			components: [],
			urlSlugMode: undefined,
			displayTimezone: undefined,
		};

		const result = exportTransforms.rich_text({ context, typeElement, exportElement });

		expect(result.value).toContain(getMissingReferencePlaceholder({ type: "item", id: "missing-item" }));
	});

	it("should throw error for missing asset in rich text when skipMissingReferences is false", () => {
		const context = createMockContext({ skipMissingReferences: false, itemStates: new Map(), assetStates: new Map() });
		const exportElement: ExportElement = {
			value: '<figure data-asset-id="missing-asset"><img src="#" data-asset-id="missing-asset"></figure>',
			components: [],
			urlSlugMode: undefined,
			displayTimezone: undefined,
		};

		expect(() => exportTransforms.rich_text({ context, typeElement, exportElement })).toThrow(new MissingAssetError("missing-asset"));
	});

	it("should use placeholder for missing asset in rich text when skipMissingReferences is true", () => {
		const context = createMockContext({ skipMissingReferences: true, itemStates: new Map(), assetStates: new Map() });
		const exportElement: ExportElement = {
			value: '<figure data-asset-id="missing-asset"><img src="#" data-asset-id="missing-asset"></figure>',
			components: [],
			urlSlugMode: undefined,
			displayTimezone: undefined,
		};

		const result = exportTransforms.rich_text({ context, typeElement, exportElement });

		expect(result.value).toContain(getMissingReferencePlaceholder({ type: "asset", id: "missing-asset" }));
	});

	it("should handle rich text with link item references", () => {
		const itemStates = new Map([["link-item-id", { item: { codename: "linked_item" } }]]);

		const context = createMockContext({ skipMissingReferences: false, itemStates, assetStates: new Map() });
		const exportElement: ExportElement = {
			value: '<a data-item-id="link-item-id">Link text</a>',
			components: [],
			urlSlugMode: undefined,
			displayTimezone: undefined,
		};

		const result = exportTransforms.rich_text({ context, typeElement, exportElement });

		expect(result.value).toContain('data-item-codename="linked_item"');
		expect(result.value).not.toContain("data-item-id=");
	});

	it("should handle rich text with link asset references", () => {
		const assetStates = new Map([["link-asset-id", { asset: { codename: "linked_asset" } }]]);

		const context = createMockContext({ skipMissingReferences: false, itemStates: new Map(), assetStates });
		const exportElement: ExportElement = {
			value: '<a data-asset-id="link-asset-id">Download</a>',
			components: [],
			urlSlugMode: undefined,
			displayTimezone: undefined,
		};

		const result = exportTransforms.rich_text({ context, typeElement, exportElement });

		expect(result.value).toContain('data-asset-codename="linked_asset"');
		expect(result.value).not.toContain("data-asset-id=");
	});

	it("should handle empty rich text", () => {
		const context = createMockContext({ skipMissingReferences: false, itemStates: new Map(), assetStates: new Map() });
		const exportElement: ExportElement = {
			value: undefined,
			components: [],
			urlSlugMode: undefined,
			displayTimezone: undefined,
		};

		const result = exportTransforms.rich_text({ context, typeElement, exportElement });

		expect(result.value).toBe("");
		expect(result.components).toEqual([]);
	});

	it("should handle rich text with mixed valid and missing references when skipMissingReferences is true", () => {
		const itemStates = new Map([["valid-item", { item: { codename: "valid_item" } }]]);
		const assetStates = new Map([["valid-asset", { asset: { codename: "valid_asset" } }]]);

		const context = createMockContext({ skipMissingReferences: true, itemStates, assetStates });
		const exportElement: ExportElement = {
			value:
				'<object type="application/kenticocloud" data-type="item" data-id="valid-item"></object>' +
				'<object type="application/kenticocloud" data-type="item" data-id="missing-item"></object>' +
				'<figure data-asset-id="valid-asset"><img src="#" data-asset-id="valid-asset"></figure>' +
				'<figure data-asset-id="missing-asset"><img src="#" data-asset-id="missing-asset"></figure>',
			components: [],
			urlSlugMode: undefined,
			displayTimezone: undefined,
		};

		const result = exportTransforms.rich_text({ context, typeElement, exportElement });

		expect(result.value).toContain('data-codename="valid_item"');
		expect(result.value).toContain(getMissingReferencePlaceholder({ type: "item", id: "missing-item" }));
		expect(result.value).toContain('data-asset-codename="valid_asset"');
		expect(result.value).toContain(getMissingReferencePlaceholder({ type: "asset", id: "missing-asset" }));
	});
});
