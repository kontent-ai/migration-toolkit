import type { ContentTypeElements } from '@kontent-ai/management-sdk';
import { describe, expect, it } from 'vitest';
import type { ExportContext, ExportElement, FlattenedContentTypeElement } from '../lib/index.js';
import { exportTransforms } from '../lib/translation/transforms/export-transforms.js';

// Mock context factory
function createMockContext(
    skipMissingReferences: boolean,
    itemStates: Map<string, { item?: { codename: string } }>,
    assetStates: Map<string, { asset?: { codename: string } }>
): ExportContext {
    return {
        exportContextOptions: {
            skipMissingReferences
        },
        getItemStateInSourceEnvironment: (id: string) => {
            const state = itemStates.get(id);
            return {
                id,
                state: state?.item ? 'exists' : 'doesNotExists',
                item: state?.item as any
            };
        },
        getAssetStateInSourceEnvironment: (id: string) => {
            const state = assetStates.get(id);
            return {
                id,
                state: state?.asset ? 'exists' : 'doesNotExists',
                asset: state?.asset as any
            };
        },
        environmentData: {} as any,
        referencedData: {} as any,
        exportItems: [],
        getElement: (() => {}) as any
    };
}

describe('Export Transforms - Asset Element', () => {
    const typeElement: FlattenedContentTypeElement = {
        codename: 'asset_element',
        id: 'element-id',
        type: 'asset',
        element: {} as ContentTypeElements.ContentTypeElementModel
    };

    it('should export assets with valid references', () => {
        const assetStates = new Map([
            ['asset-1', { asset: { codename: 'my_asset_1' } }],
            ['asset-2', { asset: { codename: 'my_asset_2' } }]
        ]);

        const context = createMockContext(false, new Map(), assetStates);
        const exportElement: ExportElement = {
            value: [{ id: 'asset-1' }, { id: 'asset-2' }],
            components: [],
            urlSlugMode: undefined,
            displayTimezone: undefined
        };

        const result = exportTransforms.asset({ context, typeElement, exportElement });

        expect(result.value).toEqual([{ codename: 'my_asset_1' }, { codename: 'my_asset_2' }]);
    });

    it('should throw error for missing asset when skipMissingReferences is false', () => {
        const assetStates = new Map([['asset-1', { asset: { codename: 'my_asset_1' } }]]);

        const context = createMockContext(false, new Map(), assetStates);
        const exportElement: ExportElement = {
            value: [{ id: 'asset-1' }, { id: 'missing-asset' }],
            components: [],
            urlSlugMode: undefined,
            displayTimezone: undefined
        };

        expect(() => exportTransforms.asset({ context, typeElement, exportElement })).toThrow(
            "Missing asset with id 'missing-asset'"
        );
    });

    it('should skip missing asset when skipMissingReferences is true', () => {
        const assetStates = new Map([['asset-1', { asset: { codename: 'my_asset_1' } }]]);

        const context = createMockContext(true, new Map(), assetStates);
        const exportElement: ExportElement = {
            value: [{ id: 'asset-1' }, { id: 'missing-asset' }],
            components: [],
            urlSlugMode: undefined,
            displayTimezone: undefined
        };

        const result = exportTransforms.asset({ context, typeElement, exportElement });

        expect(result.value).toEqual([{ codename: 'my_asset_1' }]);
    });

    it('should handle empty asset array', () => {
        const context = createMockContext(false, new Map(), new Map());
        const exportElement: ExportElement = {
            value: [],
            components: [],
            urlSlugMode: undefined,
            displayTimezone: undefined
        };

        const result = exportTransforms.asset({ context, typeElement, exportElement });

        expect(result.value).toEqual([]);
    });

    it('should skip all assets when all are missing and skipMissingReferences is true', () => {
        const context = createMockContext(true, new Map(), new Map());
        const exportElement: ExportElement = {
            value: [{ id: 'missing-1' }, { id: 'missing-2' }],
            components: [],
            urlSlugMode: undefined,
            displayTimezone: undefined
        };

        const result = exportTransforms.asset({ context, typeElement, exportElement });

        expect(result.value).toEqual([]);
    });
});

describe('Export Transforms - Modular Content Element', () => {
    const typeElement: FlattenedContentTypeElement = {
        codename: 'modular_content',
        id: 'element-id',
        type: 'modular_content',
        element: {} as ContentTypeElements.ContentTypeElementModel
    };

    it('should export items with valid references', () => {
        const itemStates = new Map([
            ['item-1', { item: { codename: 'my_item_1' } }],
            ['item-2', { item: { codename: 'my_item_2' } }]
        ]);

        const context = createMockContext(false, itemStates, new Map());
        const exportElement: ExportElement = {
            value: [{ id: 'item-1' }, { id: 'item-2' }],
            components: [],
            urlSlugMode: undefined,
            displayTimezone: undefined
        };

        const result = exportTransforms.modular_content({ context, typeElement, exportElement });

        expect(result.value).toEqual([{ codename: 'my_item_1' }, { codename: 'my_item_2' }]);
    });

    it('should throw error for missing item when skipMissingReferences is false', () => {
        const itemStates = new Map([['item-1', { item: { codename: 'my_item_1' } }]]);

        const context = createMockContext(false, itemStates, new Map());
        const exportElement: ExportElement = {
            value: [{ id: 'item-1' }, { id: 'missing-item' }],
            components: [],
            urlSlugMode: undefined,
            displayTimezone: undefined
        };

        expect(() => exportTransforms.modular_content({ context, typeElement, exportElement })).toThrow(
            "Missing item with id 'missing-item'"
        );
    });

    it('should skip missing item when skipMissingReferences is true', () => {
        const itemStates = new Map([['item-1', { item: { codename: 'my_item_1' } }]]);

        const context = createMockContext(true, itemStates, new Map());
        const exportElement: ExportElement = {
            value: [{ id: 'item-1' }, { id: 'missing-item' }],
            components: [],
            urlSlugMode: undefined,
            displayTimezone: undefined
        };

        const result = exportTransforms.modular_content({ context, typeElement, exportElement });

        expect(result.value).toEqual([{ codename: 'my_item_1' }]);
    });

    it('should handle empty items array', () => {
        const context = createMockContext(false, new Map(), new Map());
        const exportElement: ExportElement = {
            value: [],
            components: [],
            urlSlugMode: undefined,
            displayTimezone: undefined
        };

        const result = exportTransforms.modular_content({ context, typeElement, exportElement });

        expect(result.value).toEqual([]);
    });
});

describe('Export Transforms - Subpages Element', () => {
    const typeElement: FlattenedContentTypeElement = {
        codename: 'subpages',
        id: 'element-id',
        type: 'subpages',
        element: {} as ContentTypeElements.ContentTypeElementModel
    };

    it('should export subpages with valid references', () => {
        const itemStates = new Map([
            ['page-1', { item: { codename: 'my_page_1' } }],
            ['page-2', { item: { codename: 'my_page_2' } }]
        ]);

        const context = createMockContext(false, itemStates, new Map());
        const exportElement: ExportElement = {
            value: [{ id: 'page-1' }, { id: 'page-2' }],
            components: [],
            urlSlugMode: undefined,
            displayTimezone: undefined
        };

        const result = exportTransforms.subpages({ context, typeElement, exportElement });

        expect(result.value).toEqual([{ codename: 'my_page_1' }, { codename: 'my_page_2' }]);
    });

    it('should throw error for missing subpage when skipMissingReferences is false', () => {
        const itemStates = new Map([['page-1', { item: { codename: 'my_page_1' } }]]);

        const context = createMockContext(false, itemStates, new Map());
        const exportElement: ExportElement = {
            value: [{ id: 'page-1' }, { id: 'missing-page' }],
            components: [],
            urlSlugMode: undefined,
            displayTimezone: undefined
        };

        expect(() => exportTransforms.subpages({ context, typeElement, exportElement })).toThrow(
            "Missing item with id 'missing-page'"
        );
    });

    it('should skip missing subpage when skipMissingReferences is true', () => {
        const itemStates = new Map([['page-1', { item: { codename: 'my_page_1' } }]]);

        const context = createMockContext(true, itemStates, new Map());
        const exportElement: ExportElement = {
            value: [{ id: 'page-1' }, { id: 'missing-page' }],
            components: [],
            urlSlugMode: undefined,
            displayTimezone: undefined
        };

        const result = exportTransforms.subpages({ context, typeElement, exportElement });

        expect(result.value).toEqual([{ codename: 'my_page_1' }]);
    });
});

describe('Export Transforms - Rich Text Element', () => {
    const typeElement: FlattenedContentTypeElement = {
        codename: 'rich_text',
        id: 'element-id',
        type: 'rich_text',
        element: {} as ContentTypeElements.ContentTypeElementModel
    };

    it('should export rich text with valid item references', () => {
        const itemStates = new Map([['item-id-123', { item: { codename: 'my_item' } }]]);

        const context = createMockContext(false, itemStates, new Map());
        const exportElement: ExportElement = {
            value: '<object type="application/kenticocloud" data-type="item" data-id="item-id-123"></object>',
            components: [],
            urlSlugMode: undefined,
            displayTimezone: undefined
        };

        const result = exportTransforms.rich_text({ context, typeElement, exportElement });

        expect(result.value).toContain('data-codename="my_item"');
        expect(result.value).not.toContain('data-id=');
    });

    it('should export rich text with valid asset references', () => {
        const assetStates = new Map([['asset-id-456', { asset: { codename: 'my_asset' } }]]);

        const context = createMockContext(false, new Map(), assetStates);
        const exportElement: ExportElement = {
            value: '<figure data-asset-id="asset-id-456"><img src="#" data-asset-id="asset-id-456"></figure>',
            components: [],
            urlSlugMode: undefined,
            displayTimezone: undefined
        };

        const result = exportTransforms.rich_text({ context, typeElement, exportElement });

        expect(result.value).toContain('data-asset-codename="my_asset"');
        expect(result.value).not.toContain('data-asset-id=');
    });

    it('should throw error for missing item in rich text when skipMissingReferences is false', () => {
        const context = createMockContext(false, new Map(), new Map());
        const exportElement: ExportElement = {
            value: '<object type="application/kenticocloud" data-type="item" data-id="missing-item"></object>',
            components: [],
            urlSlugMode: undefined,
            displayTimezone: undefined
        };

        expect(() => exportTransforms.rich_text({ context, typeElement, exportElement })).toThrow(
            "Failed to get item with id 'missing-item'"
        );
    });

    it('should use placeholder for missing item in rich text when skipMissingReferences is true', () => {
        const context = createMockContext(true, new Map(), new Map());
        const exportElement: ExportElement = {
            value: '<object type="application/kenticocloud" data-type="item" data-id="missing-item"></object>',
            components: [],
            urlSlugMode: undefined,
            displayTimezone: undefined
        };

        const result = exportTransforms.rich_text({ context, typeElement, exportElement });

        expect(result.value).toContain('__missing_item_missing-item__');
    });

    it('should throw error for missing asset in rich text when skipMissingReferences is false', () => {
        const context = createMockContext(false, new Map(), new Map());
        const exportElement: ExportElement = {
            value: '<figure data-asset-id="missing-asset"><img src="#" data-asset-id="missing-asset"></figure>',
            components: [],
            urlSlugMode: undefined,
            displayTimezone: undefined
        };

        expect(() => exportTransforms.rich_text({ context, typeElement, exportElement })).toThrow(
            "Failed to get asset with id 'missing-asset'"
        );
    });

    it('should use placeholder for missing asset in rich text when skipMissingReferences is true', () => {
        const context = createMockContext(true, new Map(), new Map());
        const exportElement: ExportElement = {
            value: '<figure data-asset-id="missing-asset"><img src="#" data-asset-id="missing-asset"></figure>',
            components: [],
            urlSlugMode: undefined,
            displayTimezone: undefined
        };

        const result = exportTransforms.rich_text({ context, typeElement, exportElement });

        expect(result.value).toContain('__missing_asset_missing-asset__');
    });

    it('should handle rich text with link item references', () => {
        const itemStates = new Map([['link-item-id', { item: { codename: 'linked_item' } }]]);

        const context = createMockContext(false, itemStates, new Map());
        const exportElement: ExportElement = {
            value: '<a data-item-id="link-item-id">Link text</a>',
            components: [],
            urlSlugMode: undefined,
            displayTimezone: undefined
        };

        const result = exportTransforms.rich_text({ context, typeElement, exportElement });

        expect(result.value).toContain('data-item-codename="linked_item"');
        expect(result.value).not.toContain('data-item-id=');
    });

    it('should handle rich text with link asset references', () => {
        const assetStates = new Map([['link-asset-id', { asset: { codename: 'linked_asset' } }]]);

        const context = createMockContext(false, new Map(), assetStates);
        const exportElement: ExportElement = {
            value: '<a data-asset-id="link-asset-id">Download</a>',
            components: [],
            urlSlugMode: undefined,
            displayTimezone: undefined
        };

        const result = exportTransforms.rich_text({ context, typeElement, exportElement });

        expect(result.value).toContain('data-asset-codename="linked_asset"');
        expect(result.value).not.toContain('data-asset-id=');
    });

    it('should handle empty rich text', () => {
        const context = createMockContext(false, new Map(), new Map());
        const exportElement: ExportElement = {
            value: undefined,
            components: [],
            urlSlugMode: undefined,
            displayTimezone: undefined
        };

        const result = exportTransforms.rich_text({ context, typeElement, exportElement });

        expect(result.value).toBe('');
        expect(result.components).toEqual([]);
    });

    it('should handle rich text with mixed valid and missing references when skipMissingReferences is true', () => {
        const itemStates = new Map([['valid-item', { item: { codename: 'valid_item' } }]]);
        const assetStates = new Map([['valid-asset', { asset: { codename: 'valid_asset' } }]]);

        const context = createMockContext(true, itemStates, assetStates);
        const exportElement: ExportElement = {
            value:
                '<object type="application/kenticocloud" data-type="item" data-id="valid-item"></object>' +
                '<object type="application/kenticocloud" data-type="item" data-id="missing-item"></object>' +
                '<figure data-asset-id="valid-asset"><img src="#" data-asset-id="valid-asset"></figure>' +
                '<figure data-asset-id="missing-asset"><img src="#" data-asset-id="missing-asset"></figure>',
            components: [],
            urlSlugMode: undefined,
            displayTimezone: undefined
        };

        const result = exportTransforms.rich_text({ context, typeElement, exportElement });

        expect(result.value).toContain('data-codename="valid_item"');
        expect(result.value).toContain('__missing_item_missing-item__');
        expect(result.value).toContain('data-asset-codename="valid_asset"');
        expect(result.value).toContain('__missing_asset_missing-asset__');
    });
});
